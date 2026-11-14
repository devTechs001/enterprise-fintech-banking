import config from '#config/index.js';
import logger from '#logger.js';
import notificationService from './notification.service.js';

/**
 * Auth-related mail.
 *
 * `auth.controller.js` called `emailService.sendVerificationEmail` /
 * `sendPasswordResetEmail`; no such module existed, so registration and password
 * reset both threw at runtime.
 *
 * Links are assembled from `PUBLIC_APP_URL` rather than from the request's Host
 * header. Trusting Host would let an attacker send a victim a reset email whose
 * link points at attacker-controlled infrastructure while displaying the real
 * brand — a classic host-header password-reset poisoning attack.
 */

const appUrl = () => {
  const base = process.env.PUBLIC_APP_URL || 'http://localhost:5173';
  return base.replace(/\/$/, '');
};

class EmailService {
  async sendVerificationEmail(to, token) {
    const url = `${appUrl()}/verify-email?token=${encodeURIComponent(token)}`;
    logger.info('email verification link issued', { to, expiresHours: config.auth.verificationTokenTtlHours });
    return notificationService.send({
      channel: 'email',
      to,
      subject: 'Confirm your SecureBank email address',
      template: 'auth.verify-email',
      data: { url, expiresHours: config.auth.verificationTokenTtlHours },
    });
  }

  async sendPasswordResetEmail(to, token) {
    const url = `${appUrl()}/reset-password?token=${encodeURIComponent(token)}`;
    logger.info('password reset link issued', { to, expiresMinutes: config.auth.resetTokenTtlMinutes });
    return notificationService.send({
      channel: 'email',
      to,
      subject: 'Reset your SecureBank password',
      template: 'auth.password-reset',
      data: { url, expiresMinutes: config.auth.resetTokenTtlMinutes },
    });
  }

  async sendSecurityAlert(to, event, details) {
    return notificationService.sendSecurityAlert({ email: to }, event, details);
  }

  async sendNewDeviceAlert(to, details) {
    return notificationService.send({
      channel: 'email',
      to,
      subject: 'A new device signed in to your account',
      template: 'security.new-device',
      data: details,
    });
  }
}

export const emailService = new EmailService();
export default emailService;
