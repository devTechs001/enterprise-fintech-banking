import httpStatus from 'http-status';
import { ApiError } from '#exceptions/index.js';

/**
 * Terminal 404 handler.
 *
 * `middleware/error/index.js` re-exported `./notFoundHandler`, which did not
 * exist — so importing the error barrel crashed the app at startup.
 *
 * Deliberately does not echo the requested path back in the body: reflecting
 * user input into a response is how a 404 page becomes an XSS or cache-poisoning
 * vector. The path is logged, not returned.
 */
export const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound('The requested resource does not exist', {
    code: 'ROUTE_NOT_FOUND',
    details: { method: req.method },
  }));
};

export const methodNotAllowed = (req, res, next) => {
  next(new ApiError(httpStatus.METHOD_NOT_ALLOWED, 'Method not allowed for this endpoint', {
    code: 'METHOD_NOT_ALLOWED',
  }));
};

export default notFoundHandler;
