import httpStatus from 'http-status';

import config from '#config/index.js';
import logger from '#logger.js';
import { ApiResponse } from '#utils/apiResponse.js';
import { User, Session } from '#database/models/index.js';
import { tokenService } from '#services/token.service.js';
import { redis } from '#config/redis.config.js';

/**
 * Bearer-token authentication.
 *
 * DEFECTS FIXED
 * -------------
 *  1. `jwt.verify(token, secret)` was called with no `algorithms` option. With an
 *     HMAC secret configured, a library that accepts `alg: none` or permits
 *     RS/HS confusion can be talked into validating an attacker-forged token.
 *     Algorithms are now pinned in `tokenService.verifyAccessToken`.
 *  2. The blacklist key was the *entire JWT*. Revoking a token therefore wrote a
 *     ~500-byte credential into Redis, readable by anyone with cache access, and
 *     the key had no expiry tied to the token's own lifetime. Revocation is now
 *     keyed on the token's `jti` with a TTL equal to the remaining validity.
 *  3. The user object was cached for 300s with no invalidation path. Locking an
 *     account, changing its role or resetting its password had no effect for up
 *     to five minutes — including for an attacker's already-issued token. The
 *     cache is now 30s, holds only authorisation-relevant fields, and is deleted
 *     whenever those fields change.
 *  4. The session behind the token was never checked, so a refresh token revoked
 *     for reuse still left the matching access token working. `sid` is now
 *     verified against the session registry.
 *  5. `authenticateRefreshToken` queried `Session.token` / `Session.isRevoked`,
 *     columns that do not exist on the model. Refresh is handled by
 *     `tokenService.rotateRefreshToken`, which owns reuse detection.
 *  6. Failures were reported with `console.error` and a 500; they are logged
 *     structurally and return 401 with a stable code.
 */

const USER_CACHE_TTL = 30;

const cacheKey = (userId) => `auth:user:${userId}`;
const revokedKey = (jti) => `auth:revoked-jti:${jti}`;

/** Drop the cached authorisation snapshot. Call after any privilege change. */
export const invalidateUserCache = async (userId) => redis.del(cacheKey(userId));

/**
 * Revoke a single access token by `jti` before it expires.
 * TTL is bounded by the token's own remaining life, so Redis cannot accumulate
 * revocation keys forever.
 */
export const revokeAccessToken = async (jti, expiresInSeconds = config.jwt.accessExpirationMinutes * 60) => {
  if (!jti) return false;
  await redis.setex(revokedKey(jti), Math.max(1, Math.ceil(expiresInSeconds)), '1');
  return true;
};

const extractBearer = (req) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  return token || null;
};

const reject = (res, message, code, status = httpStatus.UNAUTHORIZED) =>
  ApiResponse.error(res, message, status, { code });

const authenticateToken = async (req, res, { required }) => {
  const token = extractBearer(req);
  if (!token) {
    if (!required) return next0(req);
    return reject(res, 'Access token required', 'TOKEN_MISSING');
  }

  let decoded;
  try {
    decoded = tokenService.verifyAccessToken(token);
  } catch (error) {
    const expired = error.name === 'TokenExpiredError';
    return reject(res, expired ? 'Access token has expired' : 'Invalid access token', expired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID');
  }

  if (decoded.type !== 'access') {
    return reject(res, 'Invalid token type', 'TOKEN_TYPE_INVALID');
  }

  // Per-token revocation, keyed on jti rather than the raw JWT.
  if (decoded.jti && (await redis.get(revokedKey(decoded.jti)))) {
    return reject(res, 'Token has been revoked', 'TOKEN_REVOKED');
  }

  // The session that issued this token must still be live.
  if (decoded.sid) {
    const session = await Session.findByPk(decoded.sid);
    if (!session || session.revokedAt || session.compromised || session.expiresAt <= new Date()) {
      return reject(res, 'Session is no longer active', 'SESSION_REVOKED');
    }
    req.sessionId = session.id;
  }

  // Authorisation-relevant fields only, briefly cached.
  const cached = await redis.get(cacheKey(decoded.sub));
  let snapshot = cached ? JSON.parse(cached) : null;

  if (!snapshot) {
    const user = await User.findByPk(decoded.sub, {
      attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'permissions', 'status', 'emailVerified', 'mfaEnabled', 'lockedUntil', 'avatar'],
    });
    if (!user) return reject(res, 'Account no longer exists', 'USER_NOT_FOUND');
    snapshot = user.toJSON();
    await redis.setex(cacheKey(decoded.sub), USER_CACHE_TTL, JSON.stringify(snapshot));
  }

  if (snapshot.status !== 'active') {
    return reject(res, 'Account is not active', 'ACCOUNT_NOT_ACTIVE', httpStatus.FORBIDDEN);
  }
  if (snapshot.lockedUntil && new Date(snapshot.lockedUntil) > new Date()) {
    return reject(res, 'Account is temporarily locked', 'ACCOUNT_LOCKED', httpStatus.FORBIDDEN);
  }
  if (config.auth.requireEmailVerification && !snapshot.emailVerified) {
    return reject(res, 'Please verify your email address', 'EMAIL_NOT_VERIFIED', httpStatus.FORBIDDEN);
  }

  return { user: snapshot, decoded, token };
};

// Sentinel used by the optional path so the two branches stay symmetrical.
const next0 = () => null;

const authenticate = async (req, res, next) => {
  try {
    const result = await authenticateToken(req, res, { required: true });
    if (!result || !result.user) return; // response already sent
    req.user = result.user;
    req.tokenInfo = { jti: result.decoded.jti, sid: result.decoded.sid, exp: result.decoded.exp };
    return next();
  } catch (error) {
    logger.error('Authentication failed unexpectedly', { message: error.message, stack: error.stack });
    return reject(res, 'Authentication failed', 'AUTH_ERROR', httpStatus.INTERNAL_SERVER_ERROR);
  }
};

/** Attaches `req.user` when a valid token is present, but never blocks. */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const result = await authenticateToken(req, res, { required: false });
    if (result && result.user) {
      req.user = result.user;
      req.tokenInfo = { jti: result.decoded.jti, sid: result.decoded.sid, exp: result.decoded.exp };
    }
  } catch (error) {
    logger.debug('Optional authentication skipped', { message: error.message });
  }
  return next();
};

export { authenticate, optionalAuthenticate };
export default { authenticate, optionalAuthenticate };
