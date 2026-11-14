import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

import { AuthLayout } from '@/components/layout/AuthLayout';
import { Alert } from '@/components/common/Alert';
import { LoginForm } from '@/components/forms/LoginForm';
import { clearError } from '@/store/slices/authSlice';

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

/**
 * Sign-in page.
 *
 * The previous version simulated authentication with a `setTimeout` and then
 * navigated to `/dashboard` without touching auth state — so any password
 * "worked" locally and `AuthGuard` immediately bounced the user back to
 * `/login`. It now renders the real `LoginForm`, which dispatches to the API and
 * only navigates once the store reports an authenticated session.
 */
const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  return (
    <AuthLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Sign in with your email, password and authenticator code.
          </p>
        </div>

        {USE_MOCK_API && (
          <Alert
            variant="info"
            className="mb-6"
            icon={Info}
            title="Preview mode — mock API"
            description="Email demo@securebank.test · password SecureBank!2026 · the current 6-digit code is shown after you start enrolment in the Security Centre. Five wrong passwords lock sign-in for 15 minutes so you can see the lockout behave."
          />
        )}

        <LoginForm onSuccess={() => navigate('/dashboard', { replace: true })} />
      </motion.div>
    </AuthLayout>
  );
};

export { Login };
export default Login;
