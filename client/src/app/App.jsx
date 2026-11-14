import { BrowserRouter } from 'react-router-dom';

import AppProviders from './AppProviders';
import AppRoutes from '../routes';

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
        <AppRoutes />
      </AppProviders>
    </BrowserRouter>
  );
}

export default App;
