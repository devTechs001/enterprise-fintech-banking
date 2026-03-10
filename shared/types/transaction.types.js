// Transaction Types
/**
 * @typedef {Object} Transaction
 * @property {string} id - Transaction ID
 * @property {string} transactionId - Unique transaction identifier
 * @property {string} userId - User ID
 * @property {string} accountId - Source account ID
 * @property {string} [destinationAccountId] - Destination account ID
 * @property {string} type - Transaction type
 * @property {number} amount - Transaction amount
 * @property {string} currency - Currency code
 * @property {string} status - Transaction status
 * @property {string} direction - Credit or debit
 * @property {Date} createdAt - Creation timestamp
 */

export const TransactionTypes = {
  TRANSFER: 'transfer',
  PAYMENT: 'payment',
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  PURCHASE: 'purchase',
  REFUND: 'refund',
};

export const TransactionStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REVERSED: 'reversed',
};

export default TransactionTypes;
