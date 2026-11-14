import PropTypes from 'prop-types';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { FileText } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Alert } from '@/components/common/Alert';

const validationSchema = Yup.object({
  purpose: Yup.string().oneOf(['personal', 'business', 'mortgage', 'vehicle', 'education']).required('Select a purpose'),
  amount: Yup.number().positive().min(500, 'Minimum is 500').max(250000, 'Maximum is 250,000').required('Amount is required'),
  termMonths: Yup.number().oneOf([6, 12, 24, 36, 48, 60]).required('Select a term'),
  annualIncome: Yup.number().positive().required('Annual income is required'),
  consent: Yup.boolean().oneOf([true], 'You must consent to a credit check'),
});

/** Loan application with an affordability pre-check and explicit credit-check consent. */
const LoanApplicationForm = ({ onSubmit, isSubmitting = false }) => (
  <Formik initialValues={{ purpose: '', amount: '', termMonths: '', annualIncome: '', consent: false }} validationSchema={validationSchema} onSubmit={onSubmit}>
    {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
      <Form className="space-y-4" noValidate>
        <Alert variant="info" title="Soft check first" description="Submitting runs a soft affordability check. A hard credit enquiry only happens if you accept a formal offer." />
        <Select label="Purpose" name="purpose" value={values.purpose} onChange={handleChange} onBlur={handleBlur} error={touched.purpose ? errors.purpose : undefined} options={[{ value: '', label: 'Select…' }, { value: 'personal', label: 'Personal' }, { value: 'business', label: 'Business' }, { value: 'mortgage', label: 'Mortgage' }, { value: 'vehicle', label: 'Vehicle' }, { value: 'education', label: 'Education' }]} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Amount" type="number" name="amount" min="0" value={values.amount} onChange={handleChange} onBlur={handleBlur} error={touched.amount ? errors.amount : undefined} />
          <Select label="Term" name="termMonths" value={values.termMonths} onChange={(next) => setFieldValue('termMonths', next)} error={touched.termMonths ? errors.termMonths : undefined} options={[{ value: '', label: 'Select…' }, ...[6, 12, 24, 36, 48, 60].map((m) => ({ value: String(m), label: `${m} months` }))]} />
        </div>
        <Input label="Annual income" type="number" name="annualIncome" min="0" value={values.annualIncome} onChange={handleChange} onBlur={handleBlur} error={touched.annualIncome ? errors.annualIncome : undefined} />
        <label className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
          <input type="checkbox" name="consent" checked={values.consent} onChange={handleChange} onBlur={handleBlur} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
          <span>I consent to a credit check for this application.</span>
        </label>
        {touched.consent && errors.consent && <p className="text-xs text-danger-500">{errors.consent}</p>}
        <Button type="submit" loading={isSubmitting} leftIcon={FileText}>Submit application</Button>
      </Form>
    )}
  </Formik>
);

LoanApplicationForm.propTypes = { onSubmit: PropTypes.func.isRequired, isSubmitting: PropTypes.bool };

export { LoanApplicationForm };
export default LoanApplicationForm;
