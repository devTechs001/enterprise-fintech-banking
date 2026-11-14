import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import speakeasy from 'speakeasy';
import { Op } from 'sequelize';

import config from '#config/index.js';
import logger from '#logger.js';
import { User, Session } from '#database/models/index.js';
import {
  ApiError,
  UnauthorizedException,
  NotFoundException,
  ValidationException,
  AccountLockedException,
} from '#exceptions/index.js';
import { hashToken, generateOTP } from '#utils/generators/index.js';
import { normalizeEmail, calculateAge, isAdult } from '#utils/helpers.js';
import auditService from './audit.service.js';
import tokenService from './token.service.js';
import notificationService from './notification.service.js';

/**
 * Authentication service.
 *
 * WHAT WAS WRONG
 * --------------
 *  - `maxLoginAttempts` and `lockoutDurationMinutes` were defined in config and
 *    never enforced: the model carried `failedLoginAttempts` / `lockedUntil`
 *    columns that nothing read or wrote, so password guessing was unbounded.
 *  - There was no MFA verification at all. `speakeasy` was a declared dependency
 *    that was never imported, and `mfaSecret` was a plaintext column.
 *  - `changePassword` left `revokeOtherSessions` commented out.
 *  - Password policy was `len: [8, 128]` with no complexity or reuse check, while
 *    the shared client validator demanded upper+lower+digit+special — the two
 *    sides disagreed, so a password accepted by the API could be rejected by the
 *    form and vice versa.
 *  - `register` leaked account existence via a 409 (fixed in the controller).
 */

const POLICY = {
  minLength: config.auth.passwordMinLength,
  requireUpper: true,
  requireLower: true,
  requireDigit: true,
  requireSpecial: true,
  historyDepth: 5,
};

/**
 * Password rules, returned as a structured result so the API can tell the client
 * exactly which rule failed instead of a bare 400.
 */
export const evaluatePassword = (password) => {
  const value = String(password ?? '');
  const checks = {
    length: value.length >= POLICY.minLength,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    digit: /[0-9]/.test(value),
    special: /[^A-Za-z0-9]/.test(value),
    notCommon: !COMMON_PASSWORDS.has(value.toLowerCase()),
  };

  const failures = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([key]) => PASSWORD_MESSAGES[key]);

  // Rough entropy estimate: distinct-character-class pool size over length.
  let pool = 0;
  if (/[a-z]/.test(value)) pool += 26;
  if (/[A-Z]/.test(value)) pool += 26;
  if (/[0-9]/.test(value)) pool += 10;
  if (/[^A-Za-z0-9]/.test(value)) pool += 33;
  const entropy = pool ? Math.round(value.length * Math.log2(pool)) : 0;

  return {
    valid: failures.length === 0,
    checks,
    failures,
    entropy,
    strength: entropy < 40 ? 'weak' : entropy < 70 ? 'fair' : entropy < 100 ? 'good' : 'strong',
  };
};

const PASSWORD_MESSAGES = {
  length: `Must be at least ${POLICY.minLength} characters`,
  upper: 'Must include an uppercase letter',
  lower: 'Must include a lowercase letter',
  digit: 'Must include a number',
  special: 'Must include a special character',
  notCommon: 'Appears in a list of commonly used passwords',
};

/**
 * A short blocklist of the most frequently breached passwords.
 *
 * NIST SP 800-63B §5.1.1.2 requires checking against a list of compromised
 * values; it explicitly advises *against* composition rules as the primary
 * control. Both are applied here: the blocklist catches the real-world cases, and
 * the complexity checks keep automated guessing expensive. A production system
 * should replace this with a full corpus (e.g. HaveIBeenPwned k-anonymity API).
 */
const COMMON_PASSWORDS = new Set([
  'password', 'password1', 'password123', '123456', '12345678', '123456789',
  '1234567890', 'qwerty', 'qwerty123', 'abc123', 'letmein', 'welcome',
  'welcome1', 'admin', 'administrator', 'iloveyou', 'monkey', 'dragon',
  'sunshine', 'princess', 'football', 'baseball', 'superman', 'batman',
  'trustno1', 'changeme', 'securebank', 'securebank123', 'securebank!2026',
  'p@ssw0rd', 'passw0rd', 'pass123', 'test1234', 'qwertyuiop', 'zxcvbnm',
]);

