import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Check } from 'lucide-react';
import { cn } from '@/utils/helpers';

const Checkbox = forwardRef(
  (
    {
      className,
      checked,
      onChange,
      label,
      disabled = false,
      error,
      ...props
    },
    ref
  ) => {
    return (
      <div className="flex items-start gap-3">
        <button
          ref={ref}
          type="button"
          role="checkbox"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => !disabled && onChange?.(!checked)}
          className={cn(
            'peer h-5 w-5 flex-shrink-0 rounded border transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            checked
              ? 'bg-primary-600 border-primary-600 text-white'
              : 'bg-white border-gray-300 hover:border-gray-400 dark:bg-gray-900 dark:border-gray-600',
            disabled && 'cursor-not-allowed opacity-50',
            error && 'border-danger-500',
            className
          )}
          {...props}
        >
          {checked && <Check className="h-4 w-4 mx-auto" />}
        </button>
        {label && (
          <label
            className={cn(
              'text-sm text-gray-700 dark:text-gray-300',
              disabled && 'cursor-not-allowed opacity-50'
            )}
            onClick={() => !disabled && onChange?.(!checked)}
          >
            {label}
          </label>
        )}
        {error && (
          <p className="text-xs text-danger-500">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

Checkbox.propTypes = {
  className: PropTypes.string,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  error: PropTypes.string,
};

const CheckboxGroup = forwardRef(
  ({ className, options = [], value = [], onChange, label, error }, ref) => {
    const handleChange = (optionValue, checked) => {
      if (checked) {
        onChange?.([...value, optionValue]);
      } else {
        onChange?.(value.filter((v) => v !== optionValue));
      }
    };

    return (
      <div className={cn('space-y-2', className)} ref={ref}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        {options.map((option) => (
          <Checkbox
            key={option.value}
            checked={value.includes(option.value)}
            onChange={(checked) => handleChange(option.value, checked)}
            label={option.label}
            disabled={option.disabled}
          />
        ))}
        {error && (
          <p className="text-xs text-danger-500">{error}</p>
        )}
      </div>
    );
  }
);

CheckboxGroup.displayName = 'CheckboxGroup';

CheckboxGroup.propTypes = {
  className: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    label: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
  })),
  value: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  onChange: PropTypes.func,
  label: PropTypes.string,
  error: PropTypes.string,
};

export { Checkbox, CheckboxGroup };
export default Checkbox;
