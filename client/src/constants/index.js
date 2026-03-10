/**
 * Constants for the application
 */
const APP_NAME = 'SecureBank';
const APP_VERSION = '1.0.0';

/**
 * API endpoints base URL
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

/**
 * Application routes
 */
const ROUTES = {
  // Public
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  CAREERS: '/careers',
  BLOG: '/blog',
  
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  TWO_FACTOR_AUTH: '/2fa',
  ONBOARDING: '/onboarding',
  
  // Dashboard
  DASHBOARD: '/dashboard',
  OVERVIEW: '/dashboard/overview',
  
  // Accounts
  ACCOUNTS: '/accounts',
  ACCOUNT_DETAIL: '/accounts/:id',
  CREATE_ACCOUNT: '/accounts/new',
  
  // Transactions
  TRANSACTIONS: '/transactions',
  TRANSACTION_DETAIL: '/transactions/:id',
  
  // Transfers
  TRANSFERS: '/transfers',
  NEW_TRANSFER: '/transfers/new',
  BENEFICIARIES: '/beneficiaries',
  
  // Payments
  PAYMENTS: '/payments',
  BILL_PAYMENTS: '/payments/bills',
  QR_PAYMENT: '/payments/qr',
  
  // Cards
  CARDS: '/cards',
  CARD_DETAIL: '/cards/:id',
  APPLY_CARD: '/cards/apply',
  
  // Loans
  LOANS: '/loans',
  APPLY_LOAN: '/loans/apply',
  
  // Investments
  INVESTMENTS: '/investments',
  PORTFOLIO: '/investments/portfolio',
  
  // Settings
  SETTINGS: '/settings',
  PROFILE: '/settings/profile',
  SECURITY: '/settings/security',
  NOTIFICATIONS: '/settings/notifications',
  
  // Support
  SUPPORT: '/support',
  HELP_CENTER: '/help',
  
  // Errors
  NOT_FOUND: '/404',
  SERVER_ERROR: '/500',
  UNAUTHORIZED: '/401',
};

/**
 * Storage keys
 */
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
};

/**
 * HTTP methods
 */
const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

/**
 * Date formats
 */
const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  INPUT: 'yyyy-MM-dd',
  ISO: 'yyyy-MM-ddTHH:mm:ss.SSSZ',
};

/**
 * Pagination defaults
 */
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMIT_OPTIONS: [10, 25, 50, 100],
};

export {
  APP_NAME,
  APP_VERSION,
  API_BASE_URL,
  ROUTES,
  STORAGE_KEYS,
  HTTP_METHODS,
  DATE_FORMATS,
  PAGINATION,
};