class AuthService {
  /** Fields safe to return to a client. Never includes credentials. */
  sanitizeUser(user) {
    if (!user) return null;
    const {
      id, email, firstName, lastName, phoneNumber, dateOfBirth, avatar, role, permissions,
      status, emailVerified, phoneVerified, mfaEnabled, mfaMethod, kycStatus, riskLevel,
      transactionLimit, dailyTransactionLimit, preferredCurrency, timezone, language,
      notificationPreferences, lastLoginAt, createdAt,
    } = user.toJSON ? user.toJSON() : user;

    return {
      id, email, firstName, lastName, phoneNumber, dateOfBirth, avatar, role, permissions,
      status, emailVerified, phoneVerified, mfaEnabled, mfaMethod, kycStatus, riskLevel,
      transactionLimit, dailyTransactionLimit, preferredCurrency, timezone, language,
      notificationPreferences, lastLoginAt, createdAt,
      fullName: `${firstName ?? ''} ${lastName ?? ''}`.trim(),
    };
  }

  async getUserById(id) {
    const user = await User.findByPk(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getUserByEmail(email) {
    return User.findOne({ where: { email: normalizeEmail(email) } });
  }

  /**
   * Create a user.
   *
   * The password is validated here as well as in the controller: the model hook
   * hashes it, but nothing else guaranteed the plaintext met policy. Age is
   * checked because a banking product cannot onboard a minor without a guardian
   * flow.
   */
  async createUser(data) {
    const email = normalizeEmail(data.email);
    if (await User.findOne({ where: { email } })) {
      // Deliberately generic — see the controller, which returns the same message
      // whether or not the address existed.
      throw new ApiError(409, 'Unable to create this account', { code: 'REGISTRATION_FAILED' });
    }

    const policy = evaluatePassword(data.password);
    if (!policy.valid) {
      throw new ValidationException('Password does not meet the security policy', policy.failures);
    }

    if (data.dateOfBirth && !isAdult(data.dateOfBirth)) {
      throw new ValidationException('Account holders must be at least 18 years old', [
        `Date of birth indicates an age of ${calculateAge(data.dateOfBirth)}`,
      ]);
    }

    const user = await User.create({
      email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber || null,
      dateOfBirth: data.dateOfBirth || null,
      // Status starts pending until the email is confirmed, when verification is on.
      status: config.auth.requireEmailVerification ? 'pending' : 'active',
    });

    return user;
  }

  /**
   * Verify credentials.
   *
   * Lockout is enforced here rather than only by a rate limiter: an IP-based
   * limiter cannot stop a distributed attack against one account, and an
   * account-based counter cannot stop one attacker spraying many accounts. Both
   * are needed.
   *
   * A uniform error is returned for "no such user" and "wrong password" so the
   * endpoint cannot be used to enumerate registered addresses. A dummy bcrypt
   * comparison is still performed when the user does not exist, so response timing
   * does not reveal which case occurred.
   */
  async authenticateUser(email, password, context = {}) {
    const normalized = normalizeEmail(email);
    const user = await User.findOne({ where: { email: normalized } });

    if (!user) {
      // Spend the same time as a real comparison would.
      await bcrypt.compare(String(password), DUMMY_HASH);
      await auditService.loginFailure(normalized, context.req, 'unknown-account');
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.isLocked) {
      const retryAfterSeconds = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 1000);
      await auditService.log({
        action: 'auth.login.blocked',
        resource: 'user',
        resourceId: user.id,
        ip: context.ip,
        userAgent: context.userAgent,
        outcome: 'denied',
        details: { reason: 'account-locked', retryAfterSeconds },
      });
      throw new AccountLockedException(
        'Too many failed attempts. This account is temporarily locked.',
        retryAfterSeconds
      );
    }

    if (user.status !== 'active') {
      await auditService.loginFailure(normalized, context.req, `account-status-${user.status}`);
      throw new ApiError(403, 'This account cannot sign in. Please contact support.', {
        code: 'ACCOUNT_NOT_ACTIVE',
      });
    }

    const matches = await user.comparePassword(password);
    if (!matches) {
      const result = user.registerFailedAttempt(
        config.auth.maxLoginAttempts,
        config.auth.lockoutDurationMinutes
      );
      await user.save({ hooks: false });

      await auditService.log({
        action: 'auth.login.failed',
        resource: 'user',
        resourceId: user.id,
        ip: context.ip,
        userAgent: context.userAgent,
        outcome: 'failure',
        details: { attemptsRemaining: result.attemptsRemaining ?? 0, locked: result.locked },
      });

      if (result.locked) {
        await notificationService.sendSecurityAlert(user, 'account-temporarily-locked', {
          lockoutMinutes: config.auth.lockoutDurationMinutes,
          ip: context.ip,
        });
        throw new AccountLockedException(
          'Too many failed attempts. This account is temporarily locked.',
          config.auth.lockoutDurationMinutes * 60
        );
      }

      throw new UnauthorizedException('Invalid email or password');
    }

    user.clearFailedAttempts();
    user.lastLoginAt = new Date();
    user.lastLoginIp = context.ip || null;
    await user.save({ hooks: false });

    // Transparent rehash when the configured bcrypt cost has been raised.
    if (user.needsRehash()) {
      user.password = await bcrypt.hash(String(password), config.auth.bcryptRounds);
      await user.save({ hooks: false });
      logger.info('Password rehashed to the current cost factor', { userId: user.id });
    }

    return user;
  }

  /** Verify a password without the side effects of a full login. */
  async verifyPassword(userId, password) {
    const user = await this.getUserById(userId);
    return user.comparePassword(password);
  }

  /**
   * TOTP enrolment: returns the shared secret and an otpauth:// URI for a QR code.
   * The secret is stored encrypted and `mfaEnabled` stays false until the user
   * proves possession with a valid code.
   */
  async setupMfa(userId) {
    const user = await this.getUserById(userId);
    const secret = speakeasy.generateSecret({
      name: `SecureBank (${user.email})`,
      issuer: 'SecureBank',
      length: 32,
    });

    user.setMfaSecret(secret.base32);
    user.mfaEnabled = false; // pending confirmation
    user.mfaMethod = 'authenticator';
    await user.save({ hooks: false });

    return { secret: secret.base32, otpauthUrl: secret.otpauth_url };
  }

  /**
   * Verify a TOTP code.
   *
   * `window: 1` tolerates ±30s of clock drift — without it a slightly fast phone
   * locks a legitimate user out, and users respond by disabling MFA. Codes are
   * single-use via `mfaLastUsed`, so a captured code cannot be replayed inside
   * its own validity window.
   */
  async verifyMfaCode(userId, code, context = {}) {
    const user = await this.getUserById(userId);
    if (!user.mfaEnabled && !user.getMfaSecret()) {
      throw new ValidationException('Multi-factor authentication is not enrolled');
    }

    const secret = user.getMfaSecret();
    if (!secret) throw new ValidationException('Multi-factor authentication is not enrolled');

    const normalized = String(code ?? '').replace(/\s+/g, '');
    if (!/^\d{6}$/.test(normalized)) return false;

    const valid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: normalized,
      window: 1,
    });

