import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * Guard for guest-only routes (login, register)
 * Redirects to dashboard if user is already authenticated
 */
const GuestGuard = ({ children }) => {
  const { isAuthenticated, isInitialized } = useSelector((state) => state.auth);

  // Wait for initialization
  if (!isInitialized) {
    return null; // Or show a loading spinner
  }

  // Redirect to dashboard if authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

GuestGuard.propTypes = {
  children: PropTypes.node.isRequired,
};

export default GuestGuard;
