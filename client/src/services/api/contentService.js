import axiosInstance from './axiosInstance';

/**
 * Service for billers, scheduled payments, investments, loans, analytics and
 * help content.
 *
 * These endpoints did not exist, which is why the sidebar marked Payments,
 * Cards, Investments, Loans, Analytics, Beneficiaries, Settings and Help Center
 * as "coming soon" while the components for them were already written. Served by
 * the Node backend in production and by `client/mock/extraRoutes.js` in preview.
 *
 * `axiosInstance` unwraps the `{ success, data }` envelope, so callers read
 * `response.data` and get the payload directly.
 */
export const contentService = {
  /* -------------------------------- billers ------------------------------ */
  getBillers: (category) =>
    axiosInstance.get('/billers', { params: category ? { category } : undefined }),

  /* --------------------------- scheduled payments ------------------------ */
  getScheduledPayments: () => axiosInstance.get('/scheduled-payments'),
  createScheduledPayment: (payload) => axiosInstance.post('/scheduled-payments', payload),
  updateScheduledPayment: (id, payload) => axiosInstance.patch(`/scheduled-payments/${id}`, payload),
  cancelScheduledPayment: (id) => axiosInstance.delete(`/scheduled-payments/${id}`),

  /* ------------------------------- payments ------------------------------ */
  getPayments: (limit = 25) => axiosInstance.get('/payments', { params: { limit } }),
  makePayment: (payload) => axiosInstance.post('/payments', payload),

  /* ----------------------------- investments ----------------------------- */
  getPortfolio: () => axiosInstance.get('/investments/portfolio'),
  getHolding: (idOrSymbol) => axiosInstance.get(`/investments/holdings/${idOrSymbol}`),

  /* --------------------------------- loans ------------------------------- */
  getLoans: () => axiosInstance.get('/loans'),
  getLoan: (id) => axiosInstance.get(`/loans/${id}`),
  getLoanSchedule: (id) => axiosInstance.get(`/loans/${id}/schedule`),
  /** Indicative only — never a credit decision. */
  getLoanQuote: ({ amount, annualRate, termMonths }) =>
    axiosInstance.post('/loans/quote', { amount, annualRate, termMonths }),
  submitLoanApplication: (payload) => axiosInstance.post('/loans/applications', payload),
  getLoanApplications: () => axiosInstance.get('/loans/applications'),

  /* ------------------------------- analytics ----------------------------- */
  getAnalyticsOverview: () => axiosInstance.get('/analytics/overview'),

  /* ---------------------------------- help ------------------------------- */
  // Public: help content must be reachable when you are locked out.
  getHelpTopics: () => axiosInstance.get('/help/topics'),
  searchHelp: (query) => axiosInstance.post('/help/search', { query }),
};

export default contentService;
