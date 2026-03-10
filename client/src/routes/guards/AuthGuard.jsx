import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * Guard for authenticated routes
 * Redirects to login if user is not authenticated
 */
const AuthGuard = ({ children }) => {
  const { isAuthenticated, isInitialized } = useSelector((state) => state.auth);

  // Wait for initialization
  if (!isInitialized) {
    return null; // Or show a loading spinner
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

AuthGuard.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthGuard;
