import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { store } from '@/store';
import { ToastProvider } from '@/context/ToastContext';
import Login from '@/pages/auth/Login/Login';
import { AuthGuard } from '@/routes/guards';

/**
 * Regression tests for the defects that made the client non-functional.
 *
 * Each case pins a specific breakage found in the review so it cannot silently
 * come back.
 */

vi.mock('@/api/axiosInstance', () => {
  const axiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  };
  return { axiosInstance, default: axiosInstance, SESSION_EXPIRED_EVENT: 'securebank:session-expired' };
});

vi.mock('@/services/api/authService', () => ({
  authService: {
    login: vi.fn(),
    verifyMfa: vi.fn(),
    logout: vi.fn(async () => ({ data: {} })),
    refreshToken: vi.fn(),
    getCurrentUser: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    changePassword: vi.fn(),
    setupMfa: vi.fn(),
    enableMfa: vi.fn(),
    disableMfa: vi.fn(),
  },
  default: {},
}));

const renderWithProviders = (ui, { route = '/' } = {}) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
        </ToastProvider>
      </QueryClientProvider>
    </Provider>
  );
};

describe('module graph', () => {
  it('imports the component barrel, which previously re-exported ~30 files that did not exist', async () => {
    const components = await import('@/components');
    expect(components.Button).toBeDefined();
    expect(components.TwoFactorAuth).toBeDefined();
    expect(components.SessionManager).toBeDefined();
    expect(components.NotificationCenter).toBeDefined();
    expect(components.TransferWizard).toBeDefined();
    expect(components.LineChart).toBeDefined();
  });

  it('imports the slice barrel, which previously had a duplicate `clearError` export', async () => {
    const slices = await import('@/store/slices');
    expect(slices.authReducer).toBeTypeOf('function');
    expect(slices.clearAuthError).toBeDefined();
    expect(slices.clearAccountError).toBeDefined();
  });

  it('imports the selectors barrel, which previously pointed at a non-existent ./authSlice', async () => {
    const selectors = await import('@/store/selectors/authSelectors');
    expect(selectors.selectUser).toBeTypeOf('function');
  });

  it('imports every hook barrel without a duplicate file/directory collision', async () => {
    const banking = await import('@/hooks/banking');
    const ui = await import('@/hooks/ui');
    expect(banking.useAccounts).toBeTypeOf('function');
    expect(ui.useToast).toBeTypeOf('function');
  });
});

describe('sign-in', () => {
  beforeEach(() => {
    store.dispatch({ type: 'auth/clearCredentials' });
  });

  it('renders the real form rather than a simulated one', () => {
    renderWithProviders(<Login />, { route: '/login' });
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows the step-up MFA prompt after a correct password', async () => {
    const { authService } = await import('@/services/api/authService');
    authService.login.mockResolvedValueOnce({
      data: { requiresMfa: true, challenge: 'ch_1', mfaMethod: 'authenticator', demoCode: '123456' },
    });

    const user = userEvent.setup();
    renderWithProviders(<Login />, { route: '/login' });

    await user.type(screen.getByLabelText(/email address/i), 'demo@securebank.test');
    await user.type(screen.getByLabelText(/^password$/i), 'SecureBank!2026');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(screen.getByText(/two-step verification/i)).toBeInTheDocument());
    // The password alone must not produce an authenticated session.
    expect(store.getState().auth.isAuthenticated).toBe(false);
    expect(store.getState().auth.mfaRequired).toBe(true);
  });

  it('does not persist tokens or the user profile to web storage', async () => {
    const { authService } = await import('@/services/api/authService');
    authService.login.mockResolvedValueOnce({
      data: { user: { id: 'u1', email: 'a@b.c' }, tokens: { accessToken: 'tok', expiresIn: 900 } },
    });

    const user = userEvent.setup();
    renderWithProviders(<Login />, { route: '/login' });
    await user.type(screen.getByLabelText(/email address/i), 'a@b.c');
    await user.type(screen.getByLabelText(/^password$/i), 'anything');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(store.getState().auth.isAuthenticated).toBe(true));

    // SECURITY: localStorage must never hold an access token, refresh token or profile.
    const dumped = JSON.stringify({ ...localStorage });
    expect(dumped).not.toContain('access_token');
    expect(dumped).not.toContain('refresh_token');
    expect(dumped).not.toContain('tok');
  });
});

describe('route guards', () => {
  it('redirects to /login when the session is not authenticated', () => {
    store.dispatch({ type: 'auth/clearCredentials' });
    store.dispatch({ type: 'auth/setInitialized', payload: true });

    renderWithProviders(
      <AuthGuard><div data-testid="protected">secret</div></AuthGuard>,
      { route: '/dashboard' }
    );

    expect(screen.queryByTestId('protected')).not.toBeInTheDocument();
  });
});
