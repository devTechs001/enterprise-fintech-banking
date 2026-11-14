import PropTypes from 'prop-types';
import { ArrowDownLeft, ArrowUpRight, CreditCard } from 'lucide-react';

import { Card as UiCard } from '../../common/Card';
import { Spinner } from '../../common/Spinner';

/**
 * Transactions for one card.
 *
 * Previously `export const CardTransactions = () => <div>CardTransactions</div>;`.
 *
 * Amounts are shown with an explicit direction and a sign, and never rely on
 * colour alone — a red/green pair is unreadable to roughly 1 in 12 men.
 */
const money = (value, currency = '') =>
  `${value < 0 ? '−' : ''}${currency ? `${currency} ` : ''}${Math.abs(Number(value)).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const CardTransactions = ({ transactions = [], cardLabel, isLoading = false, limit = 12 }) => {
  const rows = transactions.slice(0, limit);

  return (
    <UiCard className="p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10">
          <CreditCard className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Card activity</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {cardLabel ? `Most recent for ${cardLabel}` : 'Most recent transactions'}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
          No card transactions yet.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {rows.map((txn) => {
            const outgoing = Number(txn.amount) < 0;
            const Icon = outgoing ? ArrowUpRight : ArrowDownLeft;
            return (
              <li key={txn.id} className="flex items-center gap-3 py-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    outgoing
                      ? 'bg-danger-50 text-danger-600 dark:bg-danger-500/10'
                      : 'bg-success-50 text-success-600 dark:bg-success-500/10'
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {txn.description || txn.merchantName || txn.merchant || 'Card payment'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(txn.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    {txn.category ? ` · ${txn.category}` : ''}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-sm font-semibold tabular-nums ${
                    outgoing ? 'text-gray-900 dark:text-white' : 'text-success-600 dark:text-success-400'
                  }`}
                >
                  <span className="sr-only">{outgoing ? 'Paid ' : 'Received '}</span>
                  {money(txn.amount, txn.currency)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </UiCard>
  );
};

CardTransactions.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.object),
  cardLabel: PropTypes.string,
  isLoading: PropTypes.bool,
  limit: PropTypes.number,
};

export { CardTransactions };
export default CardTransactions;
