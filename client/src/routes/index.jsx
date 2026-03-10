import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layouts
// import MainLayout from '@/components/layout/MainLayout';
// import AuthLayout from '@/components/layout/AuthLayout';

// Pages - Public
import Landing from '@/pages/public/Landing/Landing';

// Pages - Auth
import Login from '@/pages/auth/Login/Login';
import Register from '@/pages/auth/Register/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword/ResetPassword';

// Pages - Dashboard
import Dashboard from '@/pages/dashboard/Dashboard/Dashboard';

// Guards
import AuthGuard from './guards/AuthGuard';
import GuestGuard from './guards/GuestGuard';

// Error Pages
import NotFound from '@/pages/errors/NotFound/NotFound';
import ServerError from '@/pages/errors/ServerError/ServerError';

/**
 * Main application routes component
 */
const AppRoutes = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        
        {/* Auth Routes - Guest only */}
        <Route
          path="/login"
          element={
            <GuestGuard>
              <Login />
            </GuestGuard>
          }
        />
        <Route
          path="/register"
          element={
            <GuestGuard>
              <Register />
            </GuestGuard>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          }
        />
        
        {/* More protected routes will be added here */}
        {/* <Route path="/accounts" element={<AuthGuard><AccountsList /></AuthGuard>} /> */}
        {/* <Route path="/transactions" element={<AuthGuard><TransactionsList /></AuthGuard>} /> */}
        {/* <Route path="/transfers" element={<AuthGuard><NewTransfer /></AuthGuard>} /> */}
        {/* <Route path="/cards" element={<AuthGuard><CardsList /></AuthGuard>} /> */}
        {/* <Route path="/settings" element={<AuthGuard><Profile /></AuthGuard>} /> */}
        
        {/* Error Routes */}
        <Route path="/404" element={<NotFound />} />
        <Route path="/500" element={<ServerError />} />
        
        {/* Catch all - redirect to 404 */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
