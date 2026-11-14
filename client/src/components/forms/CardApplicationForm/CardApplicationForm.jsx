import PropTypes from 'prop-types';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { CreditCard } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Switch } from '@/components/common/Switch';
import { Alert } from '@/components/common/Alert';

const validationSchema = Yup.object({
  cardType: Yup.string().oneOf(['visa', 'mastercard', 'amex']).required('Choose a card network'),
  variant: Yup.string().oneOf(['virtual', 'physical']).required('Choose virtual or physical'),
  monthlyLimit: Yup.number().positive().max(25000, 'Maximum monthly limit is 25,000').required('Set a monthly limit'),
});

/**
 * Card application.
 *
 * Virtual cards are issued instantly and are online-only by default; physical
 * cards require delivery. A monthly spend limit is mandatory, and every limit
 * can be changed or the card frozen instantly from Card Controls.
 */
const CardApplicationForm = ({ onSubmit, isSubmitting = false, accounts = [] }) => (
  <Formik initialValues={{ accountId: accounts[0]?.id ?? '', cardType: 'visa', variant: 'virtual', monthlyLimit: 1500, international: false }} validationSchema={validationSchema} onSubmit={onSubmit}>
    {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
      <Form className="space-y-4" noValidate>
        <Alert variant="info" title="Instant issue for virtual cards" description="A virtual card is usable immediately and can be frozen or regenerated at any time." />
        {accounts.length > 0 && (
          <Select label="Linked account" name="accountId" value={values.accountId} onChange={(next) => setFieldValue('accountId', next)} options={accounts.map((a) => ({ value: a.id, label: `${a.accountName} (•••• ${String(a.accountNumber).slice(-4)})` }))} />
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Network" name="cardType" value={values.cardType} onChange={(next) => setFieldValue('cardType', next)} error={touched.cardType ? errors.cardType : undefined} options={[{ value: 'visa', label: 'Visa' }, { value: 'mastercard', label: 'Mastercard' }, { value: 'amex', label: 'American Express' }]} />
          <Select label="Format" name="variant" value={values.variant} onChange={(next) => setFieldValue('variant', next)} error={touched.variant ? errors.variant : undefined} options={[{ value: 'virtual', label: 'Virtual' }, { value: 'physical', label: 'Physical' }]} />
        </div>
        <Input label="Monthly limit" type="number" name="monthlyLimit" min="0" value={values.monthlyLimit} onChange={handleChange} onBlur={handleBlur} error={touched.monthlyLimit ? errors.monthlyLimit : undefined} helperText="You can lower this at any time from Card Controls." />
        <Switch label="Allow international transactions" checked={values.international} onChange={() => setFieldValue('international', !values.international)} />
        <Button type="submit" loading={isSubmitting} leftIcon={CreditCard}>Apply for card</Button>
      </Form>
    )}
  </Formik>
);

CardApplicationForm.propTypes = {
  onSubmit: PropTypes.func.isRequired, isSubmitting: PropTypes.bool,
  accounts: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string, accountName: PropTypes.string, accountNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) })),
};

export { CardApplicationForm };
export default CardApplicationForm;
