/**
 * Account status constants
 */
const ACCOUNT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  FROZEN: 'frozen',
  CLOSED: 'closed',
  SUSPENDED: 'suspended',
};

/**
 * User role constants
 */
const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPPORT: 'support',
  MANAGER: 'manager',
};

/**
 * Transaction status constants
 */
const TRANSACTION_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REVERSED: 'reversed',
};

/**
 * Transaction type constants
 */
const TRANSACTION_TYPE = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  TRANSFER: 'transfer',
  PAYMENT: 'payment',
  REFUND: 'refund',
  FEE: 'fee',
  INTEREST: 'interest',
};

export {
  ACCOUNT_STATUS,
  USER_ROLES,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
};
