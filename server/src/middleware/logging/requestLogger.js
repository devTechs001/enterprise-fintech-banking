import logger, { redactString } from '#logger.js';
import config from '#config/index.js';

/**
 * Request logging.
 *
 * DEFECTS FIXED
 * -------------
 *  1. `console.log` bypassed winston entirely, so requests carried no level, no
 *     timestamp and no format — and could not be shipped anywhere.
 *  2. It logged `req.originalUrl` verbatim. Password-reset and email-verification
 *     flows put a single-use token in the query string, so the log became a store
 *     of live credentials. `logger.redactString` scrubs `token`, `code`, `sig` and
 *     the access/refresh token parameters.
 *  3. There was no correlation id, so a log line could not be tied to the response
 *     a customer received. `req.id` is attached in `config/app.js` and echoed in
 *     the `X-Request-Id` response header.
 *  4. Failed requests logged at the same level as successful ones. 5xx is an
 *     incident; 4xx is usually a client mistake.
 */

/** Endpoints whose mere existence is sensitive and which are hit constantly. */
const QUIET_PATHS = new Set(['/health', '/api/v1/health']);

export const requestLogger = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    const { statusCode } = res;

    const payload = {
      requestId: req.id,
      method: req.method,
      path: req.path,
      // Redacted: query strings may carry single-use tokens.
      url: redactString(req.originalUrl),
      status: statusCode,
      durationMs: Number(durationMs.toFixed(1)),
      ip: req.ip,
      userId: req.user?.id,
      userAgent: req.get('user-agent'),
    };

    if (QUIET_PATHS.has(req.path) && statusCode < 400) return;
    if (statusCode >= 500) logger.error('Request completed with a server error', payload);
    else if (statusCode >= 400) logger.warn('Request rejected', payload);
    else if (config.isProduction) logger.info('Request completed', payload);
    else logger.debug('Request completed', payload);
  });

  // A connection closed before the response finished is worth knowing about.
  res.on('close', () => {
    if (!res.writableEnded) {
      logger.warn('Connection closed before the response completed', {
        requestId: req.id,
        method: req.method,
        path: req.path,
      });
    }
  });

  next();
};

export default requestLogger;
