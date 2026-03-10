/**
 * Account type constants
 */
const ACCOUNT_TYPES = {
  CHECKING: 'checking',
  SAVINGS: 'savings',
  INVESTMENT: 'investment',
  CREDIT: 'credit',
  MONEY_MARKET: 'money_market',
  CERTIFICATE_OF_DEPOSIT: 'certificate_of_deposit',
};

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
  CANCELLED: 'cancelled',
};

/**
 * Transaction type constants
 */
const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  TRANSFER: 'transfer',
  PAYMENT: 'payment',
  PURCHASE: 'purchase',
  REFUND: 'refund',
  FEE: 'fee',
  INTEREST: 'interest',
  DIVIDEND: 'dividend',
};

/**
 * Currency constants
 */
const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  JPY: 'JPY',
  CAD: 'CAD',
  AUD: 'AUD',
  CHF: 'CHF',
  CNY: 'CNY',
  INR: 'INR',
};

/**
 * Card type constants
 */
const CARD_TYPES = {
  VISA: 'visa',
  MASTERCARD: 'mastercard',
  AMEX: 'amex',
  DISCOVER: 'discover',
};

/**
 * Card status constants
 */
const CARD_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BLOCKED: 'blocked',
  EXPIRED: 'expired',
  REPORTED_LOST: 'reported_lost',
  REPORTED_STOLEN: 'reported_stolen',
};

/**
 * Error codes
 */
const ERROR_CODES = {
  // Authentication
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  UNAUTHORIZED: 'UNAUTHORIZED',
  
  // Account
  ACCOUNT_NOT_FOUND: 'ACCOUNT_NOT_FOUND',
  ACCOUNT_FROZEN: 'ACCOUNT_FROZEN',
  ACCOUNT_CLOSED: 'ACCOUNT_CLOSED',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  
  // Transaction
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  TRANSACTION_LIMIT_EXCEEDED: 'TRANSACTION_LIMIT_EXCEEDED',
  INVALID_ACCOUNT: 'INVALID_ACCOUNT',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // System
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // Fraud
  FRAUD_DETECTED: 'FRAUD_DETECTED',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  
  // Limits
  LIMIT_EXCEEDED: 'LIMIT_EXCEEDED',
  DAILY_LIMIT_EXCEEDED: 'DAILY_LIMIT_EXCEEDED',
  MONTHLY_LIMIT_EXCEEDED: 'MONTHLY_LIMIT_EXCEEDED',
};

export {
  ACCOUNT_TYPES,
  ACCOUNT_STATUS,
  USER_ROLES,
  TRANSACTION_STATUS,
  TRANSACTION_TYPES,
  CURRENCIES,
  CARD_TYPES,
  CARD_STATUS,
  ERROR_CODES,
};
