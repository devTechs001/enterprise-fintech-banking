import rateLimit from 'express-rate-limit';
import httpStatus from 'http-status';

import config from '#config/index.js';
import logger from '#logger.js';

/**
 * Layered rate limiting.
 *
 * The application previously installed exactly one global limiter
 * (100 requests / 15 minutes per IP) and nothing else. That budget is generous
 * enough to allow thousands of password guesses per day against a single account,
 * and tight enough that a busy office behind one NAT address gets blocked from
 * ordinary use. Limits must differ per endpoint class.
 *
 * Note: these are IP-keyed and only meaningful once `trust proxy` is set
 * (see `config/app.js`). Without it, `req.ip` is the reverse proxy's address and
 * every customer shares one bucket.
 */

const respond = (message, code) => (req, res) => {
  const retryAfter = Math.ceil((req.rateLimit?.resetTime?.getTime?.() - Date.now()) / 1000) || 60;
  res.setHeader('Retry-After', String(Math.max(1, retryAfter)));
  logger.warn('Rate limit exceeded', { path: req.path, ip: req.ip, code });
  return res.status(httpStatus.TOO_MANY_REQUESTS).json({
    success: false,
    message,
    error: { code, retryAfterSeconds: Math.max(1, retryAfter) },
  });
};

const build = ({ windowMs, max, message, code, skipSuccessfulRequests = false }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true, // RateLimit-* headers per the IETF draft
    legacyHeaders: false,  // do not leak X-RateLimit-*
    skipSuccessfulRequests,
    // Trust the proxy hop count configured in `server.trustProxy`.
    handler: respond(message, code),
  });

/** Broad ceiling for all traffic. */
export const globalLimiter = build({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: 'Too many requests. Please slow down.',
  code: 'RATE_LIMITED',
});

/** Credential endpoints: login, register, MFA verify. */
export const authLimiter = build({
  windowMs: config.rateLimit.authWindowMs,
  max: config.rateLimit.authMax,
  message: 'Too many authentication attempts. Please try again later.',
  code: 'AUTH_RATE_LIMITED',
  // Successful logins should not consume the abuse budget.
  skipSuccessfulRequests: true,
});

/** Token-issuing flows that send mail or SMS: forgot/reset/verify. */
export const sensitiveLimiter = build({
  windowMs: config.rateLimit.authWindowMs,
  max: config.rateLimit.sensitiveMax,
  message: 'Too many requests for this action. Please try again later.',
  code: 'SENSITIVE_RATE_LIMITED',
});

/** Money movement: tighter, and every attempt counts. */
export const transactionLimiter = build({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Too many transaction attempts. Please try again shortly.',
  code: 'TRANSACTION_RATE_LIMITED',
});

export default { globalLimiter, authLimiter, sensitiveLimiter, transactionLimiter };
