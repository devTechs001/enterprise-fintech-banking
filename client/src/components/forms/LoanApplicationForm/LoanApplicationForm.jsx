import PropTypes from 'prop-types';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { FileText } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Alert } from '@/components/common/Alert';
import { formatCurrency } from '@/utils/formatters';

const TERMS = [3, 6, 12, 24, 36, 48, 60, 120, 180, 240, 300];

const validationSchema = Yup.object({
  productId: Yup.string().required('Choose a product'),
  purpose: Yup.string()
    .oneOf(['personal', 'business', 'mortgage', 'vehicle', 'education'], 'Select a purpose')
    .required('Select a purpose'),
  amount: Yup.number().typeError('Enter a number').positive().required('Amount is required'),
  termMonths: Yup.number().typeError('Select a term').required('Select a term'),
  annualIncome: Yup.number().typeError('Enter a number').positive().required('Annual income is required'),
  consent: Yup.boolean().oneOf([true], 'You must consent to a credit check'),
});

/**
 * Loan application with an affordability pre-check and explicit credit-check consent.
 *
 * Two corrections from the previous version, both of which made the form
 * un-submittable rather than merely awkward:
 *
 *  1. It posted `{ purpose, amount, termMonths }` with no `productId`, and
 *     `POST /loans/applications` rejects with 422 "Choose a loan product." without
 *     one. The product is now a field, and the amount and term ranges come from the
 *     chosen product so the server's own limits are visible before submitting
 *     instead of arriving as an error after.
 *
 *  2. The Purpose `<Select>` was wired to Formik's `handleChange`, but this design
 *     system's Select calls `onChange(value)` with the raw value, not a change
 *     event — so `handleChange` read `event.target.name` off a string and stored
 *     `undefined`. The Term select next to it used `setFieldValue` correctly. Both
 *     now use `setFieldValue`.
 *
 * `consent` is required and never defaulted to true: a credit check is a regulated
 * act and pre-ticked consent is not consent.
 */
const LoanApplicationForm = ({ products = [], initialValues, onSubmit, isSubmitting = false }) => {
  const productOptions = [
    { value: '', label: 'Select a product…' },
    ...products.map((p) => ({
      value: p.id,
      label: `${p.name} · ${p.rateFrom}%–${p.rateTo}% · ${formatCurrency(p.minAmount)}–${formatCurrency(p.maxAmount)}`,
    })),
  ];

  return (
    <Formik
      enableReinitialize
      initialValues={{
        productId: '', purpose: '', amount: '', termMonths: '', annualIncome: '', consent: false,
        ...(initialValues || {}),
      }}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values, errors, touched, handleChange, handleBlur, setFieldValue, setFieldTouched }) => {
        const product = products.find((p) => p.id === values.productId) || null;
        const terms = product?.terms?.length ? product.terms : TERMS;

        return (
          <Form className="space-y-4" noValidate>
            <Alert
              variant="info"
              title="Soft check first"
              description="Submitting runs a soft affordability check, which leaves no footprint on your credit file. A hard enquiry only happens if you accept a formal offer."
            />

            <div>
              <Select
                label="Product"
                name="productId"
                value={values.productId}
                options={productOptions}
                onChange={(next) => {
                  setFieldValue('productId', next);
                  // The valid terms and the amount range both depend on the product,
                  // so the previous selections are no longer known-good.
                  setFieldValue('termMonths', '');
                  setFieldTouched('productId', true, false);
                }}
                onBlur={() => setFieldTouched('productId', true)}
                error={touched.productId ? errors.productId : undefined}
              />
            </div>

            {product && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {product.name}: {formatCurrency(product.minAmount)}–{formatCurrency(product.maxAmount)},
                terms {product.terms.join(', ')} months,
                {' '}{product.processingFeePercent}% processing fee
                {product.requiresCollateral ? ', collateral required' : ', no collateral'}
                . Decision expected within {product.decisionHours}h.
              </p>
            )}

            <div>
              <Select
                label="Purpose"
                name="purpose"
                value={values.purpose}
                onChange={(next) => setFieldValue('purpose', next)}
                onBlur={() => setFieldTouched('purpose', true)}
                error={touched.purpose ? errors.purpose : undefined}
                options={[
                  { value: '', label: 'Select…' },
                  { value: 'personal', label: 'Personal' },
                  { value: 'business', label: 'Business' },
                  { value: 'mortgage', label: 'Mortgage' },
                  { value: 'vehicle', label: 'Vehicle' },
                  { value: 'education', label: 'Education' },
                ]}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Input
                  label="Amount"
                  type="number"
                  name="amount"
                  min={product?.minAmount ?? 0}
                  max={product?.maxAmount ?? undefined}
                  value={values.amount}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.amount ? errors.amount : undefined}
                  helperText={product ? `${formatCurrency(product.minAmount)} – ${formatCurrency(product.maxAmount)}` : undefined}
                />
              </div>
              <div>
                <Select
                  label="Term"
                  name="termMonths"
                  value={values.termMonths}
                  onChange={(next) => setFieldValue('termMonths', next)}
                  onBlur={() => setFieldTouched('termMonths', true)}
                  error={touched.termMonths ? errors.termMonths : undefined}
                  options={[
                    { value: '', label: 'Select…' },
                    ...terms.map((m) => ({ value: String(m), label: `${m} months` })),
                  ]}
                />
              </div>
            </div>

            <div>
              <Input
                label="Annual income"
                type="number"
                name="annualIncome"
                min="0"
                value={values.annualIncome}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.annualIncome ? errors.annualIncome : undefined}
                helperText="Used for the affordability pre-check only."
              />
            </div>

            {product && Number(values.amount) > 0 && Number(values.annualIncome) > 0 && (
              <div
                className={
                  'rounded-lg border p-3 text-sm ' +
                  (Number(values.amount) > Number(values.annualIncome) * 0.4
                    ? 'border-warning-300 bg-warning-50 text-warning-800 dark:border-warning-700 dark:bg-warning-900/20 dark:text-warning-200'
                    : 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300')
                }
              >
                {Number(values.amount) > Number(values.annualIncome) * 0.4
                  ? 'This request is above 40% of your stated annual income. It may not pass the affordability check — you can still submit it.'
                  : 'This request is within 40% of your stated annual income.'}
                {' '}This is an indication, not a decision.
              </div>
            )}

            <label className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                name="consent"
                checked={values.consent}
                onChange={handleChange}
                onBlur={handleBlur}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span>I consent to a soft credit check for this application.</span>
            </label>
            {touched.consent && errors.consent && <p className="text-xs text-danger-500">{errors.consent}</p>}

            <Button type="submit" loading={isSubmitting} leftIcon={FileText}>Submit application</Button>
          </Form>
        );
      }}
    </Formik>
  );
};

LoanApplicationForm.propTypes = {
  products: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    minAmount: PropTypes.number,
    maxAmount: PropTypes.number,
    rateFrom: PropTypes.number,
    rateTo: PropTypes.number,
    terms: PropTypes.arrayOf(PropTypes.number),
    processingFeePercent: PropTypes.number,
    requiresCollateral: PropTypes.bool,
    decisionHours: PropTypes.number,
  })),
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};

export { LoanApplicationForm };
export default LoanApplicationForm;
