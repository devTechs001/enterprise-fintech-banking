import { EventEmitter } from 'node:events';

/**
 * Application event bus.
 *
 * `transaction.service.js` imported `EventEmitter` from `@/events`, a module that
 * did not exist. It emits `transaction.completed` after a transfer commits so
 * notification, fraud and analytics consumers can react asynchronously without
 * extending the database transaction.
 *
 * A raised listener ceiling is deliberate: many bounded consumers subscribe, and
 * the default of 10 makes Node print a MaxListenersExceededWarning that reads
 * like a leak.
 */
export const appEvents = new EventEmitter();
appEvents.setMaxListeners(50);

/** Domain events. Spelled out so a typo cannot create a silent new channel. */
export const EVENTS = Object.freeze({
  TRANSACTION_COMPLETED: 'transaction.completed',
  TRANSACTION_FAILED: 'transaction.failed',
  TRANSACTION_REVERSED: 'transaction.reversed',
  AUTH_LOGIN_SUCCESS: 'auth.login.success',
  AUTH_LOGIN_FAILED: 'auth.login.failed',
  AUTH_MFA_VERIFIED: 'auth.mfa.verified',
  AUTH_PASSWORD_CHANGED: 'auth.password.changed',
  AUTH_SESSION_REVOKED: 'auth.session.revoked',
  ACCOUNT_CREATED: 'account.created',
  ACCOUNT_FROZEN: 'account.frozen',
  SECURITY_ALERT: 'security.alert',
});

export const emit = (event, payload) => appEvents.emit(event, payload);
export const on = (event, handler) => appEvents.on(event, handler);
export const once = (event, handler) => appEvents.once(event, handler);
export const off = (event, handler) => appEvents.off(event, handler);

// An error inside one listener must never take down the request that emitted it.
appEvents.on('error', () => {});

export { EventEmitter };
export default appEvents;
