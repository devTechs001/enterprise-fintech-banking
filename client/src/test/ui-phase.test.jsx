import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { store } from '@/store';
import { ToastProvider } from '@/context/ToastContext';
import { NotificationProvider } from '@/context/NotificationContext';
import AppRoutes from '@/routes';

/**
 * Regression tests for the UI/functionality pass.
 *
 * The defect class this file exists for is the one a build cannot see. Every page
 * tested here compiled cleanly, and `vite build` was green, while:
 *
 *  - nine sidebar entries navigated to a 404 redirect, because the routes were
 *    never mounted;
 *  - `Overview` rendered the literal string "Overview" and nothing else;
 *  - `BillPayment` had no field for the meter number the API requires, so it could
 *    not complete a single payment;
 *  - `LoanApplicationForm` posted no `productId`, so the API answered 422
 *    "Choose a loan product." on every submit;
 *  - the landing page's nav linked to sections that did not exist.
 *
 * None of those throw. They render a plausible screen and quietly do nothing, which
 * is why they are asserted here rather than left to the compiler.
 */

const account = {
  id: 'acc_1', accountNumber: '40011122233', accountName: 'Everyday Checking',
  accountType: 'checking', currency: 'USD', balance: 18420.55, holdBalance: 250,
  availableBalance: 18170.55, isPrimary: true, isFrozen: false, status: 'active',
  dailyTransferLimit: 5000, iban: 'US33xx', openedAt: '2025-01-01T00:00:00.000Z',
};

const biller = {
  id: 'blr_power', name: 'Kenya Power', category: 'Utilities', currency: 'KES',
  accountLabel: 'Meter number', minLength: 11, minAmount: 100,
};

const product = {
  id: 'prd_personal', name: 'Personal Loan', type: 'Personal', minAmount: 1000,
  maxAmount: 50000, rateFrom: 10.5, rateTo: 16, terms: [12, 24, 36, 48],
  processingFeePercent: 1, requiresCollateral: false, decisionHours: 24,
};

const loan = {
  id: 'ln_1', product: 'Personal Loan', status: 'active', principal: 12000,
  outstanding: 8400, emi: 562.08, annualRate: 11.5, termMonths: 24,
  currency: 'USD', startDate: '2026-01-13',
};

const mockResponses = {
  '/accounts': { accounts: [account], totalBalance: account.balance },
  '/billers': { billers: [biller], categories: ['Utilities'] },
  '/scheduled-payments': { scheduledPayments: [], totalUpcoming: 0 },
  '/payments': { payments: [], summary: {} },
  '/investments/portfolio': { portfolio: null },
  '/loans': { loans: [loan], products: [product], summary: { active: 1, outstanding: loan.outstanding } },
  '/analytics/overview': {
    analytics: {
      netWorth: 251475.67, netWorthChange: 3.4, savingsRate: 24.8,
      cashflow: [{ month: 'Nov', income: 5600, expenses: 2970 }],
      byCategory: [], topMerchants: [], budgetProgress: [],
    },
    creditScore: { score: 782, band: 'Excellent', history: [], factors: [] },
  },
  '/help/topics': { topics: [], faqs: [] },
  '/beneficiaries': { beneficiaries: [] },
  '/cards': { cards: [] },
  '/notifications': { notifications: [], unreadCount: 0 },
};

vi.mock('@/api/axiosInstance', () => {
  const find = (url) => {
    const path = String(url).split('?')[0];
    const hit = Object.keys(mockResponses).find((k) => path === k || path.startsWith(`${k}/`));
    if (!hit) return Promise.reject(Object.assign(new Error(`no mock for ${path}`), { apiMessage: 'not found' }));
    return Promise.resolve({ data: mockResponses[hit] });
  };
  const axiosInstance = {
    get: vi.fn((url) => find(url)),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    patch: vi.fn(() => Promise.resolve({ data: {} })),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  };
  return { axiosInstance, default: axiosInstance, SESSION_EXPIRED_EVENT: 'securebank:session-expired' };
});

