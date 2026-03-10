# Shared Constants

export const ACCOUNT_TYPES = {
  CHECKING: 'checking',
  SAVINGS: 'savings',
  INVESTMENT: 'investment',
  CREDIT: 'credit',
};

export const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  FROZEN: 'frozen',
  CLOSED: 'closed',
  PENDING: 'pending',
};

export const TRANSACTION_TYPES = {
  TRANSFER: 'transfer',
  PAYMENT: 'payment',
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  PURCHASE: 'purchase',
  REFUND: 'refund',
  FEE: 'fee',
  INTEREST: 'interest',
};

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  SETTLED: 'settled',
  FAILED: 'failed',
  REVERSED: 'reversed',
};

export const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  JPY: 'JPY',
  INR: 'INR',
  AUD: 'AUD',
  CAD: 'CAD',
  CHF: 'CHF',
  CNY: 'CNY',
};

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPPORT: 'support',
};
