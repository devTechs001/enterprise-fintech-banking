import { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';
import { DollarSign } from 'lucide-react';

const CurrencyInput = forwardRef(
  (
    {
      value = '',
      onChange,
      label,
      placeholder = '0.00',
      currency = 'USD',
      prefix,
      disabled = false,
      error,
      className,
      allowNegative = false,
      decimalScale = 2,
      thousandSeparator = ',',
      decimalSeparator = '.',
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);

    const currencySymbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      INR: '₹',
      AUD: 'A$',
      CAD: 'C$',
      CHF: 'Fr',
      CNY: '¥',
    };

    const symbol = prefix || currencySymbols[currency] || '$';

    const formatValue = (val) => {
      if (!val && val !== 0) return '';

      const number = parseFloat(val);
      if (isNaN(number)) return '';

      const parts = number.toFixed(decimalScale).split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);

      return parts.join(decimalSeparator);
    };

    const parseValue = (formattedValue) => {
      if (!formattedValue) return '';
      const cleaned = formattedValue.replace(new RegExp(`[${thousandSeparator}]`, 'g'), '');
      return cleaned;
    };

    const handleChange = (e) => {
      let inputValue = e.target.value.replace(/[^0-9.-]/g, '');

      if (!allowNegative) {
        inputValue = inputValue.replace('-', '');
      }

      // Allow only one decimal point
      const parts = inputValue.split('.');
      if (parts.length > 2) {
        inputValue = parts[0] + '.' + parts.slice(1).join('');
      }

      // Limit decimal places
      if (parts[1]?.length > decimalScale) {
        inputValue = parts[0] + '.' + parts[1].slice(0, decimalScale);
      }

      onChange?.({
        target: {
          value: inputValue,
          formatted: formatValue(inputValue),
        },
      });
    };

    const displayValue = typeof value === 'number' ? formatValue(value.toString()) : formatValue(value);

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {label}
          </label>
        )}

        <div
          className={cn(
            'relative flex items-center rounded-lg border transition-all duration-200',
            'bg-white dark:bg-gray-800',
            disabled && 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900',
            error
              ? 'border-danger-500 focus-within:border-danger-500 focus-within:ring-2 focus-within:ring-danger-500/20'
              : focused
              ? 'border-primary-500 ring-2 ring-primary-500/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
          )}
        >
          <div className="pl-4 text-gray-500 dark:text-gray-400">
            <DollarSign className="w-5 h-5" />
          </div>

          <span className="px-2 text-gray-500 dark:text-gray-400 font-medium">
            {symbol}
          </span>

          <input
            ref={ref}
            type="text"
            inputMode="decimal"
            value={displayValue}
            onChange={handleChange}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(
              'w-full px-4 py-2.5 bg-transparent',
              'text-gray-900 dark:text-white',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'focus:outline-none',
              'font-mono'
            )}
            {...props}
          />
        </div>

        {error && (
          <p className="mt-1.5 text-sm text-danger-600 dark:text-danger-400">
            {error}
          </p>
        )}
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

CurrencyInput.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  currency: PropTypes.string,
  prefix: PropTypes.string,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
  allowNegative: PropTypes.bool,
  decimalScale: PropTypes.number,
  thousandSeparator: PropTypes.string,
  decimalSeparator: PropTypes.string,
};

export { CurrencyInput };
export default CurrencyInput;
