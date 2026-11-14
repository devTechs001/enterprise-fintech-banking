import PropTypes from 'prop-types';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Save } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

const validationSchema = Yup.object({
  firstName: Yup.string().trim().max(100).required('First name is required'),
  lastName: Yup.string().trim().max(100).required('Last name is required'),
  email: Yup.string().email('Enter a valid email address').required('Email is required'),
  phoneNumber: Yup.string().matches(/^\+?[1-9]\d{7,14}$/, 'Enter a valid phone number'),
});

/**
 * Profile editor.
 *
 * Email and phone changes are identity-relevant: the API should require
 * re-authentication and re-verification before accepting them.
 */
const ProfileForm = ({ initialValues, onSubmit, isSubmitting = false }) => (
  <Formik initialValues={initialValues} validationSchema={validationSchema} enableReinitialize onSubmit={onSubmit}>
    {({ values, errors, touched, handleChange, handleBlur }) => (
      <Form className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="First name" name="firstName" autoComplete="given-name" value={values.firstName ?? ''} onChange={handleChange} onBlur={handleBlur} error={touched.firstName ? errors.firstName : undefined} />
          <Input label="Last name" name="lastName" autoComplete="family-name" value={values.lastName ?? ''} onChange={handleChange} onBlur={handleBlur} error={touched.lastName ? errors.lastName : undefined} />
        </div>
        <Input label="Email address" type="email" name="email" autoComplete="email" value={values.email ?? ''} onChange={handleChange} onBlur={handleBlur} error={touched.email ? errors.email : undefined} helperText="Changing your email requires re-verification." />
        <Input label="Phone number" type="tel" name="phoneNumber" autoComplete="tel" value={values.phoneNumber ?? ''} onChange={handleChange} onBlur={handleBlur} error={touched.phoneNumber ? errors.phoneNumber : undefined} />
        <Button type="submit" loading={isSubmitting} leftIcon={Save}>Save changes</Button>
      </Form>
    )}
  </Formik>
);

ProfileForm.propTypes = {
  initialValues: PropTypes.shape({
    firstName: PropTypes.string, lastName: PropTypes.string, email: PropTypes.string, phoneNumber: PropTypes.string,
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};

export { ProfileForm };
export default ProfileForm;
