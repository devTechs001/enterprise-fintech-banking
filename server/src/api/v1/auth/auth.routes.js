import express from 'express';

import {
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
} from './auth.controller.js';
import { authenticate } from '#middleware/auth/authenticate.js';
import { authLimiter, sensitiveLimiter } from '#middleware/auth/rateLimiter.js';
import {
  registerValidator,
  loginValidator,
  mfaVerifyValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  verifyEmailValidator,
  changePasswordValidator,
} from '#middleware/validators/auth.validators.js';

/**
 * Auth routes.
 *
 * The committed version attached no rate limiter and no validator to any of these
 * paths — `@/middleware/validators/auth.validators` and
 * `@/middleware/auth/rateLimiter` were both imported nowhere and, in fact,
 * `rateLimiter` did not exist. Every credential endpoint is now limited and
 * validated.
 *
 * Limiter placement:
 *  - `authLimiter` skips successful requests, so a legitimate user signing in is
 *    not charged against the abuse budget;
 *  - `sensitiveLimiter` guards the flows that trigger outbound mail, which are
 *    both an abuse vector and a cost vector.
 */
const router = express.Router();

// Public
router.post('/register', authLimiter, registerValidator, register);
router.post('/login', authLimiter, loginValidator, login);
router.post('/mfa/verify', authLimiter, mfaVerifyValidator, verifyMfa);
router.post('/forgot-password', sensitiveLimiter, forgotPasswordValidator, forgotPassword);
router.post('/reset-password', sensitiveLimiter, resetPasswordValidator, resetPassword);
router.post('/verify-email', sensitiveLimiter, verifyEmailValidator, verifyEmail);
router.post('/refresh-token', authLimiter, refreshTokens);

// Protected
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);
router.post('/change-password', authenticate, changePasswordValidator, changePassword);

export default router;
