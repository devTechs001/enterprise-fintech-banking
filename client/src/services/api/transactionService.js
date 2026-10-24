import axiosInstance from './axiosInstance';

/**
 * Transaction service for transaction-related API calls
 */
export const transactionService = {
  /**
   * Get transactions with filters and pagination
   * @param {Object} params - Query params (limit, page, filters)
   * @returns {Promise} Transactions response
   */
  getTransactions: async (params = {}) => {
    return axiosInstance.get('/transactions', { params });
  },

  /**
   * Get a single transaction by id
   * @param {string} transactionId - Transaction id
   * @returns {Promise} Transaction response
   */
  getTransactionById: async (transactionId) => {
    return axiosInstance.get(`/transactions/${transactionId}`);
  },

  /**
   * Create a new transaction
   * @param {Object} data - Transaction data
   * @returns {Promise} Created transaction response
   */
  createTransaction: async (data) => {
    return axiosInstance.post('/transactions', data);
  },
};

export default transactionService;
