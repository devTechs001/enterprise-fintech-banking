/**
 * Service barrel.
 *
 * `auth.controller.js` imported `{ authService, tokenService, emailService }`
 * from `@/services`, but there was no barrel and no auth/token/email service —
 * only `transaction.service.js`. Every auth endpoint therefore failed at import
 * time, before any request was handled.
 */
export { default as authService } from './auth.service.js';
export { default as tokenService, REFRESH_COOKIE, ACCESS_COOKIE } from './token.service.js';
export { default as emailService } from './email.service.js';
export { default as AuditService, auditService } from './audit.service.js';
export { default as FraudService, fraudService } from './fraud.service.js';
export { default as NotificationService, notificationService } from './notification.service.js';
export { default as transactionService } from './transaction.service.js';
