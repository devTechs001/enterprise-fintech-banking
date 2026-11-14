import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { LogIn, ShieldCheck, Lock } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Alert } from '@/components/common/Alert';
import { OTPInput } from '@/components/common/OTPInput';
import { clearError, login, selectAuthError, selectDemoCode, selectIsLoading, selectLockedUntil, selectMfaChallenge, selectMfaRequired, verifyMfa } from '@/store/slices/authSlice';
import { useCountdown } from '@/hooks/ui/useCountdown';

const validationSchema = Yup.object({
  email: Yup.string().email('Enter a valid email address').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

/**
 * Sign-in form with step-up MFA and lockout.
 *
 * The password and the TOTP code are collected in separate submissions: the API
 * withholds tokens until the code is verified, so a stolen password is not
 * enough. Failed attempts are counted server-side and the returned lockout is
 * surfaced here as a live countdown instead of letting the user keep guessing.
 */
const LoginForm = ({ onSuccess }) => {
  const dispatch = useDispatch();
  const error = useSelector(selectAuthError);
  const isLoading = useSelector(selectIsLoading);
  const mfaRequired = useSelector(selectMfaRequired);
  const challenge = useSelector(selectMfaChallenge);
  const demoCode = useSelector(selectDemoCode);
  const lockedUntil = useSelector(selectLockedUntil);

  const [code, setCode] = useState('');
  const [mfaError, setMfaError] = useState(null);

  // Preview mode only: the mock API returns the live TOTP so the step-up flow is
  // clickable without a paired authenticator app.
  useEffect(() => {
    if (demoCode) setCode(demoCode);
  }, [demoCode]);

  const lockSeconds = lockedUntil ? Math.max(0, Math.ceil((new Date(lockedUntil).getTime() - Date.now()) / 1000)) : 0;
  const { seconds: remaining, formatTime } = useCountdown(lockSeconds);
  const locked = remaining > 0;

  useEffect(() => () => dispatch(clearError()), [dispatch]);

  const submitMfa = async (event) => {
    event.preventDefault();
    setMfaError(null);
    if (code.replace(/\s/g, '').length !== 6) {
      setMfaError('Enter the 6-digit code from your authenticator app.');
      return;
    }
    const result = await dispatch(verifyMfa({ code, challenge }));
    if (verifyMfa.fulfilled.match(result)) {
      onSuccess?.(result.payload.user);
    } else {
      setMfaError(result.payload?.message || 'Invalid code.');
      setCode('');
    }
  };

  if (mfaRequired) {
    return (
      <form onSubmit={submitMfa} className="space-y-5">
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-500/10">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">Two-step verification</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Enter the 6-digit code from your authenticator app.
          </p>
        </div>
        <OTPInput value={code} onChange={setCode} error={Boolean(mfaError)} disabled={isLoading} />
        {demoCode && (
          <p className="rounded-lg bg-primary-50 px-3 py-2 text-center text-xs text-primary-700 dark:bg-primary-900/20 dark:text-primary-300">
            Preview mode — your authenticator would show <span className="font-mono font-bold tracking-widest">{demoCode}</span>.
            A real API never returns this code.
          </p>
        )}
        {mfaError && <Alert variant="danger" description={mfaError} />}
        <Button type="submit" fullWidth loading={isLoading}>Verify and continue</Button>
        <button
          type="button"
          onClick={() => dispatch(clearError())}
          className="w-full text-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
        >
          Use a different account
        </button>
      </form>
    );
  }

  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        const result = await dispatch(login(values));
        if (login.fulfilled.match(result) && !result.payload.requiresMfa) onSuccess?.(result.payload.user);
      }}
    >
      {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
        <Form className="space-y-4" noValidate>
          {locked && (
            <Alert
              variant="danger"
              title="Sign-in temporarily locked"
              description={`Too many failed attempts. Try again in ${formatTime()}.`}
              icon={Lock}
            />
          )}
          {error && !locked && <Alert variant="danger" description={error} />}

          <Input
            label="Email address"
            type="email"
            name="email"
            autoComplete="username"
            placeholder="you@example.com"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email ? errors.email : undefined}
            disabled={locked || isSubmitting}
          />
          <Input
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••••••"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.password ? errors.password : undefined}
            disabled={locked || isSubmitting}
          />

          <div className="flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="font-medium text-primary-600 hover:underline">Forgot password?</Link>
            <span className="text-gray-400">MFA required</span>
          </div>

          <Button type="submit" fullWidth loading={isLoading || isSubmitting} disabled={locked} leftIcon={LogIn}>
            Sign in
          </Button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            No account?{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:underline">Create one</Link>
          </p>
        </Form>
      )}
    </Formik>
  );
};

LoginForm.propTypes = { onSuccess: PropTypes.func };

export { LoginForm };
export default LoginForm;
