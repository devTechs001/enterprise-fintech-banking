import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call - replace with actual password reset request
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStatus('success');
    } catch {
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot password</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Enter your email and we&apos;ll send you reset instructions
          </p>
        </div>

        {status === 'success' && (
          <Alert variant="success" className="mb-6">
            If an account exists for that email, reset instructions have been sent.
          </Alert>
        )}

        {status === 'error' && (
          <Alert variant="error" className="mb-6">
            Unable to send reset instructions. Please try again.
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={Mail}
            required
          />

          <Button type="submit" fullWidth loading={isLoading}>
            Send Reset Link
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Remembered your password?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export { ForgotPassword };
export default ForgotPassword;
