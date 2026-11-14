import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import { AuthLayout } from '@/components/layout/AuthLayout';
import { RegisterForm } from '@/components/forms/RegisterForm';

/**
 * Registration page.
 *
 * Replaces the four-step simulated form that advanced without validating and
 * posted nothing to the API.
 */
const Register = () => {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Open an account in minutes. Identity verification follows by email.
          </p>
        </div>
        <RegisterForm onSuccess={() => navigate('/login', { replace: true })} />
      </motion.div>
    </AuthLayout>
  );
};

export { Register };
export default Register;
