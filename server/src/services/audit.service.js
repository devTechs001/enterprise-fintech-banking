import logger from '#logger.js';
import { appEvents, EVENTS } from '#events.js';

/**
 * Append-only audit trail.
 *
 * `auth.controller.js` and `transaction.service.js` both call
 * `AuditService.log(...)`, and neither `@/services` nor `@/services/audit.service`
 * existed — so every audited code path threw on first use.
 *
 * Audit writes must never break the operation they record: a failed audit insert
 * should not roll back a customer's transfer. Errors are therefore logged and
 * swallowed, and the event is still published so an external SIEM can pick it up.
 *
 * An `AuditLog` model is registered when present; without it the entry still
 * reaches the structured log, which keeps the trail intact in a minimal
 * environment instead of vanishing.
 */

const ACTOR_FIELDS = ['id', 'email', 'role'];

const pickActor = (actor) => {
  if (!actor) return null;
  if (typeof actor === 'string') return { id: actor };
  const picked = {};
  for (const field of ACTOR_FIELDS) if (actor[field] !== undefined) picked[field] = actor[field];
  return Object.keys(picked).length ? picked : null;
};

class AuditServiceClass {
  /**
   * @param {object}   entry
   * @param {string}   entry.action       - stable machine-readable verb
   * @param {string}   [entry.resource]   - what was acted on
   * @param {string}   [entry.resourceId]
   * @param {object}   [entry.actor]      - user or service principal
   * @param {string}   [entry.ip]
   * @param {string}   [entry.userAgent]
   * @param {string}   [entry.outcome]    - 'success' | 'failure' | 'denied'
   * @param {object}   [entry.details]
   */
  async log(entry = {}) {
    const record = {
      action: entry.action || 'unknown',
      resource: entry.resource ?? null,
      resourceId: entry.resourceId ?? null,
      actor: pickActor(entry.actor ?? entry.user ?? null),
      ip: entry.ip ?? null,
      userAgent: entry.userAgent ?? null,
      outcome: entry.outcome || 'success',
      // `logger.redact` runs on the way out, so credentials in details are scrubbed.
      details: entry.details ?? entry.metadata ?? null,
      at: new Date().toISOString(),
    };

    appEvents.emit(EVENTS.SECURITY_ALERT, record);

    try {
      const { default: models } = await import('#database/models/index.js');
      if (models.AuditLog) {
        await models.AuditLog.create(record);
        return record;
      }
    } catch (error) {
      logger.warn('Audit record could not be persisted', { action: record.action, message: error.message });
    }

    logger.info('audit', record);
    return record;
  }

  /** Convenience wrappers used across the auth flows. */
  loginSuccess(user, req) {
    return this.log({ action: 'auth.login.success', resource: 'user', resourceId: user?.id, actor: user, ip: req?.ip, userAgent: req?.get?.('user-agent'), outcome: 'success' });
  }

  loginFailure(email, req, reason) {
    return this.log({ action: 'auth.login.failed', resource: 'user', ip: req?.ip, userAgent: req?.get?.('user-agent'), outcome: 'failure', details: { email, reason } });
  }

  async record() {
    return this.log(...arguments);
  }
}

export const AuditService = new AuditServiceClass();
export const auditService = AuditService;
export default AuditService;
