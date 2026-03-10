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
import { authenticate } from '@/middleware/auth/authenticate.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/mfa/verify', verifyMfa);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);
router.post('/refresh-token', refreshTokens);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);
router.post('/change-password', authenticate, changePassword);

export default router;
