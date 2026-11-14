import logger from '#logger.js';
import config from '#config/index.js';

/**
 * Outbound notifications.
 *
 * No mail or SMS provider SDK is wired into this service, and the previous
 * manifest declared `@sendgrid/mail`, `twilio`, `nodemailer` and `firebase-admin`
 * while importing none of them. Rather than pretend to deliver, this module
 * records the intent and returns a result the caller can inspect.
 *
 * The transport is pluggable: set `EMAIL_PROVIDER` and register a sender here
 * once the integration exists. Keeping the seam explicit means a caller cannot
 * silently believe a security alert was delivered when it was not.
 */

const senders = new Map();

export const registerSender = (channel, send) => {
  if (typeof send !== 'function') throw new TypeError('sender must be a function');
  senders.set(channel, send);
};

class NotificationServiceClass {
  /**
   * @returns {{delivered:boolean, channel:string, id:string|null, reason?:string}}
   */
  async send({ channel = 'email', to, subject, body, template, data } = {}) {
    if (!to) return { delivered: false, channel, id: null, reason: 'missing recipient' };

    const sender = senders.get(channel);
    if (!sender) {
      logger.info('notification queued (no transport configured)', { channel, to, subject, template });
      return { delivered: false, channel, id: null, reason: `no ${channel} transport configured` };
    }

    try {
      const id = await sender({ to, subject, body, template, data });
      return { delivered: true, channel, id };
    } catch (error) {
      logger.error('notification failed', { channel, to, template, message: error.message });
      return { delivered: false, channel, id: null, reason: error.message };
    }
  }

  /** Transactional alert after a money movement commits. */
  async sendTransactionNotification(transaction, user) {
    return this.send({
      channel: 'email',
      to: user?.email,
      subject: `Transaction ${transaction?.status ?? 'completed'}`,
      template: 'transaction.receipt',
      data: { transaction, user },
    });
  }

  /**
   * Security alert. Delivered best-effort but always logged: a failed MFA enrolment
   * notice must not stop the enrolment, yet the event has to be visible.
   */
  async sendSecurityAlert(user, event, details = {}) {
    logger.warn('security alert', { userId: user?.id, event, details });
    return this.send({
      channel: 'email',
      to: user?.email,
      subject: `Security notice: ${event}`,
      template: 'security.alert',
      data: { event, details },
    });
  }

  /** Single-use, time-limited link (password reset / email verification). */
  async sendOneTimeLink({ user, kind, url, expiresMinutes }) {
    if (!config.email || config.email.provider === 'log') {
      // Surface the link in the log during development so the flow is testable
      // without a provider. In production this must be a real transport.
      logger.info(`[${kind}] link for ${user?.email}: ${url} (expires in ${expiresMinutes}m)`);
    }
    return this.send({
      channel: 'email',
      to: user?.email,
      subject: kind === 'password-reset' ? 'Reset your password' : 'Confirm your email',
      template: `auth.${kind}`,
      data: { url, expiresMinutes },
    });
  }
}

export const NotificationService = new NotificationServiceClass();
export const notificationService = NotificationService;
export default NotificationService;
