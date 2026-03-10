import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';

const TransactionItem = ({ transaction, onClick }) => {
  // This is a placeholder - the actual component is in TransactionList.jsx
  return (
    <div
      onClick={() => onClick?.(transaction)}
      className={cn(
        'flex items-center justify-between p-4',
        'hover:bg-gray-50 dark:hover:bg-gray-800/50',
        'transition-colors duration-200 cursor-pointer',
        'border-b border-gray-100 dark:border-gray-800'
      )}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {transaction.description || 'Transaction'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(transaction.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <p className="font-semibold text-gray-900 dark:text-white">
        ${transaction.amount?.toFixed(2) || '0.00'}
      </p>
    </div>
  );
};

TransactionItem.propTypes = {
  transaction: PropTypes.object.isRequired,
  onClick: PropTypes.func,
};

export { TransactionItem };
export default TransactionItem;
