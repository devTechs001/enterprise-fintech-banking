import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';
import { Filter, Calendar, Download } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';

const TransactionFilters = ({ onFilterChange, className }) => {
  const transactionTypes = [
    { value: '', label: 'All Types' },
    { value: 'transfer', label: 'Transfer' },
    { value: 'payment', label: 'Payment' },
    { value: 'deposit', label: 'Deposit' },
    { value: 'withdrawal', label: 'Withdrawal' },
  ];

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'food', label: 'Food & Dining' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'utilities', label: 'Utilities' },
  ];

  const dateRanges = [
    { value: '', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
  ];

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-4 p-4',
        'bg-gray-50 dark:bg-gray-800/50 rounded-lg',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Filters
        </span>
      </div>

      <Select
        options={transactionTypes}
        placeholder="Type"
        onChange={(value) => onFilterChange?.({ type: value })}
        className="w-40"
      />

      <Select
        options={categories}
        placeholder="Category"
        onChange={(value) => onFilterChange?.({ category: value })}
        className="w-40"
      />

      <Select
        options={dateRanges}
        placeholder="Date Range"
        onChange={(value) => onFilterChange?.({ dateRange: value })}
        className="w-40"
      />

      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" size="sm" leftIcon={Calendar}>
          Custom Date
        </Button>
        <Button variant="ghost" size="sm" leftIcon={Download}>
          Export
        </Button>
      </div>
    </div>
  );
};

TransactionFilters.propTypes = {
  onFilterChange: PropTypes.func,
  className: PropTypes.string,
};

export { TransactionFilters };
export default TransactionFilters;
