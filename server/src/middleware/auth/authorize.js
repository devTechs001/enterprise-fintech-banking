import httpStatus from 'http-status';

import { ApiResponse } from '#utils/apiResponse.js';
import { USER_ROLES } from '#constants/index.js';

/**
 * Role and permission authorisation.
 *
 * The README advertised RBAC and the `User` model carries both a `role` enum and
 * a `permissions` array, but no middleware ever read them: `authenticate` attached
 * `req.user.role` and every protected route was open to any signed-in customer.
 * Administrative endpoints are now gated explicitly.
 *
 * These run *after* `authenticate` and never trust a role that came from the
 * request body or a query string — only from the verified token's user snapshot.
 */

const deny = (res, message = 'You do not have permission to perform this action', code = 'FORBIDDEN') =>
  ApiResponse.error(res, message, httpStatus.FORBIDDEN, { code });

/** Allow only the listed roles. */
export const authorize = (...roles) => {
  const allowed = roles.flat();
  return (req, res, next) => {
    if (!req.user) return deny(res, 'Authentication required', 'UNAUTHORIZED');
    if (!allowed.includes(req.user.role)) {
      return deny(res, 'Your role does not permit this action', 'ROLE_NOT_PERMITTED');
    }
    return next();
  };
};

/** Allow a role, or any user holding one of the listed granular permissions. */
export const authorizePermission = (...permissions) => {
  const required = permissions.flat();
  return (req, res, next) => {
    if (!req.user) return deny(res, 'Authentication required', 'UNAUTHORIZED');
    if (req.user.role === USER_ROLES.ADMIN) return next();
    const held = req.user.permissions || [];
    if (!required.some((permission) => held.includes(permission))) {
      return deny(res, 'A required permission is missing', 'PERMISSION_MISSING');
    }
    return next();
  };
};

export const adminOnly = authorize(USER_ROLES.ADMIN);
export const staffOnly = authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.SUPPORT);

/**
 * Ownership check for `/resource/:id` style routes.
 *
 * Without this, any authenticated customer could pass another customer's account
 * id and read or move their money — the single most damaging class of bug in a
 * banking API (IDOR / BOLA).
 */
export const ownsResource = (resolveOwnerId) => async (req, res, next) => {
  try {
    if (!req.user) return deny(res, 'Authentication required', 'UNAUTHORIZED');
    if (req.user.role === USER_ROLES.ADMIN) return next();

    const ownerId = await resolveOwnerId(req);
    if (!ownerId) return deny(res, 'Resource not found', 'RESOURCE_NOT_FOUND');
    if (String(ownerId) !== String(req.user.id)) {
      // Logged: repeated attempts against other customers' ids is an attack signal.
      return deny(res, 'You do not have access to this resource', 'NOT_RESOURCE_OWNER');
    }
    return next();
  } catch (error) {
    return next(error);
  }
};

export default { authorize, authorizePermission, adminOnly, staffOnly, ownsResource };
