import PropTypes from 'prop-types';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { UserPlus } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Alert } from '@/components/common/Alert';

const validationSchema = Yup.object({
  name: Yup.string().trim().max(100).required('Beneficiary name is required'),
  accountNumber: Yup.string().matches(/^\d{8,20}$/, 'Enter an 8–20 digit account number').required('Account number is required'),
  bankName: Yup.string().trim().max(100).required('Bank name is required'),
  bankCode: Yup.string().trim().length(4, 'Bank code must be 4 characters').uppercase().required('Bank code is required'),
});

/**
 * Add a beneficiary.
 *
 * New beneficiaries should be subject to a cooling-off period and out-of-band
 * confirmation before they can receive funds — the notice below states that
 * explicitly so the control is not silently skipped.
 */
const BeneficiaryForm = ({ onSubmit, isSubmitting = false }) => (
  <Formik
    initialValues={{ name: '', accountNumber: '', bankName: '', bankCode: '' }}
    validationSchema={validationSchema}
    onSubmit={(values, helpers) => {
      Promise.resolve(onSubmit?.(values))
        .then(() => helpers.resetForm())
        .catch((error) => helpers.setErrors({ name: error?.apiMessage || 'Could not save beneficiary' }));
    }}
  >
    {({ values, errors, touched, handleChange, handleBlur }) => (
      <Form className="space-y-4" noValidate>
        <Alert variant="warning" title="24-hour cooling-off period" description="Newly added beneficiaries cannot receive funds until the holding period and out-of-band confirmation complete." />
        <Input label="Beneficiary name" name="name" autoComplete="off" value={values.name} onChange={handleChange} onBlur={handleBlur} error={touched.name ? errors.name : undefined} />
        <Input label="Account number" name="accountNumber" inputMode="numeric" autoComplete="off" value={values.accountNumber} onChange={handleChange} onBlur={handleBlur} error={touched.accountNumber ? errors.accountNumber : undefined} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Bank name" name="bankName" autoComplete="off" value={values.bankName} onChange={handleChange} onBlur={handleBlur} error={touched.bankName ? errors.bankName : undefined} />
          <Input label="Bank code" name="bankCode" maxLength={4} autoComplete="off" placeholder="EQBL" value={values.bankCode} onChange={handleChange} onBlur={handleBlur} error={touched.bankCode ? errors.bankCode : undefined} />
        </div>
        <Button type="submit" loading={isSubmitting} leftIcon={UserPlus}>Add beneficiary</Button>
      </Form>
    )}
  </Formik>
);

BeneficiaryForm.propTypes = { onSubmit: PropTypes.func, isSubmitting: PropTypes.bool };

export { BeneficiaryForm };
export default BeneficiaryForm;
