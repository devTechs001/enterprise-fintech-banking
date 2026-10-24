import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ToastProvider } from '@/context/ToastContext';
import { store, persistor } from '@/store';
import PropTypes from 'prop-types';

/**
 * App providers wrapper
 * Provides Redux store, persistence, and toast context to the app
 */
const AppProviders = ({ children }) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ToastProvider>{children}</ToastProvider>
      </PersistGate>
    </Provider>
  );
};

AppProviders.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppProviders;
