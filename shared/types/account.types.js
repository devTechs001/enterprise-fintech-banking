// Account Types
/**
 * @typedef {Object} Account
 * @property {string} id - Account ID
 * @property {string} userId - Owner user ID
 * @property {string} accountNumber - Account number
 * @property {string} accountName - Account name
 * @property {string} accountType - Account type
 * @property {number} balance - Current balance
 * @property {string} currency - Currency code
 * @property {string} status - Account status
 * @property {boolean} isPrimary - Primary account flag
 * @property {Date} createdAt - Creation timestamp
 */

export const AccountTypes = {
  CHECKING: 'checking',
  SAVINGS: 'savings',
  INVESTMENT: 'investment',
  CREDIT: 'credit',
};

export const AccountStatus = {
  ACTIVE: 'active',
  FROZEN: 'frozen',
  CLOSED: 'closed',
  PENDING: 'pending',
};

export default AccountTypes;