const mockUser = {
  id: 'u1', email: 'demo@securebank.test', firstName: 'Amina', lastName: 'Wanjiru',
  phoneNumber: '+254712345678', role: 'user', status: 'active', emailVerified: true,
  phoneVerified: true, mfaEnabled: true, mfaMethod: 'authenticator',
  kycStatus: 'verified', riskLevel: 'low',
};

// `useAuth` throws outside AuthProvider, and mounting the real provider would kick
// off its async session bootstrap. The pages under test only read `user`/`logout`.
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    logout: vi.fn(async () => {}),
    isInitialized: true,
    isAuthenticated: true,
    isLoading: false,
  }),
  AuthProvider: ({ children }) => children,
  AuthContext: { Provider: ({ children }) => children },
}));

vi.mock('@/services/api/authService', () => ({
  authService: {
    login: vi.fn(), verifyMfa: vi.fn(), logout: vi.fn(async () => ({ data: {} })),
    refreshToken: vi.fn(), getCurrentUser: vi.fn(), forgotPassword: vi.fn(),
    resetPassword: vi.fn(), changePassword: vi.fn(), setupMfa: vi.fn(),
    enableMfa: vi.fn(), disableMfa: vi.fn(),
  },
  default: {},
}));

const signIn = () => {
  store.dispatch({ type: 'auth/setCredentials', payload: { user: mockUser, token: 'tok' } });
  store.dispatch({ type: 'auth/setInitialized', payload: true });
};

const renderRoute = (route) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <ToastProvider>
            <MemoryRouter initialEntries={[route]}>
              <AppRoutes />
            </MemoryRouter>
          </ToastProvider>
        </NotificationProvider>
      </QueryClientProvider>
    </Provider>
  );
};

beforeEach(() => {
  store.dispatch({ type: 'auth/clearCredentials' });
  signIn();
});

/**
 * Every route the sidebar advertises. Each entry asserts the page's own heading,
 * which is what distinguishes "the real page rendered" from "the 404 redirect
 * rendered" — both are 200-status client-side renders, and only the heading differs.
 */
const ROUTES = [
  ['/accounts', /accounts/i],
  ['/transfers', /transfer/i],
  ['/beneficiaries', /beneficiar/i],
  ['/payments', /payments/i],
  ['/cards', /cards/i],
  ['/investments', /investments/i],
  ['/loans', /loans/i],
  ['/analytics', /analytics/i],
  ['/security', /security/i],
  ['/notifications', /notifications/i],
  ['/settings', /settings/i],
];

describe('every sidebar destination resolves to its own page', () => {
  it.each(ROUTES)('%s renders a real page, not the 404 redirect', async (route, heading) => {
    renderRoute(route);
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
    });
    // The catch-all used to swallow all nine of these routes.
    expect(screen.queryByRole('heading', { name: /page not found/i })).not.toBeInTheDocument();
  });

  it('/help is reachable without a session, because that is when it is needed', async () => {
    store.dispatch({ type: 'auth/clearCredentials' });
    store.dispatch({ type: 'auth/setInitialized', payload: true });
    renderRoute('/help');
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /help centre/i })).toBeInTheDocument();
    });
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
  });
});

describe('Overview was a placeholder that rendered one word', () => {
  it('now renders real balances and security posture', async () => {
    const { Overview } = await import('@/pages/dashboard/Overview/Overview');
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter><Overview /></MemoryRouter>
        </QueryClientProvider>
      </Provider>
    );
    // The old component's entire output was the string "Overview".
    await waitFor(() => {
      expect(screen.getByText(/total balance/i)).toBeInTheDocument();
    });
    // The figure legitimately appears twice: once in the summary card and once on
    // the account card below it, so assert on at least one rather than exactly one.
    expect(screen.getAllByText(/18,420\.55/).length).toBeGreaterThan(0);
    expect(screen.getByText(/savings rate/i)).toBeInTheDocument();
  });
});

