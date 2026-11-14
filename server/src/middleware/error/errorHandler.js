import httpStatus from 'http-status';

import config from '#config/index.js';
import logger from '#logger.js';
import { ApiError } from '#exceptions/index.js';
import { redact } from '#logger.js';

/**
 * Terminal error handler.
 *
 * DEFECTS FIXED
 * -------------
 *  1. `let error = { ...err }` spread an Error instance. Error properties
 *     (`message`, `stack`, `statusCode`) are non-enumerable, so the spread
 *     produced `{}` — the handler then read fields that were never there.
 *  2. The raw `err.message` and, in development, the stack were returned to the
 *     client for *every* error. A Sequelize failure message contains SQL and
 *     often column values.
 *  3. It mapped Mongoose error names (`ValidationError`, `CastError`,
 *     `MongoServerError`) on a stack that uses Sequelize and PostgreSQL — none of
 *     those branches could ever fire, and the real ones went unhandled.
 *  4. `console.error` bypassed the logger, so errors carried no request id and no
 *     redaction.
 *
 * Rule applied throughout: an error is either operational (constructed by this
 * app, safe to show) or unexpected (logged in full, reported generically).
 */

const isProduction = config.isProduction;

const mapSequelizeError = (err) => {
  const name = err.name;
  if (name === 'SequelizeUniqueConstraintError') {
    const fields = Object.keys(err.fields || {});
    // Do not echo which field collided: that is an account-enumeration oracle.
    return new ApiError(httpStatus.CONFLICT, 'That record already exists', {
      code: 'UNIQUE_CONSTRAINT',
      details: isProduction ? null : { fields },
    });
  }
  if (name === 'SequelizeValidationError' || name === 'SequelizeEmptyResultError') {
    return new ApiError(
      name === 'SequelizeEmptyResultError' ? httpStatus.NOT_FOUND : httpStatus.UNPROCESSABLE_ENTITY,
      name === 'SequelizeEmptyResultError' ? 'Resource not found' : 'The submitted data is invalid',
      {
        code: name === 'SequelizeEmptyResultError' ? 'NOT_FOUND' : 'VALIDATION_ERROR',
        details: name === 'SequelizeValidationError'
          ? (err.errors || []).map((e) => ({ field: e.path, message: e.message }))
          : null,
      }
    );
  }
  if (name === 'SequelizeConnectionError' || name === 'SequelizeConnectionRefusedError') {
    return ApiError.internal('The service is temporarily unavailable');
  }
  if (name === 'SequelizeTimeoutError') {
    return new ApiError(httpStatus.GATEWAY_TIMEOUT, 'The operation timed out', { code: 'TIMEOUT' });
  }
  return null;
};

// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by arity
export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof Error)) {
    error = new Error(typeof error === 'string' ? error : 'Unknown error');
  }

  const mapped = error instanceof ApiError ? null : mapSequelizeError(error);
  if (mapped) error = mapped;

  // Express and body-parser throw `HttpError` instances that carry a numeric
  // `status` and `expose: true` — a 413 from the body limit or a 400 from malformed
  // JSON is a client mistake, not a server fault. Treating them as unexpected
  // logged every one of them at error level with a full stack.
  const isExpressHttpError =
    typeof error.status === 'number' && error.status >= 400 && error.status < 500 && error.expose !== false;

  const operational = error instanceof ApiError || error.isOperational === true || isExpressHttpError;
  const statusCode =
    error.statusCode ||
    (isExpressHttpError ? error.status : operational ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR);

  if (isExpressHttpError && !(error instanceof ApiError)) {
    error = Object.assign(new ApiError(statusCode, error.message, { code: error.code || error.type || 'REQUEST_INVALID' }), {
      stack: error.stack,
    });
  }

  // Always log the real error server-side, with a correlation id and redaction.
  const logPayload = {
    requestId: req.id,
    method: req.method,
    path: req.originalUrl ? redact(req.originalUrl) : req.path,
    ip: req.ip,
    userId: req.user?.id,
    statusCode,
    code: error.code,
    message: error.message,
    stack: error.stack,
    body: req.method !== 'GET' ? req.body : undefined,
  };
  if (statusCode >= 500 || !operational) logger.error('Request failed', logPayload);
  else logger.warn('Request rejected', logPayload);

  if (res.headersSent) return next(error);

  const body = {
    success: false,
    message: operational || !isProduction ? error.message : 'An unexpected error occurred',
    error: {
      code: error.code || (statusCode >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_FAILED'),
      ...(error.details ? { details: error.details } : {}),
      ...(error.retryAfterSeconds ? { retryAfterSeconds: error.retryAfterSeconds } : {}),
    },
  };

  // Stack traces are for developers, never for clients — they disclose file paths,
  // framework versions and internal call order.
  if (!isProduction && error.stack) body.error.stack = error.stack;

  if (error.retryAfterSeconds) res.setHeader('Retry-After', String(error.retryAfterSeconds));

  return res.status(statusCode).json(body);
};

export default errorHandler;
