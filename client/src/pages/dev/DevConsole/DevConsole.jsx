import { Link } from 'react-router-dom';
import { FlaskConical, ShieldAlert } from 'lucide-react';

import { APP_NAME, APP_VERSION, API_BASE_URL, IS_DEV, IS_PROD, USE_MOCK_API, DEV_MODE, MOCK_MODE } from '@/config/env';
import { Alert } from '@/components/common/Alert';
import { Badge } from '@/components/common/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/Card';
import { useAuth } from '@/context/AuthContext';

/**
 * Development console.
 *
 * Mounted ONLY when `isDevMode()` — see `src/routes/index.jsx`, where the route is
 * added conditionally and the component is `React.lazy`, so a production bundle
 * neither registers the path nor downloads the chunk. This is not auth-protected
 * on purpose: it is unreachable in production, and in development the whole app is
 * already mock data, so gating it behind a login would protect nothing while
 * making the tool annoying to reach.
 *
 * It deliberately never prints secrets. The access token is shown as
 * present/absent and its length, never its value — a dev console that echoes
 * bearer tokens teaches the habit of pasting them into screenshots.
 */
const PUBLIC_ROUTES = [
  ['GET', '/health', 'Liveness, no auth'],
  ['GET', '/help/topics', 'Help content — public so it works while locked out'],
  ['POST', '/help/search', 'Help search — public'],
  ['POST', '/help/contact', 'Support message — public, returns a ticket id'],
];

const MOCK_ROUTES = [
  ['POST', '/auth/login', 'Returns requiresMfa + demoCode (dev only)'],
  ['GET', '/accounts', 'Seeded accounts'],
  ['GET', '/billers', 'Bill pay billers'],
  ['POST', '/payments', 'Debits balance; re-checks sufficiency'],
  ['GET', '/loans', 'Loans + products'],
  ['POST', '/loans/applications', 'Soft credit check only'],
  ['GET', '/investments/portfolio', 'Holdings + allocation'],
  ['GET', '/analytics/overview', 'Cashflow, budgets, credit score'],
  ['GET', '/scheduled-payments', 'Recurring instructions (CRUD)'],
];

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
    <span className="text-gray-500 dark:text-gray-400">{label}</span>
    <span className="font-mono text-gray-900 dark:text-white">{value}</span>
  </div>
);

const DevConsole = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-50 text-warning-600 dark:bg-warning-500/10">
          <FlaskConical className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dev console</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {APP_NAME} v{APP_VERSION} — development build. This page does not exist in production.
          </p>
        </div>
      </header>

      <Alert variant="warning" icon={ShieldAlert}>
        Everything on this screen and everything it describes is development-only.
        Balances are in-memory fiction, the one-time codes are shown on screen, and no
        data leaves this browser session.
      </Alert>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Build & mode</CardTitle>
            <CardDescription>Resolved from import.meta.env at build time.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-gray-100 dark:divide-gray-800">
            <Row label="DEV (dev server / vitest)" value={String(IS_DEV)} />
            <Row label="PROD (vite build)" value={String(IS_PROD)} />
            <Row label="Dev mode surface" value={String(DEV_MODE)} />
            <Row label="Mock API in use" value={String(USE_MOCK_API)} />
            <Row label="Mock mode" value={String(MOCK_MODE)} />
            <Row label="API base" value={API_BASE_URL} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session</CardTitle>
            <CardDescription>Presence only — values are never printed.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-gray-100 dark:divide-gray-800">
            <Row label="Signed in" value={user ? 'yes' : 'no'} />
            <Row label="User" value={user ? `${user.firstName} ${user.lastName}` : '—'} />
            <Row label="MFA enrolled" value={user ? String(Boolean(user.mfaEnabled)) : '—'} />
            <Row label="KYC" value={user?.kycStatus ?? '—'} />
            <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
              <span className="text-gray-500 dark:text-gray-400">Web storage holds tokens</span>
              <Badge variant="success" size="sm">no — memory + httpOnly cookie</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Public endpoints (no auth)</CardTitle>
          <CardDescription>Reachable even when signed out or locked out.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {PUBLIC_ROUTES.map(([method, path, note]) => (
              <li key={path} className="flex flex-wrap items-center gap-3 py-2 text-sm">
                <Badge variant="secondary" size="sm">{method}</Badge>
                <code className="font-mono text-gray-900 dark:text-white">{path}</code>
                <span className="text-gray-500 dark:text-gray-400">{note}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {MOCK_MODE && (
        <Card>
          <CardHeader>
            <CardTitle>Mock API surface</CardTitle>
            <CardDescription>Served by client/mock/mockApiPlugin.js — dev server only.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {MOCK_ROUTES.map(([method, path, note]) => (
                <li key={path} className="flex flex-wrap items-center gap-3 py-2 text-sm">
                  <Badge variant="info" size="sm">{method}</Badge>
                  <code className="font-mono text-gray-900 dark:text-white">{API_BASE_URL}{path}</code>
                  <span className="text-gray-500 dark:text-gray-400">{note}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Looking for the app? <Link to="/dashboard" className="font-medium underline">Dashboard</Link> ·{' '}
        <Link to="/" className="font-medium underline">Public site</Link> ·{' '}
        <Link to="/help" className="font-medium underline">Help centre</Link>
      </p>
    </div>
  );
};

export { DevConsole };
export default DevConsole;