describe('BillPayment could not complete a payment', () => {
  it('collects the meter reference the API requires, and will not submit without it', async () => {
    const { BillPayment } = await import('@/components/payments/BillPayment');
    const onPay = vi.fn(async () => ({ data: { balance: 18170.55 } }));
    const user = userEvent.setup();

    render(
      <Provider store={store}>
        <ToastProvider>
          <BillPayment
            bills={[{ id: biller.id, name: biller.name, accountNumber: biller.accountLabel, dueAmount: biller.minAmount, minLength: biller.minLength, referenceLabel: biller.accountLabel }]}
            available={account.availableBalance}
            dailyLimit={account.dailyTransferLimit}
            onPay={onPay}
          />
        </ToastProvider>
      </Provider>
    );

    await user.click(screen.getByText(biller.name));

    // The biller's own label names the field, not a generic "reference".
    const reference = screen.getByLabelText(/meter number/i);
    expect(reference).toBeInTheDocument();
    expect(screen.getByText(/minimum 11 characters/i)).toBeInTheDocument();

    const payButton = screen.getByRole('button', { name: /pay bill/i });
    expect(payButton).toBeDisabled();

    await user.type(reference, 'REF-123');
    expect(payButton).toBeDisabled();
    expect(screen.getByText(/at least 11 characters/i)).toBeInTheDocument();
    expect(onPay).not.toHaveBeenCalled();

    await user.clear(reference);
    await user.type(reference, 'REF-0001234567');
    // Still gated on the amount, which is the other half of the submit condition.
    expect(payButton).toBeDisabled();
    await user.type(screen.getByLabelText(/amount/i), '250');
    expect(payButton).not.toBeDisabled();
  });

  it('passes the reference through to the caller rather than the field label', async () => {
    const { BillPayment } = await import('@/components/payments/BillPayment');
    const onPay = vi.fn(async () => ({ data: { balance: 1 } }));
    const user = userEvent.setup();

    render(
      <Provider store={store}>
        <ToastProvider>
          <BillPayment
            bills={[{ id: biller.id, name: biller.name, accountNumber: biller.accountLabel, dueAmount: 100, minLength: biller.minLength, referenceLabel: biller.accountLabel }]}
            available={5000}
            onPay={onPay}
          />
        </ToastProvider>
      </Provider>
    );

    await user.click(screen.getByText(biller.name));
    await user.type(screen.getByLabelText(/meter number/i), 'REF-0001234567');
    await user.type(screen.getByLabelText(/amount/i), '250');
    await user.click(screen.getByRole('button', { name: /pay bill/i }));

    await waitFor(() => expect(onPay).toHaveBeenCalled());
    const arg = onPay.mock.calls[0][0];
    expect(arg.reference).toBe('REF-0001234567');
    expect(arg.reference).not.toBe('Meter number');
    expect(arg.amount).toBe(250);
  });
});

describe('LoanApplicationForm posted no productId, so the API answered 422', () => {
  it('offers the products and submits the chosen productId', async () => {
    const { LoanApplicationForm } = await import('@/components/forms/LoanApplicationForm');
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(
      <Provider store={store}>
        <ToastProvider>
          <MemoryRouter>
            <LoanApplicationForm products={[product]} onSubmit={onSubmit} />
          </MemoryRouter>
        </ToastProvider>
      </Provider>
    );

    // The product field exists at all — the previous version had no such field, so
    // the API rejected every submission with 422 "Choose a loan product."
    expect(screen.getByLabelText(/^product$/i)).toBeInTheDocument();
    const combobox = screen.getByRole('combobox', { name: /^product$/i });

    // Submitting empty must be refused client-side, before a pointless round trip.
    await user.click(screen.getByRole('button', { name: /submit application/i }));
    await waitFor(() => expect(screen.getByText(/choose a product/i)).toBeInTheDocument());
    expect(onSubmit).not.toHaveBeenCalled();

    // Options only exist once the listbox is open — this Select is a custom
    // combobox, not a native <select>, so the assertion has to drive it.
    await user.click(combobox);
    const option = await screen.findByRole('option', { name: /personal loan/i });
    expect(option).toHaveAttribute('aria-selected', 'false');
    await user.click(option);
    await waitFor(() => expect(combobox).toHaveTextContent(/personal loan/i));

    // The consent box must not be pre-ticked: a credit check is a regulated act.
    expect(screen.getByRole('checkbox', { name: /consent/i })).not.toBeChecked();
  });
});

