import PropTypes from 'prop-types';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Send } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { CurrencyInput } from '@/components/common/CurrencyInput';

const validationSchema = Yup.object({
  reference: Yup.string().trim().max(60).required('A payment reference is required'),
  amount: Yup.number().positive('Amount must be positive').required('Amount is required'),
});

/**
 * Single bill / merchant payment.
 *
 * The amount is validated on the client for responsiveness only; limits,
 * available balance and payee eligibility are re-checked by the API.
 */
const PaymentForm = ({ onSubmit, isSubmitting = false, available = 0, currency = 'USD', error }) => (
  <Formik
    initialValues={{ reference: '', amount: '', description: '' }}
    validationSchema={validationSchema}
    onSubmit={(values, helpers) => {
      Promise.resolve(onSubmit?.(values))
        .then(() => helpers.resetForm())
        .catch(() => {});
    }}
  >
    {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
      <Form className="space-y-4" noValidate>
        {error && <p className="rounded-lg bg-danger-50 p-3 text-sm text-danger-700 dark:bg-danger-500/10 dark:text-danger-500">{error}</p>}
        <Input label="Payment reference" name="reference" autoComplete="off" placeholder="e.g. Electricity · Nov" value={values.reference} onChange={handleChange} onBlur={handleBlur} error={touched.reference ? errors.reference : undefined} />
        <CurrencyInput label="Amount" currency={currency} value={values.amount} max={available} onChange={(numeric) => setFieldValue('amount', numeric ?? '')} error={touched.amount ? errors.amount : undefined} hint={`Available ${available.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
        <Input label="Note (optional)" name="description" maxLength={140} value={values.description} onChange={handleChange} onBlur={handleBlur} />
        <Button type="submit" loading={isSubmitting} leftIcon={Send}>Pay now</Button>
      </Form>
    )}
  </Formik>
);

PaymentForm.propTypes = {
  onSubmit: PropTypes.func.isRequired, isSubmitting: PropTypes.bool,
  available: PropTypes.number, currency: PropTypes.string, error: PropTypes.string,
};

export { PaymentForm };
export default PaymentForm;
