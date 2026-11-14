import { Routes, Route } from 'react-router-dom';

import Landing from '@/pages/public/Landing/Landing';
import Login from '@/pages/auth/Login/Login';
import Register from '@/pages/auth/Register/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword/ResetPassword';
import Dashboard from '@/pages/dashboard/Dashboard/Dashboard';
import SecurityCenter from '@/pages/security/SecurityCenter/SecurityCenter';
import Transfers from '@/pages/transfers/Transfers/Transfers';
import Notifications from '@/pages/notifications/Notifications/Notifications';
import Accounts from '@/pages/accounts/Accounts/Accounts';
import Payments from '@/pages/payments/Payments/Payments';
import Cards from '@/pages/cards/Cards/Cards';
import Investments from '@/pages/investments/Investments/Investments';
import Loans from '@/pages/loans/Loans/Loans';
import Analytics from '@/pages/analytics/Analytics/Analytics';
import Beneficiaries from '@/pages/beneficiaries/Beneficiaries/Beneficiaries';
import Settings from '@/pages/settings/Settings/Settings';
import HelpCenter from '@/pages/help/HelpCenter/HelpCenter';
import NotFound from '@/pages/errors/NotFound/NotFound';
import ServerError from '@/pages/errors/ServerError/ServerError';

import AuthGuard from './guards/AuthGuard';
import GuestGuard from './guards/GuestGuard';

/**
 * Application routes.
 *
 * `BrowserRouter` lives in `src/app/App.jsx`, above the providers, so
 * `AuthProvider` can navigate on sign-out.
 *
 * The original table mounted only `/dashboard` while the sidebar linked to nine
 * routes that did not exist — every one fell through to the 404 redirect. Those
 * nine pages now exist and are mounted here, so the sidebar has no inert entries
 * left.
 *
 * `HelpCenter` is deliberately OUTSIDE `AuthGuard`: help content is exactly what
 * you need when you are locked out, and putting it behind auth makes it useless
 * in the one situation it was written for.
 */
const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/help" element={<HelpCenter />} />

    <Route path="/login" element={<GuestGuard><Login /></GuestGuard>} />
    <Route path="/register" element={<GuestGuard><Register /></GuestGuard>} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />

    <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
    <Route path="/accounts" element={<AuthGuard><Accounts /></AuthGuard>} />
    <Route path="/transfers" element={<AuthGuard><Transfers /></AuthGuard>} />
    <Route path="/beneficiaries" element={<AuthGuard><Beneficiaries /></AuthGuard>} />
    <Route path="/payments" element={<AuthGuard><Payments /></AuthGuard>} />
    <Route path="/cards" element={<AuthGuard><Cards /></AuthGuard>} />
    <Route path="/investments" element={<AuthGuard><Investments /></AuthGuard>} />
    <Route path="/loans" element={<AuthGuard><Loans /></AuthGuard>} />
    <Route path="/analytics" element={<AuthGuard><Analytics /></AuthGuard>} />
    <Route path="/notifications" element={<AuthGuard><Notifications /></AuthGuard>} />
    <Route path="/security" element={<AuthGuard><SecurityCenter /></AuthGuard>} />
    <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />

    <Route path="/404" element={<NotFound />} />
    <Route path="/500" element={<ServerError />} />
    {/* Rendered in place rather than redirected to /404. A redirect destroys the
        path the user actually typed, so the page could not tell them what was
        missing — it always reported "/404". It also cost a history entry, which
        breaks the back button on a bad link. */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
