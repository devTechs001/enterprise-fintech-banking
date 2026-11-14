import { BrowserRouter } from 'react-router-dom';

import AppProviders from './AppProviders';
import AppRoutes from '../routes';
import SessionGate from './SessionGate';

/**
 * Main App component.
 *
 * `BrowserRouter` is mounted here, ABOVE the providers, because `AuthProvider`
 * navigates on sign-out and `AuthGuard`/`GuestGuard` redirect on route changes.
 * Previously the router lived inside `AppRoutes`, so no provider could use any
 * router hook.
 */
function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        {/* Inside the providers: it reads `isInitialized` from AuthContext, and
            it retires the inline splash painted by index.html before React runs. */}
        <SessionGate>
          <AppRoutes />
        </SessionGate>
      </AppProviders>
    </BrowserRouter>
  );
}

export default App;
