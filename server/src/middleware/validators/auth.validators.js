import { body, validationResult } from 'express-validator';
import httpStatus from 'http-status';

import { ApiResponse } from '#utils/apiResponse.js';
import { evaluatePassword } from '#services/auth.service.js';

/**
 * Request validation.
 *
 * The repository declared `express-validator` as a dependency and shipped a
 * `shared/validations/schemas.js` yup file, and imported neither. No endpoint in
 * the server validated a single field: `req.body` flowed straight into Sequelize
 * and into token generation. That is the mass-assignment path — a client POSTing
 * `role: "admin"` or `status: "active"` would have it honoured by any
 * `Model.create(req.body)` call.
 *
 * These chains are an allow-list on shape and type. Handlers then pick named
 * fields rather than spreading the body.
 */

const EMAIL = (field = 'email') =>
  body(field)
    .isEmail()
    .withMessage('A valid email address is required')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email is too long');

const PASSWORD = (field = 'password') =>
  body(field)
    .isString()
    .withMessage('Password must be a string')
    .isLength({ min: 12, max: 128 })
    .withMessage('Password must be between 12 and 128 characters')
    // The full policy (character classes plus a common-password blocklist) lives
    // in the service so that one implementation governs every entry point.
    .custom((value) => {
      const result = evaluatePassword(value);
      if (!result.valid) throw new Error(result.failures.join('; '));
      return true;
    });

const NAME = (field) =>
  body(field)
    .isString()
    .withMessage(`${field} must be a string`)
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage(`${field} must be between 1 and 100 characters`)
    // Reject markup characters; names never legitimately contain them.
    .matches(/^[^<>{}]*$/)
    .withMessage(`${field} contains invalid characters`);

/** Run a validator chain, then translate failures into a 422. */
export const validate = (chain) => [
  ...chain,
  (req, res, next) => {
    const result = validationResult(req);
    if (result.isEmpty()) return next();

    const errors = result.array().map((error) => ({ field: error.path, message: error.msg }));
    return ApiResponse.error(
      res,
      'The submitted data is invalid',
      httpStatus.UNPROCESSABLE_ENTITY,
      errors
    );
  },
];

export const registerValidator = validate([
  EMAIL(),
  PASSWORD(),
  NAME('firstName'),
  NAME('lastName'),
  body('phoneNumber')
    .optional({ values: 'falsy' })
    .isMobilePhone()
    .withMessage('Phone number is invalid')
    .isLength({ max: 20 }),
  body('dateOfBirth')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('dateOfBirth must be an ISO 8601 date')
    .toDate(),
]);

export const loginValidator = validate([
  EMAIL(),
  body('password').isString().notEmpty().withMessage('Password is required').isLength({ max: 128 }),
  body('deviceInfo').optional().isString().isLength({ max: 200 }),
]);

export const mfaVerifyValidator = validate([
  body('code')
    .isString()
    .trim()
    .matches(/^\d{6}$/)
    .withMessage('Enter the 6-digit code from your authenticator'),
  body('tempToken').isString().notEmpty().withMessage('A verification token is required').isLength({ max: 2000 }),
]);

export const forgotPasswordValidator = validate([EMAIL()]);

export const resetPasswordValidator = validate([
  body('token').isString().notEmpty().withMessage('A reset token is required').isLength({ max: 512 }),
  PASSWORD(),
]);

export const verifyEmailValidator = validate([
  body('token').isString().notEmpty().withMessage('A verification token is required').isLength({ max: 512 }),
]);

export const changePasswordValidator = validate([
  body('currentPassword').isString().notEmpty().withMessage('Your current password is required').isLength({ max: 128 }),
  PASSWORD('newPassword'),
  body('confirmPassword')
    .optional({ values: 'falsy' })
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Password confirmation does not match'),
]);

export default {
  validate,
  registerValidator,
  loginValidator,
  mfaVerifyValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  verifyEmailValidator,
  changePasswordValidator,
};
