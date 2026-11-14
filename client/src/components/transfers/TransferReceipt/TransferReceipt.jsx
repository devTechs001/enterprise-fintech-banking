import PropTypes from 'prop-types';
import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { formatCurrency, formatDateTime } from '@/utils/formatters';

/** Post-transfer receipt with the durable reference used for dispute handling. */
const TransferReceipt = ({ transaction, onDone }) => (
  <div className="space-y-5 text-center">
    <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-50 text-success-600 dark:bg-success-500/10">
      <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
    </span>
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transfer complete</h3>
      <p className="mt-1 text-3xl font-bold tabular-nums text-gray-900 dark:text-white">
        {formatCurrency(transaction.amount, transaction.currency || 'USD')}
      </p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">to {transaction.merchantName}</p>
    </div>
    <dl className="space-y-2 rounded-xl bg-gray-50 p-4 text-left text-sm dark:bg-gray-800/50">
      <div className="flex justify-between gap-4">
        <dt className="text-gray-500 dark:text-gray-400">Reference</dt>
        <dd className="font-mono text-xs text-gray-900 dark:text-white">{transaction.reference}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-gray-500 dark:text-gray-400">Transaction ID</dt>
        <dd className="font-mono text-xs text-gray-900 dark:text-white">{transaction.transactionId}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-gray-500 dark:text-gray-400">Date</dt>
        <dd className="text-gray-900 dark:text-white">{formatDateTime(transaction.createdAt)}</dd>
      </div>
    </dl>
    <Button fullWidth onClick={onDone}>Back to dashboard</Button>
  </div>
);

TransferReceipt.propTypes = {
  transaction: PropTypes.shape({
    amount: PropTypes.number.isRequired,
    currency: PropTypes.string,
    merchantName: PropTypes.string.isRequired,
    reference: PropTypes.string.isRequired,
    transactionId: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
  onDone: PropTypes.func,
};

export { TransferReceipt };
export default TransferReceipt;
