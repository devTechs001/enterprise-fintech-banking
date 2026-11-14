import httpStatus from 'http-status';

/**
 * Error hierarchy.
 *
 * `transaction.service.js` imported `InsufficientFundsException`,
 * `TransactionException`, `ValidationException` and `NotFoundException` from
 * `@/exceptions`, and `authenticate.js` relied on error objects carrying a
 * `statusCode` — but no such module or class existed anywhere in the repo. Every
 * thrown error therefore fell through to the generic 500 branch of the error
 * handler.
 *
 * `ApiError` is the single operational base: it carries an HTTP status and a
 * stable machine-readable `code`, and marks itself `expose` so the handler knows
 * the message is safe to return to a client.
 */
export class ApiError extends Error {
  constructor(statusCode, message, { code = 'INTERNAL_ERROR', details = null, expose = true } = {}) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.expose = expose;
    this.isOperational = true;
    Error.captureStackTrace?.(this, new.target);
  }

  static badRequest(message, options) {
    return new ApiError(httpStatus.BAD_REQUEST, message, { code: 'BAD_REQUEST', ...options });
  }

  static unauthorized(message = 'Authentication required', options) {
    return new ApiError(httpStatus.UNAUTHORIZED, message, { code: 'UNAUTHORIZED', ...options });
  }

  static forbidden(message = 'Not permitted', options) {
    return new ApiError(httpStatus.FORBIDDEN, message, { code: 'FORBIDDEN', ...options });
  }

  static notFound(message = 'Resource not found', options) {
    return new ApiError(httpStatus.NOT_FOUND, message, { code: 'NOT_FOUND', ...options });
  }

  static conflict(message, options) {
    return new ApiError(httpStatus.CONFLICT, message, { code: 'CONFLICT', ...options });
  }

  static unprocessable(message, options) {
    return new ApiError(httpStatus.UNPROCESSABLE_ENTITY, message, { code: 'VALIDATION_ERROR', ...options });
  }

  static tooMany(message = 'Too many requests', options) {
    return new ApiError(httpStatus.TOO_MANY_REQUESTS, message, { code: 'RATE_LIMITED', ...options });
  }

  static internal(message = 'Internal server error') {
    return new ApiError(httpStatus.INTERNAL_SERVER_ERROR, message, { code: 'INTERNAL_ERROR', expose: false });
  }
}

export class ValidationException extends ApiError {
  constructor(message = 'Validation failed', details = null) {
    super(httpStatus.UNPROCESSABLE_ENTITY, message, { code: 'VALIDATION_ERROR', details });
  }
}

export class UnauthorizedException extends ApiError {
  constructor(message = 'Invalid credentials', code = 'INVALID_CREDENTIALS') {
    super(httpStatus.UNAUTHORIZED, message, { code });
  }
}

export class ForbiddenException extends ApiError {
  constructor(message = 'Access denied', code = 'FORBIDDEN') {
    super(httpStatus.FORBIDDEN, message, { code });
  }
}

export class NotFoundException extends ApiError {
  constructor(message = 'Resource not found', code = 'NOT_FOUND') {
    super(httpStatus.NOT_FOUND, message, { code });
  }
}

export class ConflictException extends ApiError {
  constructor(message = 'Resource already exists', code = 'CONFLICT') {
    super(httpStatus.CONFLICT, message, { code });
  }
}

export class InsufficientFundsException extends ApiError {
  constructor(message = 'Insufficient funds', details = null) {
    super(httpStatus.UNPROCESSABLE_ENTITY, message, { code: 'INSUFFICIENT_FUNDS', details });
  }
}

export class TransactionException extends ApiError {
  constructor(message = 'Transaction failed', code = 'TRANSACTION_FAILED', details = null) {
    super(httpStatus.UNPROCESSABLE_ENTITY, message, { code, details });
  }
}

export class AccountLockedException extends ApiError {
  constructor(message = 'Account is temporarily locked', retryAfterSeconds = 0) {
    super(httpStatus.TOO_MANY_REQUESTS, message, {
      code: 'ACCOUNT_LOCKED',
      details: { retryAfterSeconds },
    });
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export default ApiError;
