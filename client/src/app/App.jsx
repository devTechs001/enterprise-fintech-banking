import AppProviders from './AppProviders';
import AppRoutes from './routes';

/**
 * Main App component
 */
function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}

export default App;
