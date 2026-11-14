import { useState } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';
import { Filter, Calendar, Download, X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { Input } from '@/components/common/Input';
import { useToast } from '@/hooks/ui/useToast';

/**
 * Transaction filters.
 *
 * "Custom Date" and "Export" previously rendered with no `onClick` at all — two
 * buttons that looked live and did nothing. Custom Date now reveals real date
 * inputs and reports `{ from, to }` through the same `onFilterChange` callback as
 * the presets. Export writes the rows it was given to a CSV and downloads it.
 *
 * The CSV is built by hand with quoting rather than by joining on commas: a
 * transaction description containing a comma — "Uber, Nairobi" — would otherwise
 * shift every later column and corrupt the file the customer is relying on.
 */
const csvCell = (value) => {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const TransactionFilters = ({ onFilterChange, transactions = [], className }) => {
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const { toast } = useToast();

  const applyCustomRange = () => {
    if (!from && !to) return;
    onFilterChange?.({ dateRange: 'custom', from: from || undefined, to: to || undefined });
  };

  const exportCsv = () => {
    const rows = Array.isArray(transactions) ? transactions : [];
    if (rows.length === 0) {
      toast?.info?.('Nothing to export yet.');
      return;
    }
    const header = ['Date', 'Reference', 'Description', 'Merchant', 'Category', 'Type', 'Status', 'Amount', 'Currency'];
    const body = rows.map((t) => [
      t.createdAt || t.date || '',
      t.id || t.reference || '',
      t.description || '',
      t.merchantName || t.merchant || '',
      t.category || '',
      t.type || '',
      t.status || '',
      typeof t.amount === 'number' ? t.amount.toFixed(2) : (t.amount ?? ''),
      t.currency || '',
    ].map(csvCell).join(','));
    // A BOM keeps Excel from misreading UTF-8 merchant names as mojibake.
    const blob = new Blob([`\uFEFF${[header.map(csvCell).join(','), ...body].join('\r\n')}\r\n`], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Revoking immediately can cancel the download in some browsers.
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    toast?.success?.(`Exported ${rows.length} transaction${rows.length === 1 ? '' : 's'}.`);
  };
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
        <Button
          variant="outline"
          size="sm"
          leftIcon={showCustomRange ? X : Calendar}
          onClick={() => setShowCustomRange((v) => !v)}
          aria-expanded={showCustomRange}
        >
          {showCustomRange ? 'Close dates' : 'Custom Date'}
        </Button>
        <Button variant="ghost" size="sm" leftIcon={Download} onClick={exportCsv}>
          Export CSV
        </Button>
      </div>

      {showCustomRange && (
        <div className="flex w-full flex-wrap items-end gap-3 border-t border-gray-200 pt-3 dark:border-gray-700">
          <div className="w-40">
            <Input
              label="From"
              type="date"
              value={from}
              max={to || undefined}
              onChange={(event) => setFrom(event.target.value)}
            />
          </div>
          <div className="w-40">
            <Input
              label="To"
              type="date"
              value={to}
              min={from || undefined}
              onChange={(event) => setTo(event.target.value)}
            />
          </div>
          <Button size="sm" onClick={applyCustomRange} disabled={!from && !to}>Apply</Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => { setFrom(''); setTo(''); onFilterChange?.({ dateRange: '', from: undefined, to: undefined }); }}
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
};

TransactionFilters.propTypes = {
  onFilterChange: PropTypes.func,
  transactions: PropTypes.arrayOf(PropTypes.object),
  className: PropTypes.string,
};

export { TransactionFilters };
export default TransactionFilters;
