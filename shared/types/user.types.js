// User Types
/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string} firstName - First name
 * @property {string} lastName - Last name
 * @property {string} phoneNumber - Phone number
 * @property {string} role - User role
 * @property {string} status - Account status
 * @property {boolean} emailVerified - Email verification status
 * @property {boolean} mfaEnabled - MFA enabled status
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} CreateUserInput
 * @property {string} email
 * @property {string} password
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} [phoneNumber]
 * @property {string} [dateOfBirth]
 */

export const UserTypes = {
  USER: 'user',
  ADMIN: 'admin',
  SUPPORT: 'support',
};

export default UserTypes;
