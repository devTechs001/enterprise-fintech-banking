import PropTypes from 'prop-types';
import { AlertTriangle } from 'lucide-react';

import { formatCurrency } from '@/utils/formatters';

/** Review step shown before an irreversible transfer is submitted. */
const TransferConfirmation = ({ from, to, amount, fee = 0, reference }) => {
  const total = (Number(amount) || 0) + fee;
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 dark:border-gray-700 dark:divide-gray-800">
        <Row label="From" value={from} />
        <Row label="To" value={to} />
        <Row label="Amount" value={formatCurrency(Number(amount) || 0, 'USD')} strong />
        {fee > 0 && <Row label="Fee" value={formatCurrency(fee, 'USD')} />}
        <Row label="Total debited" value={formatCurrency(total, 'USD')} strong />
        {reference && <Row label="Reference" value={reference} mono />}
      </div>
      <p className="flex items-start gap-2 rounded-xl bg-warning-50 p-3 text-xs text-warning-800 dark:bg-warning-500/10 dark:text-warning-500">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Transfers to a saved beneficiary are final once submitted. Check the details before confirming.
      </p>
    </div>
  );
};

const Row = ({ label, value, strong, mono }) => (
  <div className="flex items-center justify-between gap-4 px-4 py-3">
    <dt className="text-sm text-gray-500 dark:text-gray-400">{label}</dt>
    <dd className={
      'min-w-0 truncate text-right text-sm dark:text-white ' +
      (strong ? 'font-semibold text-gray-900 ' : 'text-gray-700 ') +
      (mono ? 'font-mono text-xs' : '')
    }>
      {value}
    </dd>
  </div>
);

Row.propTypes = { label: PropTypes.string, value: PropTypes.node, strong: PropTypes.bool, mono: PropTypes.bool };

TransferConfirmation.propTypes = {
  from: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  amount: PropTypes.number.isRequired,
  fee: PropTypes.number,
  reference: PropTypes.string,
};

export { TransferConfirmation };
export default TransferConfirmation;
