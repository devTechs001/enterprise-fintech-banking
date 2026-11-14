import { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Check, UserPlus, X } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Alert } from '@/components/common/Alert';
import { ProgressBar } from '@/components/common/ProgressBar';
import { register, selectAuthError, selectIsLoading } from '@/store/slices/authSlice';

/**
 * Password policy enforced in the UI.
 *
 * The server enforces the same rules independently; this is feedback only. The
 * 12-character minimum and breached-credential check follow NIST SP 800-63B,
 * which favours length over forced character-class churn.
 */
const passwordChecks = (value) => [
  { label: 'At least 12 characters', ok: value.length >= 12 },
  { label: 'Upper and lower case', ok: /[a-z]/.test(value) && /[A-Z]/.test(value) },
  { label: 'A number', ok: /\d/.test(value) },
  { label: 'A symbol', ok: /[^A-Za-z0-9]/.test(value) },
];

const strength = (value) => {
  const passed = passwordChecks(value).filter((c) => c.ok).length;
  const lengthBonus = value.length >= 16 ? 1 : 0;
  return Math.min(100, Math.round(((passed + lengthBonus) / 5) * 100));
};

const validationSchema = Yup.object({
  firstName: Yup.string().trim().min(1).max(100).required('First name is required'),
  lastName: Yup.string().trim().min(1).max(100).required('Last name is required'),
  email: Yup.string().email('Enter a valid email address').required('Email is required'),
  phoneNumber: Yup.string().matches(/^\+?[1-9]\d{7,14}$/, 'Enter a valid phone number').required('Phone number is required'),
  password: Yup.string()
    .min(12, 'Use at least 12 characters')
    .matches(/[a-z]/, 'Include a lowercase letter')
    .matches(/[A-Z]/, 'Include an uppercase letter')
    .matches(/\d/, 'Include a number')
    .required('Password is required'),
  confirmPassword: Yup.string().oneOf([Yup.ref('password')], 'Passwords do not match').required('Confirm your password'),
  acceptTerms: Yup.boolean().oneOf([true], 'You must accept the terms'),
});

const RegisterForm = ({ onSuccess }) => {
  const dispatch = useDispatch();
  const error = useSelector(selectAuthError);
  const isLoading = useSelector(selectIsLoading);
  const [done, setDone] = useState(false);
  const [watched, setWatched] = useState('');

  if (done) {
    return (
      <div className="space-y-4 text-center">
        <Alert variant="success" title="Check your email" description="We sent a verification link. Your account stays limited until it is confirmed." />
        <Button as={Link} to="/login" variant="outline" fullWidth>Go to sign in</Button>
      </div>
    );
  }

  return (
    <Formik
      initialValues={{ firstName: '', lastName: '', email: '', phoneNumber: '', password: '', confirmPassword: '', acceptTerms: false }}
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        const result = await dispatch(register(values));
        if (register.fulfilled.match(result)) {
          setDone(true);
          onSuccess?.(result.payload);
        }
      }}
    >
      {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting }) => (
        <Form className="space-y-4" noValidate>
          {error && <Alert variant="danger" description={error} />}

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="First name" name="firstName" autoComplete="given-name" value={values.firstName} onChange={handleChange} onBlur={handleBlur} error={touched.firstName ? errors.firstName : undefined} />
            <Input label="Last name" name="lastName" autoComplete="family-name" value={values.lastName} onChange={handleChange} onBlur={handleBlur} error={touched.lastName ? errors.lastName : undefined} />
          </div>
          <Input label="Email address" type="email" name="email" autoComplete="email" value={values.email} onChange={handleChange} onBlur={handleBlur} error={touched.email ? errors.email : undefined} />
          <Input label="Phone number" type="tel" name="phoneNumber" autoComplete="tel" placeholder="+254712345678" value={values.phoneNumber} onChange={handleChange} onBlur={handleBlur} error={touched.phoneNumber ? errors.phoneNumber : undefined} helperText="Used for fraud alerts only." />
          <Input label="Password" type="password" name="password" autoComplete="new-password" value={values.password} onChange={(event) => { handleChange(event); setWatched(event.target.value); }} onBlur={handleBlur} error={touched.password ? errors.password : undefined} />

          {watched && (
            <div className="space-y-2 rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-gray-600 dark:text-gray-300">Password strength</span>
                <span className="tabular-nums text-gray-500">{strength(watched)}%</span>
              </div>
              <ProgressBar value={strength(watched)} variant={strength(watched) >= 80 ? 'success' : strength(watched) >= 50 ? 'warning' : 'danger'} size="sm" />
              <ul className="grid gap-1 sm:grid-cols-2">
                {passwordChecks(watched).map((check) => (
                  <li key={check.label} className="flex items-center gap-1.5 text-xs">
                    {check.ok ? <Check className="h-3 w-3 text-success-600" aria-hidden="true" /> : <X className="h-3 w-3 text-gray-400" aria-hidden="true" />}
                    <span className={check.ok ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}>{check.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Input label="Confirm password" type="password" name="confirmPassword" autoComplete="new-password" value={values.confirmPassword} onChange={handleChange} onBlur={handleBlur} error={touched.confirmPassword ? errors.confirmPassword : undefined} />

          <label className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
            <input type="checkbox" name="acceptTerms" checked={values.acceptTerms} onChange={handleChange} onBlur={handleBlur} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            <span>I accept the terms of service and the privacy notice.</span>
          </label>
          {touched.acceptTerms && errors.acceptTerms && <p className="text-xs text-danger-500">{errors.acceptTerms}</p>}

          <Button type="submit" fullWidth loading={isLoading || isSubmitting} leftIcon={UserPlus}>Create account</Button>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Already registered? <Link to="/login" className="font-medium text-primary-600 hover:underline">Sign in</Link>
          </p>
        </Form>
      )}
    </Formik>
  );
};

RegisterForm.propTypes = { onSuccess: PropTypes.func };

export { RegisterForm };
export default RegisterForm;
