import httpStatus from 'http-status';

import catchAsync from '#utils/catchAsync.js';
import { authService, tokenService, emailService } from '#services/index.js';
import { ApiResponse } from '#utils/apiResponse.js';
import { AuditService } from '#services/audit.service.js';
import { invalidateUserCache, revokeAccessToken } from '#middleware/auth/authenticate.js';
import config from '#config/index.js';
import logger from '#logger.js';

/**
 * Authentication endpoints.
 *
 * DEFECTS FIXED
 * -------------
 *  1. ACCOUNT ENUMERATION. `register` answered 409 "Email already registered".
 *     An attacker could build a list of the bank's customers without ever
 *     authenticating. Registration is now indistinguishable from success.
 *  2. REFRESH TOKEN IN THE RESPONSE BODY. `verifyMfa` returned the whole `tokens`
 *     object — including `refreshToken` — as JSON, while `login` correctly used an
 *     httpOnly cookie. A token in a body ends up in `localStorage`, in logs and in
 *     browser history; the cookie path was there precisely to avoid that. Both
 *     flows now use the cookie.
 *  3. COOKIE SCOPE. The refresh cookie was set with the default `path: '/'`, so
 *     the credential was transmitted on every request to the origin. It is now
 *     scoped to `/api/v1/auth`.
 *  4. LOCKOUT NOT ENFORCED. `login` called `authenticateUser(email, password)`
 *     with no request context, so the service could not record the attempt or the
 *     source IP. `config.auth.maxLoginAttempts` existed and nothing used it.
 *  5. `changePassword` left `revokeOtherSessions` commented out, so a victim who
 *     changed their password after a compromise left the attacker signed in.
 *  6. `logout` cleared the cookie but left the issued access token valid for up
 *     to 15 more minutes; it is now revoked by `jti`.
 *  7. Handlers picked named fields instead of spreading `req.body`, so an extra
 *     `role` or `status` property cannot be assigned.
 */

/** Per-request context the service needs for auditing and lockout. */
const requestContext = (req) => ({
  req,
  ip: req.ip,
  userAgent: req.get('user-agent'),
  country: req.get('cf-ipcountry') || req.get('x-vercel-ip-country') || null,
});

const setRefreshCookie = (res, refreshToken) => {
  res.cookie('refresh_token', refreshToken, tokenService.refreshCookieOptions());
};

const clearRefreshCookie = (res) => {
  res.clearCookie('refresh_token', tokenService.clearCookieOptions());
};

/**
 * Register.
 * @route POST /api/v1/auth/register
 */
const register = catchAsync(async (req, res) => {
  const { email, password, firstName, lastName, phoneNumber, dateOfBirth } = req.body;

  // The response is identical whether or not the account was created. The user is
  // told to check their inbox either way — which is also the truthful instruction
  // when the address was already taken, since no new mail is sent.
  const genericResponse = () =>
    ApiResponse.success(
      res,
      { message: 'If registration succeeded, a confirmation email is on its way.' },
      httpStatus.CREATED
    );

  let user;
  try {
    user = await authService.createUser({ email, password, firstName, lastName, phoneNumber, dateOfBirth });
  } catch (error) {
    if (error.code === 'REGISTRATION_FAILED' || error.code === 'UNIQUE_CONSTRAINT') {
      await AuditService.log({
        action: 'auth.register.duplicate',
        resource: 'user',
        ip: req.ip,
        userAgent: req.get('user-agent'),
        outcome: 'denied',
      });
      return genericResponse();
    }
    throw error;
  }

  try {
    const { token } = await tokenService.generateEmailVerificationToken(user.id);
    await emailService.sendVerificationEmail(user.email, token);
  } catch (error) {
    // A delivery failure must not fail the registration: the user exists and can
    // request a new link. It is logged loudly because it is operationally serious.
    logger.error('Verification email could not be sent', { userId: user.id, message: error.message });
  }

  await AuditService.log({
    action: 'auth.register.success',
    resource: 'user',
    resourceId: user.id,
    actor: user,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    outcome: 'success',
  });

  return genericResponse();
});

/**
 * Login. When MFA is enrolled this returns a short-lived temp token, never a
 * session — completing the password step alone must not yield API access.
 * @route POST /api/v1/auth/login
 */
