import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import config from '#config/index.js';
import logger from '#logger.js';
import { Session, User } from '#database/models/index.js';
import { ApiError } from '#exceptions/index.js';
import { hashToken } from '#utils/generators/index.js';

/**
 * Token issuance, rotation and revocation.
 *
 * WHAT WAS WRONG
 * --------------
 * There was no token service at all: `auth.controller.js` imported `tokenService`
 * from `@/services`, which did not exist. `utils/jwt.js` was a separate stub with
 * no refresh-token handling, and JWT secrets fell back to the literal strings
 * `'your-access-secret'` / `'your-refresh-secret'`.
 *
 * WHAT THIS DOES
 * --------------
 * Access tokens are short-lived JWTs carrying a `jti` so an individual token can
 * be revoked before expiry. Refresh tokens are *opaque* random values, never JWTs:
 * only their SHA-256 digest is persisted, and they are single-use.
 *
 * Rotation with reuse detection is the important part. Each refresh creates a new
 * token and records `replacedByTokenHash` on the old row, all within a `familyId`.
 * If a token that has already been rotated is presented again, that is either a
 * replay or a race from a stolen token — so the whole family is revoked and the
 * user is signed out everywhere. Without this, a leaked refresh token is a
 * permanent credential.
 */

const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';

const requireSecrets = () => {
  if (!config.jwt.accessSecret || !config.jwt.refreshSecret) {
    throw new Error(
      'JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be configured before issuing tokens.'
    );
  }
};

/** Opaque, high-entropy token. Randomness is the whole security property. */
const generateOpaqueToken = (bytes = 48) => crypto.randomBytes(bytes).toString('base64url');

class TokenService {
  /**
   * Short-lived access token.
   * Claims are minimal — an access token is not a place to cache a profile.
   */
  generateAccessToken(user, sessionId = null) {
    requireSecrets();
    const payload = {
      sub: user.id,
      role: user.role,
      sid: sessionId,
      // Explicit type so a temp/MFA token can never be presented as an access
      // token, even though both are signed with the same key.
      type: 'access',
      jti: uuidv4(),
    };
    return jwt.sign(payload, config.jwt.accessSecret, {
      algorithm: config.jwt.algorithm,
      expiresIn: `${config.jwt.accessExpirationMinutes}m`,
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    });
  }

  /**
   * Verify an access token.
   * `algorithms` is pinned so a token cannot be re-signed with a different
   * algorithm, and issuer/audience must match so a token minted for another
   * service is rejected here.
   */
  verifyAccessToken(token) {
    requireSecrets();
    return jwt.verify(token, config.jwt.accessSecret, {
      algorithms: [config.jwt.algorithm],
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    });
  }

  /**
   * Issue a refresh token and persist its digest as a new session row.
   * @returns {{refreshToken:string, tokenHash:string, sessionId:string, expiresAt:Date}}
   */
  async issueRefreshToken({ userId, familyId = null, ip, userAgent, deviceName, country }) {
    const refreshToken = generateOpaqueToken();
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + config.jwt.refreshExpirationDays * 24 * 60 * 60 * 1000);

    const session = await Session.create({
      userId,
      tokenHash,
      familyId: familyId || uuidv4(),
      ip,
      userAgent: userAgent ? String(userAgent).slice(0, 512) : null,
      deviceName: deviceName ? String(deviceName).slice(0, 160) : null,
      country,
      lastUsedAt: new Date(),
      expiresAt,
    });

