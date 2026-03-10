import axios from 'axios';
import { API_BASE_URL } from '@/constants';

/**
 * Account service for account-related API calls
 */
export const accountService = {
  /**
   * Get all accounts
   */
  getAccounts: async () => {
    return axiosInstance.get('/accounts');
  },

  /**
   * Get account by ID
   */
  getAccountById: async (accountId) => {
    return axiosInstance.get(`/accounts/${accountId}`);
  },

  /**
   * Get account balance
   */
  getAccountBalance: async (accountId) => {
    return axiosInstance.get(`/accounts/${accountId}/balance`);
  },

  /**
   * Create new account
   */
  createAccount: async (data) => {
    return axiosInstance.post('/accounts', data);
  },

  /**
   * Update account
   */
  updateAccount: async (accountId, data) => {
    return axiosInstance.patch(`/accounts/${accountId}`, data);
  },

  /**
   * Freeze account
   */
  freezeAccount: async (accountId) => {
    return axiosInstance.post(`/accounts/${accountId}/freeze`);
  },

  /**
   * Unfreeze account
   */
  unfreezeAccount: async (accountId) => {
    return axiosInstance.post(`/accounts/${accountId}/unfreeze`);
  },

  /**
   * Close account
   */
  closeAccount: async (accountId) => {
    return axiosInstance.delete(`/accounts/${accountId}`);
  },

  /**
   * Get account transactions
   */
  getAccountTransactions: async (accountId, params) => {
    return axiosInstance.get(`/accounts/${accountId}/transactions`, { params });
  },

  /**
   * Get account statements
   */
  getAccountStatements: async (accountId, params) => {
    return axiosInstance.get(`/accounts/${accountId}/statements`, { params });
  },
};

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: true,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default accountService;
