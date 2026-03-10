const httpStatus = require('http-status');
const catchAsync = require('@/utils/catchAsync');
const { authService, tokenService, emailService } = require('@/services');
const { ApiResponse } = require('@/utils/apiResponse');
const { AuditService } = require('@/services/audit.service');
const config = require('@/config');

/**
 * Register new user
 * @route POST /api/v1/auth/register
 */
const register = catchAsync(async (req, res) => {
  const { email, password, firstName, lastName, phoneNumber, dateOfBirth } = req.body;

  // Check if user already exists
  const existingUser = await authService.getUserByEmail(email);
  if (existingUser) {
    return ApiResponse.error(res, 'Email already registered', httpStatus.CONFLICT);
  }

  // Create user
  const user = await authService.createUser({
    email,
    password,
    firstName,
    lastName,
    phoneNumber,
    dateOfBirth,
  });

  // Generate email verification token
  const verificationToken = await tokenService.generateEmailVerificationToken(user.id);

  // Send verification email
  await emailService.sendVerificationEmail(user.email, verificationToken);

  // Audit log
  await AuditService.log({
    action: 'USER_REGISTERED',
    userId: user.id,
    details: { email: user.email },
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  return ApiResponse.success(
    res,
    {
      user: authService.sanitizeUser(user),
      message: 'Registration successful. Please verify your email.',
    },
    httpStatus.CREATED
  );
});

/**
 * Login user
 * @route POST /api/v1/auth/login
 */
const login = catchAsync(async (req, res) => {
  const { email, password, deviceInfo } = req.body;

  // Authenticate user
  const user = await authService.authenticateUser(email, password);

  // Check if MFA is enabled
  if (user.mfaEnabled) {
    const tempToken = await tokenService.generateTempToken(user.id);
    
    await AuditService.log({
      action: 'MFA_REQUIRED',
      userId: user.id,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    return ApiResponse.success(res, {
      requiresMfa: true,
      tempToken,
      mfaMethod: user.mfaMethod,
    });
  }

  // Generate tokens
  const tokens = await tokenService.generateAuthTokens(user.id);

  // Create session
  await authService.createSession({
    userId: user.id,
    token: tokens.refreshToken,
    deviceInfo,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Update last login
  await authService.updateLastLogin(user.id);

  // Audit log
  await AuditService.log({
    action: 'USER_LOGIN',
    userId: user.id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Set refresh token in HTTP-only cookie
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    maxAge: config.jwt.refreshExpirationDays * 24 * 60 * 60 * 1000,
  });

  return ApiResponse.success(res, {
    user: authService.sanitizeUser(user),
    tokens: {
      accessToken: tokens.accessToken,
      expiresIn: config.jwt.accessExpirationMinutes * 60,
    },
  });
});

/**
 * Verify MFA code
 * @route POST /api/v1/auth/mfa/verify
 */
const verifyMfa = catchAsync(async (req, res) => {
  const { code, tempToken } = req.body;

  // Verify temp token and get user
  const userId = await tokenService.verifyTempToken(tempToken);
  const user = await authService.getUserById(userId);

  // Verify MFA code
  const isValid = await authService.verifyMfaCode(user.id, code);
  if (!isValid) {
    await AuditService.log({
      action: 'MFA_FAILED',
      userId: user.id,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    return ApiResponse.error(res, 'Invalid MFA code', httpStatus.UNAUTHORIZED);
  }

  // Generate tokens
  const tokens = await tokenService.generateAuthTokens(user.id);

  // Create session
  await authService.createSession({
    userId: user.id,
    token: tokens.refreshToken,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Audit log
  await AuditService.log({
    action: 'MFA_VERIFIED',
    userId: user.id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  return ApiResponse.success(res, {
    user: authService.sanitizeUser(user),
    tokens,
  });
});

/**
 * Logout user
 * @route POST /api/v1/auth/logout
 */
const logout = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (refreshToken) {
    await authService.revokeSession(refreshToken);
  }

  // Audit log
  if (req.user) {
    await AuditService.log({
      action: 'USER_LOGOUT',
      userId: req.user.id,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  }

  res.clearCookie('refreshToken');

  return ApiResponse.success(res, { message: 'Logged out successfully' });
});

/**
 * Refresh access token
 * @route POST /api/v1/auth/refresh-token
 */
const refreshTokens = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    return ApiResponse.error(res, 'Refresh token required', httpStatus.UNAUTHORIZED);
  }

  const tokens = await authService.refreshAuthTokens(refreshToken);

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    maxAge: config.jwt.refreshExpirationDays * 24 * 60 * 60 * 1000,
  });

  return ApiResponse.success(res, {
    accessToken: tokens.accessToken,
    expiresIn: config.jwt.accessExpirationMinutes * 60,
  });
});

/**
 * Forgot password
 * @route POST /api/v1/auth/forgot-password
 */
const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  const user = await authService.getUserByEmail(email);
  
  if (user) {
    const resetToken = await tokenService.generatePasswordResetToken(user.id);
    await emailService.sendPasswordResetEmail(user.email, resetToken);

    await AuditService.log({
      action: 'PASSWORD_RESET_REQUESTED',
      userId: user.id,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  }

  // Always return success to prevent email enumeration
  return ApiResponse.success(res, {
    message: 'If the email exists, a password reset link has been sent.',
  });
});

/**
 * Reset password
 * @route POST /api/v1/auth/reset-password
 */
const resetPassword = catchAsync(async (req, res) => {
  const { token, password } = req.body;

  const userId = await tokenService.verifyPasswordResetToken(token);
  await authService.updatePassword(userId, password);

  // Revoke all sessions for security
  await authService.revokeAllUserSessions(userId);

  await AuditService.log({
    action: 'PASSWORD_RESET_COMPLETED',
    userId,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  return ApiResponse.success(res, {
    message: 'Password reset successful. Please login with your new password.',
  });
});

/**
 * Verify email
 * @route POST /api/v1/auth/verify-email
 */
const verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.body;

  const userId = await tokenService.verifyEmailVerificationToken(token);
  await authService.verifyUserEmail(userId);

  await AuditService.log({
    action: 'EMAIL_VERIFIED',
    userId,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  return ApiResponse.success(res, {
    message: 'Email verified successfully.',
  });
});

/**
 * Get current user
 * @route GET /api/v1/auth/me
 */
const getCurrentUser = catchAsync(async (req, res) => {
  const user = await authService.getUserById(req.user.id);

  return ApiResponse.success(res, {
    user: authService.sanitizeUser(user),
  });
});

/**
 * Change password
 * @route POST /api/v1/auth/change-password
 */
const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Verify current password
  const isValid = await authService.verifyPassword(req.user.id, currentPassword);
  if (!isValid) {
    return ApiResponse.error(res, 'Current password is incorrect', httpStatus.BAD_REQUEST);
  }

  // Update password
  await authService.updatePassword(req.user.id, newPassword);

  // Optionally revoke other sessions
  // await authService.revokeOtherSessions(req.user.id, req.sessionId);

  await AuditService.log({
    action: 'PASSWORD_CHANGED',
    userId: req.user.id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  return ApiResponse.success(res, {
    message: 'Password changed successfully.',
  });
});

module.exports = {
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