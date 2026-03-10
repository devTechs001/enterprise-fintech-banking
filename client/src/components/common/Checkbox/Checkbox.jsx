import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';
import { Check } from 'lucide-react';

const Checkbox = forwardRef(
  (
    {
      checked = false,
      onChange,
      label,
      disabled = false,
      error,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={cn('flex items-start gap-3', className)}>
        <div className="relative flex items-center">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className={cn(
              'peer sr-only',
              disabled && 'cursor-not-allowed'
            )}
            {...props}
          />
          <label
            htmlFor={checkboxId}
            className={cn(
              'w-5 h-5 border-2 rounded transition-all duration-200',
              'flex items-center justify-center',
              'cursor-pointer',
              checked
                ? 'bg-primary-600 border-primary-600'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600',
              disabled && 'opacity-50 cursor-not-allowed',
              error && 'border-danger-500'
            )}
          >
            {checked && <Check className="w-3.5 h-3.5 text-white" />}
          </label>
        </div>

        {label && (
          <label
            htmlFor={checkboxId}
            className={cn(
              'text-sm font-medium cursor-pointer',
              checked
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

Checkbox.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  label: PropTypes.node,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
  id: PropTypes.string,
};

const CheckboxGroup = ({ options, value = [], onChange, label, error, className }) => {
  const handleChange = (optionValue) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange?.(newValue);
  };

  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      {options.map((option) => (
        <Checkbox
          key={option.value}
          checked={value.includes(option.value)}
          onChange={() => handleChange(option.value)}
          label={option.label}
          disabled={option.disabled}
        />
      ))}

      {error && (
        <p className="text-sm text-danger-600 dark:text-danger-400">{error}</p>
      )}
    </div>
  );
};

CheckboxGroup.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.node.isRequired,
      disabled: PropTypes.bool,
    })
  ).isRequired,
  value: PropTypes.array,
  onChange: PropTypes.func,
  label: PropTypes.string,
  error: PropTypes.string,
  className: PropTypes.string,
};

export { Checkbox, CheckboxGroup };
export default Checkbox;
