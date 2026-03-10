import httpStatus from 'http-status';

/**
 * API Response utility class for consistent response formatting
 */
class ApiResponse {
  /**
   * Send a success response
   * @param {Response} res - Express response object
   * @param {Object} data - Response data
   * @param {number} statusCode - HTTP status code
   * @returns {Response}
   */
  static success(res, data, statusCode = httpStatus.OK) {
    return res.status(statusCode).json({
      success: true,
      data,
    });
  }

  /**
   * Send an error response
   * @param {Response} res - Express response object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {Object} errors - Additional error details
   * @returns {Response}
   */
  static error(res, message, statusCode = httpStatus.BAD_REQUEST, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors && { errors }),
    });
  }

  /**
   * Send a paginated response
   * @param {Response} res - Express response object
   * @param {Object} data - Response data
   * @param {Object} pagination - Pagination info
   * @param {number} statusCode - HTTP status code
   * @returns {Response}
   */
  static paginated(res, data, pagination, statusCode = httpStatus.OK) {
    return res.status(statusCode).json({
      success: true,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
      },
    });
  }
}

export { ApiResponse };
export default ApiResponse;