    return { refreshToken, tokenHash, sessionId: session.id, familyId: session.familyId, expiresAt };
  }

  /** Access + refresh pair for a freshly authenticated user. */
  async generateAuthTokens(userId, context = {}) {
    const user = await User.findByPk(userId);
    if (!user) throw ApiError.unauthorized('User no longer exists');
    if (!user.canAuthenticate) {
      throw new ApiError(403, 'Account is not active', { code: 'ACCOUNT_NOT_ACTIVE' });
    }

    const issued = await this.issueRefreshToken({ userId, ...context });
    const accessToken = this.generateAccessToken(user, issued.sessionId);

    return {
      accessToken,
      refreshToken: issued.refreshToken,
      sessionId: issued.sessionId,
      familyId: issued.familyId,
      expiresIn: config.jwt.accessExpirationMinutes * 60,
      tokenType: 'Bearer',
    };
  }

  /**
   * Rotate a refresh token.
   *
   * Rejects, in order: unknown token, expired, already revoked, and — critically —
   * already rotated. The last case revokes the entire family.
   */
  async rotateRefreshToken(presentedToken, context = {}) {
    if (!presentedToken) throw ApiError.unauthorized('Refresh token required', { code: 'TOKEN_MISSING' });

    const tokenHash = hashToken(presentedToken);
    const session = await Session.findOne({ where: { tokenHash } });

    if (!session) {
      logger.warn('Refresh attempt with an unrecognised token', { ip: context.ip });
      throw ApiError.unauthorized('Invalid refresh token', { code: 'TOKEN_INVALID' });
    }

    // Reuse detection: the token was already exchanged once.
    if (session.replacedByTokenHash) {
      session.compromised = true;
      await session.save();
      const revoked = await Session.update(
        { revokedAt: new Date(), revokeReason: 'reuse-detected' },
        { where: { userId: session.userId, familyId: session.familyId, revokedAt: null } }
      );
      logger.error('Refresh token reuse detected — session family revoked', {
        userId: session.userId,
        familyId: session.familyId,
        sessionsRevoked: revoked[0],
      });
      throw new ApiError(401, 'Session expired for security reasons. Please sign in again.', {
        code: 'TOKEN_REUSE_DETECTED',
      });
    }

    if (session.revokedAt) {
      throw ApiError.unauthorized('Session has been revoked', { code: 'TOKEN_REVOKED' });
    }
    if (session.expiresAt.getTime() <= Date.now()) {
      session.revokedAt = new Date();
      session.revokeReason = 'expired';
      await session.save();
      throw ApiError.unauthorized('Refresh token expired', { code: 'TOKEN_EXPIRED' });
    }

    const user = await User.findByPk(session.userId);
    if (!user || !user.canAuthenticate) {
      throw new ApiError(403, 'Account is not active', { code: 'ACCOUNT_NOT_ACTIVE' });
    }

    const issued = await this.issueRefreshToken({
      userId: session.userId,
      familyId: session.familyId,
      ip: context.ip,
      userAgent: context.userAgent,
      deviceName: context.deviceName,
      country: context.country,
    });

    session.replacedByTokenHash = issued.tokenHash;
    session.revokedAt = new Date();
    session.revokeReason = 'rotation';
    await session.save();

    return {
      accessToken: this.generateAccessToken(user, issued.sessionId),
      refreshToken: issued.refreshToken,
      sessionId: issued.sessionId,
      expiresIn: config.jwt.accessExpirationMinutes * 60,
      tokenType: 'Bearer',
    };
  }

  /**
   * Short-lived token that proves "password verified, MFA still pending".
   *
   * Deliberately NOT an access token: it carries `purpose: 'mfa'` and is rejected
   * by `verifyAccessToken` consumers, so completing the password step alone never
   * yields API access.
   */
  generateTempToken(userId, purpose = 'mfa') {
    requireSecrets();
    return jwt.sign({ sub: userId, purpose, type: 'temp' }, config.jwt.accessSecret, {
      algorithm: config.jwt.algorithm,
      expiresIn: `${config.auth.mfaTempTokenTtlSeconds}s`,
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    });
  }

  verifyTempToken(token, expectedPurpose = 'mfa') {
    requireSecrets();
    try {
      const payload = jwt.verify(token, config.jwt.accessSecret, {
        algorithms: [config.jwt.algorithm],
        issuer: config.jwt.issuer,
        audience: config.jwt.audience,
      });
      if (payload.purpose !== expectedPurpose) {
        throw ApiError.unauthorized('Token was issued for a different purpose', { code: 'TOKEN_PURPOSE_MISMATCH' });
      }
      return payload.sub;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.unauthorized('The verification step expired. Please sign in again.', { code: 'TOKEN_EXPIRED' });
    }
  }

  /**
   * Single-use link tokens (password reset, email verification).
   *
   * Only the digest is stored, so a database read cannot be replayed as a set of
   * live reset links. Verification consumes the token: expiry fields are cleared
   * on success.
   */
  async _issueOneTimeToken(user, kind, ttlMs) {
    const token = generateOpaqueToken(24);
    const digest = hashToken(token);
    const expiresAt = new Date(Date.now() + ttlMs);

    if (kind === 'password-reset') {
      user.resetTokenHash = digest;
      user.resetTokenExpiresAt = expiresAt;
    } else {
      user.verificationTokenHash = digest;
      user.verificationTokenExpiresAt = expiresAt;
    }
    await user.save({ hooks: false });
    return { token, expiresAt };
  }

  async _consumeOneTimeToken(userId, kind, presentedToken) {
    const user = await User.findByPk(userId);
    if (!user) throw ApiError.notFound('User not found');

    const digest = hashToken(presentedToken);
    const storedHash = kind === 'password-reset' ? user.resetTokenHash : user.verificationTokenHash;
    const storedExpiry = kind === 'password-reset' ? user.resetTokenExpiresAt : user.verificationTokenExpiresAt;

    // Clear before validating so a failure cannot be retried by brute force.
    if (kind === 'password-reset') {
      user.resetTokenHash = null;
      user.resetTokenExpiresAt = null;
    } else {
      user.verificationTokenHash = null;
      user.verificationTokenExpiresAt = null;
    }
    await user.save({ hooks: false });

    // Uniform message for every failure mode: expired, already used, wrong.
    const invalid = () => ApiError.badRequest('This link is invalid or has expired. Please request a new one.', {
      code: 'TOKEN_INVALID',
    });

    if (!storedHash || !storedExpiry) throw invalid();
    if (storedExpiry.getTime() <= Date.now()) throw invalid();

    const a = Buffer.from(digest, 'hex');
    const b = Buffer.from(String(storedHash), 'hex');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw invalid();

    return user;
  }

  generatePasswordResetToken(userId) {
    return User.findByPk(userId).then((user) => {
      if (!user) throw ApiError.notFound('User not found');
      return this._issueOneTimeToken(user, 'password-reset', config.auth.resetTokenTtlMinutes * 60 * 1000);
    });
  }

  async verifyPasswordResetToken(token) {
    if (!token) throw ApiError.badRequest('A reset token is required', { code: 'TOKEN_MISSING' });
    // The digest is the lookup key; find the row that holds it without a scan.
    const user = await User.findOne({ where: { resetTokenHash: hashToken(token) } });
    if (!user) throw ApiError.badRequest('This link is invalid or has expired. Please request a new one.', { code: 'TOKEN_INVALID' });
    await this._consumeOneTimeToken(user.id, 'password-reset', token);
    return user.id;
  }

  generateEmailVerificationToken(userId) {
    return User.findByPk(userId).then((user) => {
      if (!user) throw ApiError.notFound('User not found');
      return this._issueOneTimeToken(user, 'email-verification', config.auth.verificationTokenTtlHours * 60 * 60 * 1000);
    });
  }

  async verifyEmailVerificationToken(token) {
    if (!token) throw ApiError.badRequest('A verification token is required', { code: 'TOKEN_MISSING' });
    const user = await User.findOne({ where: { verificationTokenHash: hashToken(token) } });
    if (!user) throw ApiError.badRequest('This link is invalid or has expired. Please request a new one.', { code: 'TOKEN_INVALID' });
    await this._consumeOneTimeToken(user.id, 'email-verification', token);
    return user.id;
  }

  /** Cookie options for the refresh token: scoped path, HttpOnly, Strict. */
  refreshCookieOptions() {
    return {
      httpOnly: true,
      secure: config.security.secureCookies,
      sameSite: 'strict',
      // Scoped so the credential is not transmitted to unrelated endpoints.
      path: '/api/v1/auth',
      domain: config.security.cookieDomain,
      maxAge: config.jwt.refreshExpirationDays * 24 * 60 * 60 * 1000,
    };
  }

  clearCookieOptions() {
    const { maxAge, ...rest } = this.refreshCookieOptions();
    return rest;
  }

  /** Revoke one session by its refresh token digest. */
  async revokeByToken(refreshToken, reason = 'logout') {
    if (!refreshToken) return false;
    const [count] = await Session.update(
      { revokedAt: new Date(), revokeReason: reason },
      { where: { tokenHash: hashToken(refreshToken), revokedAt: null } }
    );
    return count > 0;
  }

  /**
   * Revoke every session for a user except the one making the request.
   *
   * This is what makes "change password" actually secure: previously the call was
   * commented out in the controller, so an attacker holding a valid session kept
   * access after the victim reset their password.
   */
  async revokeOtherSessions(userId, keepSessionId, reason = 'password-changed') {
    const where = keepSessionId
      ? { userId, revokedAt: null, id: { [Op.ne]: keepSessionId } }
      : { userId, revokedAt: null };

    const [count] = await Session.update({ revokedAt: new Date(), revokeReason: reason }, { where });
    return count;
  }

  async revokeAllSessions(userId, reason = 'logout') {
    const [count] = await Session.update(
      { revokedAt: new Date(), revokeReason: reason },
      { where: { userId, revokedAt: null } }
    );
    return count;
  }
}

export const tokenService = new TokenService();
export { ACCESS_COOKIE };
export default tokenService;
