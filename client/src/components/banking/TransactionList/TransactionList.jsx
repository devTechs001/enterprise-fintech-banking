import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';
import { formatCurrency, formatDateTime, formatRelativeTime } from '@/utils/formatters';
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  CreditCard,
  DollarSign,
  ShoppingBag,
  Home,
  Car,
  Utensils,
  Film,
  Smartphone,
  Activity,
} from 'lucide-react';

const categoryIcons = {
  transfer: ArrowRightLeft,
  payment: CreditCard,
  deposit: ArrowDownLeft,
  withdrawal: ArrowUpRight,
  purchase: ShoppingBag,
  mortgage: Home,
  auto: Car,
  food: Utensils,
  entertainment: Film,
  utilities: Activity,
  phone: Smartphone,
};

const TransactionItem = ({ transaction, variant = 'default', onClick }) => {
  const {
    id,
    type,
    amount,
    currency,
    description,
    category,
    status,
    createdAt,
    direction,
    merchantName,
  } = transaction;

  const Icon = categoryIcons[category] || DollarSign;

  const isCredit = direction === 'credit';

  return (
    <div
      onClick={() => onClick?.(transaction)}
      className={cn(
        'flex items-center justify-between p-4',
        'hover:bg-gray-50 dark:hover:bg-gray-800/50',
        'transition-colors duration-200 cursor-pointer',
        'border-b border-gray-100 dark:border-gray-800 last:border-0',
        variant === 'compact' && 'py-3'
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            isCredit
              ? 'bg-green-100 dark:bg-green-900/30'
              : 'bg-red-100 dark:bg-red-900/30'
          )}
        >
          <Icon
            className={cn(
              'w-5 h-5',
              isCredit
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            )}
          />
        </div>

        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {merchantName || description || type}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formatRelativeTime(new Date(createdAt))}
          </p>
        </div>
      </div>

      <div className="text-right">
        <p
          className={cn(
            'font-semibold',
            isCredit
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          )}
        >
          {isCredit ? '+' : '-'}
          {formatCurrency(Math.abs(amount), currency)}
        </p>
        {status && (
          <p
            className={cn(
              'text-xs capitalize',
              status === 'completed' && 'text-green-600',
              status === 'pending' && 'text-yellow-600',
              status === 'failed' && 'text-red-600'
            )}
          >
            {status}
          </p>
        )}
      </div>
    </div>
  );
};

TransactionItem.propTypes = {
  transaction: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    currency: PropTypes.string,
    description: PropTypes.string,
    category: PropTypes.string,
    status: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
    direction: PropTypes.oneOf(['credit', 'debit']).isRequired,
    merchantName: PropTypes.string,
  }).isRequired,
  variant: PropTypes.oneOf(['default', 'compact']),
  onClick: PropTypes.func,
};

const TransactionList = ({ transactions, variant = 'default', onTransactionClick, className }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
      </div>
    );
  }

  return (
    <div className={cn('divide-y divide-gray-100 dark:divide-gray-800', className)}>
      {transactions.map((transaction) => (
        <TransactionItem
          key={transaction.id}
          transaction={transaction}
          variant={variant}
          onClick={onTransactionClick}
        />
      ))}
    </div>
  );
};

TransactionList.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.object).isRequired,
  variant: PropTypes.oneOf(['default', 'compact']),
  onTransactionClick: PropTypes.func,
  className: PropTypes.string,
};

export { TransactionList, TransactionItem };
export default TransactionList;