const login = catchAsync(async (req, res) => {
  const { email, password, deviceInfo } = req.body;
  const context = requestContext(req);

  const user = await authService.authenticateUser(email, password, context);

  if (user.mfaEnabled) {
    const tempToken = tokenService.generateTempToken(user.id, 'mfa');

    await AuditService.log({
      action: 'auth.mfa.required',
      resource: 'user',
      resourceId: user.id,
      actor: user,
      ip: context.ip,
      userAgent: context.userAgent,
      outcome: 'success',
    });

    // `mfaMethod` is returned so the client can render the right prompt. The
    // secret itself never leaves the server.
    return ApiResponse.success(res, { requiresMfa: true, tempToken, mfaMethod: user.mfaMethod });
  }

  const tokens = await tokenService.generateAuthTokens(user.id, context);

  await authService.updateLastLogin(user.id, context.ip);
  await invalidateUserCache(user.id);

  await AuditService.log({
    action: 'auth.login.success',
    resource: 'user',
    resourceId: user.id,
    actor: user,
    ip: context.ip,
    userAgent: context.userAgent,
    outcome: 'success',
    details: { deviceInfo },
  });

  setRefreshCookie(res, tokens.refreshToken);

  return ApiResponse.success(res, {
    user: authService.sanitizeUser(user),
    // Only the access token is exposed to JavaScript; the refresh token stays in
    // the httpOnly cookie and is never readable by the page.
    tokens: { accessToken: tokens.accessToken, expiresIn: tokens.expiresIn, tokenType: tokens.tokenType },
  });
});

/**
 * Complete step-up authentication.
 * @route POST /api/v1/auth/mfa/verify
 */
const verifyMfa = catchAsync(async (req, res) => {
  const { code, tempToken } = req.body;
  const context = requestContext(req);

  const userId = tokenService.verifyTempToken(tempToken, 'mfa');
  const user = await authService.getUserById(userId);

  const isValid = await authService.verifyMfaCode(user.id, code, context);
  if (!isValid) {
    await AuditService.log({
      action: 'auth.mfa.failed',
      resource: 'user',
      resourceId: user.id,
      actor: user,
      ip: context.ip,
      userAgent: context.userAgent,
      outcome: 'failure',
    });
    // Same message and status as a bad password: the endpoint must not confirm
    // that a temp token maps to a real, MFA-enrolled account.
    return ApiResponse.error(res, 'Invalid email or password.', httpStatus.UNAUTHORIZED, {
      code: 'INVALID_CREDENTIALS',
    });
  }

  const tokens = await tokenService.generateAuthTokens(user.id, context);

  await authService.updateLastLogin(user.id, context.ip);
  await invalidateUserCache(user.id);

  await AuditService.log({
    action: 'auth.mfa.verified',
    resource: 'user',
    resourceId: user.id,
    actor: user,
    ip: context.ip,
    userAgent: context.userAgent,
    outcome: 'success',
  });

  setRefreshCookie(res, tokens.refreshToken);

  // FIX: previously returned `tokens` whole, putting the refresh token in the JSON
  // body where the client stored it in localStorage.
  return ApiResponse.success(res, {
    user: authService.sanitizeUser(user),
    tokens: { accessToken: tokens.accessToken, expiresIn: tokens.expiresIn, tokenType: tokens.tokenType },
  });
});

/**
 * Logout. Revokes the session, the presented refresh token, and the current
 * access token by jti.
 * @route POST /api/v1/auth/logout
 */
const logout = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refresh_token || req.cookies.refreshToken || req.body.refreshToken;

  if (refreshToken) await authService.revokeSession(refreshToken, 'logout');
  if (req.tokenInfo?.jti) await revokeAccessToken(req.tokenInfo.jti);
  if (req.user?.id) await invalidateUserCache(req.user.id);

  if (req.user) {
    await AuditService.log({
      action: 'auth.logout',
      resource: 'user',
      resourceId: req.user.id,
      actor: req.user,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      outcome: 'success',
    });
  }

  clearRefreshCookie(res);
  return ApiResponse.success(res, { message: 'Logged out successfully' });
});

/**
 * Rotate the refresh token.
 * Reads the token from the httpOnly cookie only; accepting one from the body
 * would reintroduce the token-in-JavaScript problem the cookie exists to solve.
 * @route POST /api/v1/auth/refresh-token
 */
