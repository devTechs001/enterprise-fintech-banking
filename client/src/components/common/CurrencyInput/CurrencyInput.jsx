import { forwardRef, useId, useState } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';

/**
 * Currency amount input.
 *
 * Keeps the raw string in state and emits a NUMBER, so callers never have to
 * parse user input themselves. Rejects negative values and anything that is not
 * a plain decimal amount — the API re-validates independently.
 */
const CurrencyInput = forwardRef(
  ({ label, currency = 'USD', value, onChange, error, hint, disabled, max, id, className, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const [text, setText] = useState(value == null ? '' : String(value));

    const handleChange = (event) => {
      const raw = event.target.value;
      // Allow only digits with at most two decimal places.
      if (raw !== '' && !/^\d{0,13}(\.\d{0,2})?$/.test(raw)) return;
      setText(raw);
      const numeric = raw === '' || raw === '.' ? null : Number(raw);
      onChange?.(numeric, raw);
    };

    const overMax = typeof max === 'number' && text !== '' && Number(text) > max;

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-medium text-gray-500 dark:text-gray-400">
            {currency}
          </span>
          <input
            {...props}
            ref={ref}
            id={inputId}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            disabled={disabled}
            value={text}
            onChange={handleChange}
            aria-invalid={Boolean(error || overMax)}
            aria-describedby={error || overMax || hint ? `${inputId}-hint` : undefined}
            className={cn(
              'h-11 w-full rounded-lg border-2 bg-white pl-14 pr-3 text-base font-semibold tabular-nums',
              'transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1',
              'dark:bg-gray-900 dark:text-white',
              error || overMax
                ? 'border-danger-500 focus:ring-danger-500'
                : 'border-gray-200 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          />
        </div>
        {(error || overMax || hint) && (
          <p
            id={`${inputId}-hint`}
            className={cn(
              'mt-1.5 text-xs',
              error || overMax ? 'text-danger-600 dark:text-danger-500' : 'text-gray-500 dark:text-gray-400'
            )}
          >
            {error || (overMax ? `Amount exceeds the available maximum of ${max.toLocaleString()}.` : hint)}
          </p>
        )}
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

CurrencyInput.propTypes = {
  label: PropTypes.string,
  currency: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  error: PropTypes.string,
  hint: PropTypes.string,
  disabled: PropTypes.bool,
  max: PropTypes.number,
  id: PropTypes.string,
  className: PropTypes.string,
};

export { CurrencyInput };
export default CurrencyInput;
