import PropTypes from 'prop-types';
import { CurrencyInput } from '@/components/common/CurrencyInput';
import { formatCurrency } from '@/utils/formatters';

/** Amount entry with a live available-balance readout and quick-pick chips. */
const AmountInput = ({ value, onChange, available = 0, currency = 'USD', dailyLimit, error, disabled }) => {
  const quickPicks = [25, 100, 500, 1000].filter((amount) => amount <= available);
  const effectiveMax = Math.min(available, dailyLimit ?? Infinity);

  return (
    <div className="space-y-3">
      <CurrencyInput
        label="Amount"
        currency={currency}
        value={value ?? ''}
        onChange={onChange}
        error={error}
        disabled={disabled}
        max={Number.isFinite(effectiveMax) ? effectiveMax : undefined}
        hint={`Available ${formatCurrency(available, currency)}${Number.isFinite(dailyLimit) ? ` · daily limit ${formatCurrency(dailyLimit, currency)}` : ''}`}
      />
      {quickPicks.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {quickPicks.map((amount) => (
            <button
              key={amount}
              type="button"
              disabled={disabled}
              onClick={() => onChange?.(amount)}
              className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 transition hover:border-primary-500 hover:text-primary-600 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
            >
              {formatCurrency(amount, currency, { maximumFractionDigits: 0 })}
            </button>
          ))}
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange?.(Math.floor(available * 100) / 100)}
            className="rounded-full border border-primary-200 px-3 py-1 text-xs font-medium text-primary-600 transition hover:bg-primary-50 disabled:opacity-50 dark:border-primary-900"
          >
            Max
          </button>
        </div>
      )}
    </div>
  );
};

AmountInput.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  available: PropTypes.number,
  currency: PropTypes.string,
  dailyLimit: PropTypes.number,
  error: PropTypes.string,
  disabled: PropTypes.bool,
};

export { AmountInput };
export default AmountInput;
