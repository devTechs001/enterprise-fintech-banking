import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, Calendar } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Checkbox } from '@/components/common/Checkbox';
import { Alert } from '@/components/common/Alert';
import { Stepper } from '@/components/common/Stepper';

const steps = [
  { title: 'Personal Info', description: 'Basic details' },
  { title: 'Contact Info', description: 'How to reach you' },
  { title: 'Security', description: 'Protect your account' },
  { title: 'Verification', description: 'Verify your identity' },
];

const Register = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setIsLoading(true);
    try {
      // Simulate registration - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      navigate('/auth/verify-email');
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                leftIcon={User}
                required
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                leftIcon={User}
                required
              />
            </div>
            <Input
              type="date"
              label="Date of Birth"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              leftIcon={Calendar}
              required
            />
          </>
        );
      case 1:
        return (
          <>
            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              leftIcon={Mail}
              required
            />
            <Input
              type="tel"
              label="Phone Number"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              leftIcon={Phone}
              required
            />
          </>
        );
      case 2:
        return (
          <>
            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              leftIcon={Lock}
              showPasswordToggle
              required
            />
            <Input
              type="password"
              label="Confirm Password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              leftIcon={Lock}
              showPasswordToggle
              required
            />
          </>
        );
      case 3:
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Verify Your Email
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We've sent a verification link to {formData.email}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AuthLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Start your banking journey today</p>
        </div>

        <Stepper steps={steps} currentStep={currentStep} className="mb-8" />

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {renderStep()}

          {currentStep === steps.length - 1 ? (
            <Checkbox
              checked={formData.agreeToTerms}
              onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
              label="I agree to the Terms of Service and Privacy Policy"
              required
            />
          ) : null}

          <Button type="submit" fullWidth loading={isLoading}>
            {currentStep === steps.length - 1 ? 'Create Account' : 'Continue'}
          </Button>
        </form>

        {currentStep > 0 && currentStep < steps.length - 1 && (
          <Button
            type="button"
            variant="ghost"
            fullWidth
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            Back
          </Button>
        )}

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
};

export { Register };
export default Register;
