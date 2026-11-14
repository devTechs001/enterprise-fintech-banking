import { Routes, Route } from 'react-router-dom';

import Home from '@/pages/public/Home/Home';
import Features from '@/pages/public/Features/Features';
import Trust from '@/pages/public/Trust/Trust';
import Pricing from '@/pages/public/Pricing/Pricing';
import About from '@/pages/public/About/About';
import Contact from '@/pages/public/Contact/Contact';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { isDevMode } from '@/config/env';
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

import { lazy, Suspense } from 'react';
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
// Loaded only on a dev server (see the conditional route below). `React.lazy` keeps
// the console in its own chunk so a production build neither registers the path nor
// fetches the code; the surrounding `isDevMode()` check is what actually decides.
// Vite replaces `import.meta.env.DEV` / `.PROD` with literal booleans at build time,
// so in a production bundle this whole ternary is `false ? <import> : null` — dead
// code that Rollup removes, taking the dynamic import (and therefore the chunk) with
// it. Going through the `isDevMode()` helper instead would NOT work: Rollup cannot
// constant-fold across the function call, and the chunk would ship after all.
// Production does not ship the dev console, does not register its route, and cannot
// fetch it.
const DevConsole = import.meta.env.DEV && !import.meta.env.PROD
  ? lazy(() => import('@/pages/dev/DevConsole/DevConsole'))
  : null;

const AppRoutes = () => (
  <Routes>
    {/* The public area is a multi-route SPA: each page has its own URL and is
        linkable, refreshable and back-button-correct. It replaced a single long
        scroll whose nav relied on anchors (#pricing, #about, #contact) pointing at
        sections that did not exist. */}
    <Route path="/" element={<Home />} />
    <Route path="/features" element={<Features />} />
    <Route path="/trust" element={<Trust />} />
    <Route path="/pricing" element={<Pricing />} />
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/help" element={<PublicLayout><HelpCenter /></PublicLayout>} />

    {/* Development only. Absent from the route table entirely in production. */}
    {isDevMode() && (
      <Route
        path="/dev"
        element={
          <PublicLayout>
            <Suspense fallback={null}><DevConsole /></Suspense>
          </PublicLayout>
        }
      />
    )}

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