describe('landing page navigation', () => {
  it('has a section behind every anchor the nav advertises', async () => {
    const { default: Landing } = await import('@/pages/public/Landing/Landing');
    render(<MemoryRouter><Landing /></MemoryRouter>);

    // The old page linked to #pricing / #about / #contact, none of which existed.
    for (const id of ['features', 'security', 'get-started']) {
      expect(document.getElementById(id), `#${id} should exist`).not.toBeNull();
    }
    for (const dead of ['pricing', 'about', 'contact']) {
      expect(document.getElementById(dead), `#${dead} was removed with its dead link`).toBeNull();
    }
  });

  it('has no footer link pointing at "#"', async () => {
    const { default: Landing } = await import('@/pages/public/Landing/Landing');
    const { container } = render(<MemoryRouter><Landing /></MemoryRouter>);
    const deadLinks = within(container).queryAllByRole('link').filter((a) => a.getAttribute('href') === '#');
    expect(deadLinks).toHaveLength(0);
  });
});

describe('error pages', () => {
  it('404 names the path that was asked for', async () => {
    renderRoute('/this-route-does-not-exist');
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument();
    });
    // Interpolated as text, never as HTML.
    expect(screen.getByText(/this-route-does-not-exist/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /help centre/i })).toBeInTheDocument();
  });

  it('500 offers a retry and leaks no internal detail', async () => {
    renderRoute('/500');
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.queryByText(/stack|sequelize|errno/i)).not.toBeInTheDocument();
  });
});

describe('splash screen', () => {
  it('renders while the session is unresolved instead of a blank page', async () => {
    const { SplashScreen } = await import('@/components/common/SplashScreen');
    render(<MemoryRouter><SplashScreen label="Restoring your session…" /></MemoryRouter>);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/restoring your session/i)).toBeInTheDocument();
    expect(screen.getByText(/SecureBank/i)).toBeInTheDocument();
  });

  it('index.html paints a splash before any JavaScript runs', async () => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const html = readFileSync(join(process.cwd(), 'index.html'), 'utf8');
    expect(html).toContain('id="splash"');
    expect(html).toContain('/favicon.svg');
    expect(html).toContain('/manifest.webmanifest');
    // The Vite default mark no longer ships on a banking app.
    expect(html).not.toContain('/vite.svg');
    expect(html).toContain('noindex');
  });
});

describe('sidebar', () => {
  it('has no inert "soon" entries left', async () => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const src = readFileSync(
      join(process.cwd(), 'src/components/layout/MainLayout/Sidebar/Sidebar.jsx'), 'utf8'
    );
    expect(src).not.toMatch(/soon:\s*true/);
    // Every advertised destination must be mounted in the route table.
    const routes = readFileSync(join(process.cwd(), 'src/routes/index.jsx'), 'utf8');
    const destinations = [...src.matchAll(/to:\s*'([^']+)'/g)].map((m) => m[1]);
    expect(destinations.length).toBeGreaterThanOrEqual(13);
    for (const to of destinations) {
      expect(routes, `${to} must be routed`).toContain(`path="${to}"`);
    }
  });
});

describe('no placeholder components remain', () => {
  it('nothing renders as a bare named div', async () => {
    const { readdirSync, readFileSync, statSync } = await import('node:fs');
    const { join } = await import('node:path');
    const roots = ['src/components', 'src/pages'];
    const stubs = [];
    const walk = (dir) => {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) { walk(full); continue; }
        if (!/\.(jsx|js)$/.test(full)) continue;
        // Strip comments first: these files document the defect they replaced in
        // prose, and a naive scan matches that prose and reports the fix as broken.
        const text = readFileSync(full, 'utf8')
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/(^|[^:"'\\])\/\/[^\n]*/g, (m, g1) => g1);
        // e.g. `export const CardControls = () => <div>CardControls</div>;`
        const hit = text.match(/export const (\w+) = \(\) => <div>\1<\/div>;/);
        if (hit) stubs.push(`${full}: ${hit[1]}`);
      }
    };
    roots.forEach(walk);
    expect(stubs).toEqual([]);
  });
});
