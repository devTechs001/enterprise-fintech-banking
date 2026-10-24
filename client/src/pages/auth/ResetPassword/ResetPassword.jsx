import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call - replace with actual password reset using token
      await new Promise((resolve) => setTimeout(resolve, 1000));
      navigate('/login');
    } catch {
      setError('Unable to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reset password</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Choose a new password for your account
          </p>
        </div>

        {!token && (
          <Alert variant="warning" className="mb-6">
            This reset link appears to be invalid or incomplete.
          </Alert>
        )}

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="password"
            label="New password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={Lock}
            required
          />

          <Input
            type="password"
            label="Confirm new password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={Lock}
            required
          />

          <Button type="submit" fullWidth loading={isLoading}>
            Reset Password
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};

export { ResetPassword };
export default ResetPassword;
