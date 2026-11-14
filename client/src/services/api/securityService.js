import axiosInstance from './axiosInstance';

/**
 * Security & notification service.
 *
 * Backs the Security Centre: session management, trusted devices, the audit
 * trail, step-up MFA enrolment, and in-app notifications. Every call hits a real
 * API route (`/api/v1/security/*`, `/api/v1/notifications`) — served by the Node
 * backend, or by `client/mock/mockApiPlugin.js` in preview mode.
 */
export const securityService = {
  /* ------------------------------ sessions ----------------------------- */
  getSessions: () => axiosInstance.get('/security/sessions'),
  revokeSession: (sessionId) => axiosInstance.delete(`/security/sessions/${sessionId}`),
  revokeAllSessions: () => axiosInstance.delete('/security/sessions'),

  /* ------------------------------- devices ----------------------------- */
  getDevices: () => axiosInstance.get('/security/devices'),
  setDeviceTrusted: (deviceId, trusted) =>
    axiosInstance.patch(`/security/devices/${deviceId}`, { trusted }),
  removeDevice: (deviceId) => axiosInstance.delete(`/security/devices/${deviceId}`),

  /* ------------------------------ audit log ---------------------------- */
  getAuditLog: (limit = 25) => axiosInstance.get('/security/audit-log', { params: { limit } }),
  getSecurityOverview: () => axiosInstance.get('/security/overview'),

  /* --------------------------------- MFA ------------------------------- */
  setupMfa: () => axiosInstance.post('/security/mfa/setup'),
  enableMfa: (code) => axiosInstance.post('/security/mfa/enable', { code }),
  disableMfa: (code) => axiosInstance.post('/security/mfa/disable', { code }),

  /* ---------------------------- notifications -------------------------- */
  getNotifications: () => axiosInstance.get('/notifications'),
  markNotificationRead: (id) => axiosInstance.patch(`/notifications/${id}/read`),
  markAllNotificationsRead: () => axiosInstance.post('/notifications/read-all'),
};

export default securityService;
