import { Routes, Route, Navigate } from 'react-router-dom';

import Landing from '@/pages/public/Landing/Landing';
import Login from '@/pages/auth/Login/Login';
import Register from '@/pages/auth/Register/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword/ResetPassword';
import Dashboard from '@/pages/dashboard/Dashboard/Dashboard';
import SecurityCenter from '@/pages/security/SecurityCenter/SecurityCenter';
import Transfers from '@/pages/transfers/Transfers/Transfers';
import Notifications from '@/pages/notifications/Notifications/Notifications';
import NotFound from '@/pages/errors/NotFound/NotFound';
import ServerError from '@/pages/errors/ServerError/ServerError';

import AuthGuard from './guards/AuthGuard';
import GuestGuard from './guards/GuestGuard';

/**
 * Application routes.
 *
 * `BrowserRouter` now lives in `src/app/App.jsx`, above the providers, so
 * `AuthProvider` can navigate on sign-out. The original table only mounted
 * `/dashboard` while the sidebar linked to `/accounts`, `/payments`, `/cards`,
 * `/investments`, `/loans`, `/analytics`, `/beneficiaries`, `/settings` and
 * `/help` — every one of which fell through to the 404 redirect.
 */
const AppRoutes = () => (
  <Routes>
      <Route path="/" element={<Landing />} />

      <Route path="/login" element={<GuestGuard><Login /></GuestGuard>} />
      <Route path="/register" element={<GuestGuard><Register /></GuestGuard>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
      <Route path="/transfers" element={<AuthGuard><Transfers /></AuthGuard>} />
      <Route path="/security" element={<AuthGuard><SecurityCenter /></AuthGuard>} />
      <Route path="/notifications" element={<AuthGuard><Notifications /></AuthGuard>} />

      <Route path="/404" element={<NotFound />} />
      <Route path="/500" element={<ServerError />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
);

export default AppRoutes;