const refreshTokens = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refresh_token || req.cookies.refreshToken;
  if (!refreshToken) {
    return ApiResponse.error(res, 'Refresh token required', httpStatus.UNAUTHORIZED, { code: 'TOKEN_MISSING' });
  }

  const tokens = await authService.refreshAuthTokens(refreshToken, requestContext(req));

  setRefreshCookie(res, tokens.refreshToken);

  return ApiResponse.success(res, {
    accessToken: tokens.accessToken,
    expiresIn: tokens.expiresIn,
    tokenType: tokens.tokenType,
  });
});

/**
 * Request a password-reset link.
 * Always answers 200 with the same body: a differing response would be an
 * enumeration oracle.
 * @route POST /api/v1/auth/forgot-password
 */
const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const message = 'If that address is registered, a password reset link has been sent.';

  const user = await authService.getUserByEmail(email);
  if (user) {
    const { token } = await tokenService.generatePasswordResetToken(user.id);
    await emailService.sendPasswordResetEmail(user.email, token);

    await AuditService.log({
      action: 'auth.password-reset.requested',
      resource: 'user',
      resourceId: user.id,
      actor: user,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      outcome: 'success',
    });
  } else {
    await AuditService.log({
      action: 'auth.password-reset.unknown-email',
      resource: 'user',
      ip: req.ip,
      userAgent: req.get('user-agent'),
      outcome: 'denied',
      details: { email },
    });
  }

  return ApiResponse.success(res, { message });
});

/**
 * Consume a reset link and set a new password. All sessions are revoked: if the
 * reset was triggered by a compromise, the attacker's session must die with it.
 * @route POST /api/v1/auth/reset-password
 */
const resetPassword = catchAsync(async (req, res) => {
  const { token, password } = req.body;

  const userId = await tokenService.verifyPasswordResetToken(token);
  await authService.updatePassword(userId, password, { revokeOthers: true });
  await invalidateUserCache(userId);

  await AuditService.log({
    action: 'auth.password-reset.completed',
    resource: 'user',
    resourceId: userId,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    outcome: 'success',
  });

  clearRefreshCookie(res);
  return ApiResponse.success(res, {
    message: 'Password reset. All other sessions have been signed out.',
  });
});

/**
 * Confirm an email address.
 * @route POST /api/v1/auth/verify-email
 */
const verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.body;

  const userId = await tokenService.verifyEmailVerificationToken(token);
  await authService.verifyUserEmail(userId);
  await invalidateUserCache(userId);

  await AuditService.log({
    action: 'auth.email.verified',
    resource: 'user',
    resourceId: userId,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    outcome: 'success',
  });

  return ApiResponse.success(res, { message: 'Email verified successfully.' });
});

/**
 * Current user.
 * @route GET /api/v1/auth/me
 */
const getCurrentUser = catchAsync(async (req, res) => {
  const user = await authService.getUserById(req.user.id);
  return ApiResponse.success(res, { user: authService.sanitizeUser(user) });
});

/**
 * Change password while signed in.
 * @route POST /api/v1/auth/change-password
 */
const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const isValid = await authService.verifyPassword(req.user.id, currentPassword);
  if (!isValid) {
    await AuditService.log({
      action: 'auth.password-change.failed',
      resource: 'user',
      resourceId: req.user.id,
      actor: req.user,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      outcome: 'failure',
      details: { reason: 'current-password-incorrect' },
    });
    return ApiResponse.error(res, 'Current password is incorrect', httpStatus.UNAUTHORIZED, {
      code: 'INVALID_CREDENTIALS',
    });
  }

  // FIX: `revokeOtherSessions` was commented out. Keeping the current session
  // alive is a deliberate convenience; every other session is revoked, including
  // one an attacker may hold.
  await authService.updatePassword(req.user.id, newPassword, {
    currentSessionId: req.sessionId || null,
    revokeOthers: true,
  });
  await invalidateUserCache(req.user.id);

  await AuditService.log({
    action: 'auth.password-change.success',
    resource: 'user',
    resourceId: req.user.id,
    actor: req.user,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    outcome: 'success',
  });

  return ApiResponse.success(res, {
    message: 'Password changed. Other devices have been signed out.',
  });
});

export {
  register,
  login,
  verifyMfa,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getCurrentUser,
  changePassword,
};

export default {
  register,
  login,
  verifyMfa,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getCurrentUser,
  changePassword,
};
