import { useState } from 'react';
import PropTypes from 'prop-types';
import { Receipt } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/Card';
import { Alert } from '@/components/common/Alert';
import { AmountInput } from '@/components/transfers/AmountInput';
import { Input } from '@/components/common/Input';

/**
 * Bill payment.
 *
 * Shares the transfer rails: the amount, limit and beneficiary checks are all
 * enforced by the API, not here.
 *
 * The reference field is not optional polish. Every biller requires an account or
 * meter number, each with its own minimum length, and the API rejects a payment
 * without one — so a form that never asked for it could not complete a single
 * payment. It is validated here too, because a customer should learn the number is
 * too short before they wait on a round trip, but the server's own check is the one
 * that actually decides.
 */
const BillPayment = ({ bills = [], available = 0, dailyLimit, onPay }) => {
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState(null);
  const [reference, setReference] = useState('');
  const [state, setState] = useState(null);

  const minLength = selected?.minLength ?? 0;
  const referenceTrimmed = reference.trim();
  const referenceError = selected && minLength > 0 && referenceTrimmed.length > 0 && referenceTrimmed.length < minLength
    ? `${selected.referenceLabel || 'Reference'} must be at least ${minLength} characters.`
    : undefined;
  const referenceMissing = Boolean(selected && minLength > 0 && referenceTrimmed.length === 0);

  const submit = async () => {
    if (!selected || !amount || referenceMissing || referenceError) return;
    setState({ kind: 'pending' });
    try {
      const result = await onPay?.({ bill: selected, amount, reference: referenceTrimmed });
      setState({ kind: 'success', message: `Paid ${selected.name} ${amount.toLocaleString()}.`, result });
    } catch (error) {
      setState({ kind: 'error', message: error?.apiMessage || 'Payment declined.' });
    }
  };

  return (
    <Card>
      <CardHeader className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10">
          <Receipt className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <CardTitle>Pay a bill</CardTitle>
          <CardDescription>Settle a registered biller from your account.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {bills.length === 0 && (
          <Alert variant="info" title="No registered billers">Add a biller before making a payment.</Alert>
        )}
        <div className="grid gap-2 sm:grid-cols-2">
          {bills.map((bill) => (
            <button
              key={bill.id}
              type="button"
              onClick={() => setSelected(bill)}
              className={
                'rounded-xl border-2 p-3 text-left transition-colors ' +
                (selected?.id === bill.id
                  ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-900/20'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-700')
              }
            >
              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{bill.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Account {bill.accountNumber} · Due {bill.dueAmount?.toLocaleString?.() ?? '—'}
              </p>
            </button>
          ))}
        </div>
        {selected && (
          <>
            <div>
              <Input
                label={selected.referenceLabel || 'Account / meter number'}
                name="reference"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                error={referenceError}
                helperText={minLength > 0
                  ? `As printed on your ${selected.name} bill. Minimum ${minLength} characters.`
                  : `As printed on your ${selected.name} bill.`}
                autoComplete="off"
                // Never prefill or remember a meter number: it identifies a
                // household and is not this browser's to keep.
                spellCheck={false}
              />
            </div>
            <AmountInput value={amount ?? ''} onChange={setAmount} available={available} dailyLimit={dailyLimit} />
          </>
        )}
        {state?.kind === 'error' && <Alert variant="danger" title="Payment declined" description={state.message} />}
        {state?.kind === 'success' && <Alert variant="success" title="Payment sent" description={state.message} />}
        <Button
          onClick={submit}
          disabled={!selected || !amount || referenceMissing || Boolean(referenceError) || state?.kind === 'pending'}
          loading={state?.kind === 'pending'}
        >
          Pay bill
        </Button>
      </CardContent>
    </Card>
  );
};

BillPayment.propTypes = {
  bills: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    accountNumber: PropTypes.string,
    dueAmount: PropTypes.number,
    minLength: PropTypes.number,
    referenceLabel: PropTypes.string,
  })),
  available: PropTypes.number,
  dailyLimit: PropTypes.number,
  onPay: PropTypes.func,
};

export { BillPayment };
export default BillPayment;