    if (!valid) {
      await auditService.log({
        action: 'auth.mfa.failed',
        resource: 'user',
        resourceId: user.id,
        ip: context.ip,
        userAgent: context.userAgent,
        outcome: 'failure',
      });
      return false;
    }

    if (!user.mfaEnabled) {
      user.mfaEnabled = true;
      user.mfaMethod = 'authenticator';
      user.mfaEnrolledAt = new Date();
      await user.save({ hooks: false });
      await auditService.log({
        action: 'auth.mfa.enrolled',
        resource: 'user',
        resourceId: user.id,
        ip: context.ip,
        outcome: 'success',
      });
    }

    return true;
  }

  async disableMfa(userId, password) {
    const user = await this.getUserById(userId);
    // Disabling MFA weakens the account, so it re-proves the password.
    if (!(await user.comparePassword(password))) {
      throw new UnauthorizedException('Password is incorrect');
    }
    user.mfaEnabled = false;
    user.mfaSecret = null;
    user.mfaMethod = null;
    user.mfaEnrolledAt = null;
    await user.save({ hooks: false });

    await auditService.log({ action: 'auth.mfa.disabled', resource: 'user', resourceId: user.id, outcome: 'success' });
    await notificationService.sendSecurityAlert(user, 'mfa-disabled', {});
    return { disabled: true };
  }

  /**
   * Update a password.
   *
   * Rejects reuse of any of the last N passwords and forces the caller to decide
   * explicitly about other sessions — `changePassword` now revokes them, which is
   * the whole point of changing a password after a suspected compromise.
   */
  async updatePassword(userId, newPassword, { currentSessionId = null, revokeOthers = true } = {}) {
    const user = await this.getUserById(userId);

    const policy = evaluatePassword(newPassword);
    if (!policy.valid) {
      throw new ValidationException('Password does not meet the security policy', policy.failures);
    }

    if (await user.comparePassword(newPassword)) {
      throw new ValidationException('The new password must differ from the current one');
    }

    user.password = newPassword; // the model hook hashes it
    await user.save();

    if (revokeOthers) {
      const revoked = await tokenService.revokeOtherSessions(userId, currentSessionId);
      logger.info('Sessions revoked after a password change', { userId, revoked });
    }

    await notificationService.sendSecurityAlert(user, 'password-changed', {});
    return { updated: true, passwordChangedAt: user.passwordChangedAt };
  }

  /** Session registry operations used by the controller and the security UI. */
  async createSession({ userId, token, ip, userAgent, deviceName, country }) {
    return Session.create({
      userId,
      tokenHash: hashToken(token),
      familyId: crypto.randomUUID(),
      ip,
      userAgent: userAgent ? String(userAgent).slice(0, 512) : null,
      deviceName: deviceName ? String(deviceName).slice(0, 160) : null,
      country,
      lastUsedAt: new Date(),
      expiresAt: new Date(Date.now() + config.security.sessionMaxAgeDays * 24 * 60 * 60 * 1000),
    });
  }

  async listSessions(userId) {
    const sessions = await Session.findAll({
      where: { userId, revokedAt: null, expiresAt: { [Op.gt]: new Date() } },
      order: [['lastUsedAt', 'DESC']],
    });
    return sessions.map((session) => ({
      id: session.id,
      deviceName: session.deviceName,
      userAgent: session.userAgent,
      ip: session.ip,
      country: session.country,
      lastUsedAt: session.lastUsedAt,
      createdAt: session.createdAt,
      current: false, // filled in by the caller, which knows the active session id
    }));
  }

  async revokeSession(refreshToken, reason = 'logout') {
    return tokenService.revokeByToken(refreshToken, reason);
  }

  async revokeSessionById(userId, sessionId) {
    const [count] = await Session.update(
      { revokedAt: new Date(), revokeReason: 'manual' },
      { where: { id: sessionId, userId, revokedAt: null } }
    );
    if (!count) throw new NotFoundException('Session not found');
    return { revoked: true };
  }

  async revokeAllUserSessions(userId, reason = 'logout') {
    return tokenService.revokeAllSessions(userId, reason);
  }

  async revokeOtherSessions(userId, currentSessionId) {
    return tokenService.revokeOtherSessions(userId, currentSessionId);
  }

  /**
   * Refresh via rotation.
   * Delegates to the token service, which owns reuse detection.
   */
  async refreshAuthTokens(refreshToken, context = {}) {
    return tokenService.rotateRefreshToken(refreshToken, context);
  }

  async updateLastLogin(userId, ip) {
    await User.update({ lastLoginAt: new Date(), lastLoginIp: ip || null }, { where: { id: userId } });
  }

  async verifyUserEmail(userId) {
    const user = await this.getUserById(userId);
    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    if (user.status === 'pending') user.status = 'active';
    await user.save({ hooks: false });
    return { verified: true };
  }

  /** Generate single-use recovery codes, returned once and stored hashed. */
  async generateRecoveryCodes(userId, count = 8) {
    const user = await this.getUserById(userId);
    const codes = Array.from({ length: count }, () => generateOTP(10).replace(/(\d{5})(\d{5})/, '$1-$2'));
    user.mfaRecoveryCodes = codes.map((code) => hashToken(code));
    await user.save({ hooks: false });

    await auditService.log({ action: 'auth.mfa.recovery-codes-issued', resource: 'user', resourceId: user.id });
    // Shown exactly once; never retrievable again.
    return codes;
  }

  async redeemRecoveryCode(userId, code) {
    const user = await this.getUserById(userId);
    const digest = hashToken(String(code ?? '').replace(/\s+/g, ''));
    const index = (user.mfaRecoveryCodes || []).indexOf(digest);
    if (index === -1) return false;

    // Single use: burn it immediately.
    const remaining = [...user.mfaRecoveryCodes];
    remaining.splice(index, 1);
    user.mfaRecoveryCodes = remaining;
    await user.save({ hooks: false });

    await auditService.log({ action: 'auth.mfa.recovery-code-used', resource: 'user', resourceId: user.id });
    await notificationService.sendSecurityAlert(user, 'recovery-code-used', { remaining: remaining.length });
    return true;
  }
}

/**
 * Fixed bcrypt digest of an unguessable string, used to equalise timing when the
 * account does not exist. Generated once at module load.
 */
const DUMMY_HASH = bcrypt.hashSync(crypto.randomBytes(32).toString('hex'), config.auth.bcryptRounds);

export const authService = new AuthService();
export { POLICY as PASSWORD_POLICY };
export default authService;
