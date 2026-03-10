import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';

const Radio = forwardRef(
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
          role="radio"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => !disabled && onChange?.(true)}
          className={cn(
            'peer relative h-5 w-5 flex-shrink-0 rounded-full border transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            checked
              ? 'border-primary-600'
              : 'bg-white border-gray-300 hover:border-gray-400 dark:bg-gray-900 dark:border-gray-600',
            disabled && 'cursor-not-allowed opacity-50',
            error && 'border-danger-500',
            className
          )}
          {...props}
        >
          {checked && (
            <span className="absolute inset-1 rounded-full bg-primary-600" />
          )}
        </button>
        {label && (
          <label
            className={cn(
              'text-sm text-gray-700 dark:text-gray-300',
              disabled && 'cursor-not-allowed opacity-50'
            )}
            onClick={() => !disabled && onChange?.(true)}
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

Radio.displayName = 'Radio';

Radio.propTypes = {
  className: PropTypes.string,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  error: PropTypes.string,
};

const RadioGroup = forwardRef(
  ({ className, options = [], value, onChange, label, error, orientation = 'vertical' }, ref) => {
    return (
      <div className={cn(orientation === 'horizontal' ? 'flex gap-4' : 'space-y-2', className)} ref={ref}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        {options.map((option) => (
          <Radio
            key={option.value}
            checked={value === option.value}
            onChange={() => onChange?.(option.value)}
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

RadioGroup.displayName = 'RadioGroup';

RadioGroup.propTypes = {
  className: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    label: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
  })),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  label: PropTypes.string,
  error: PropTypes.string,
  orientation: PropTypes.oneOf(['vertical', 'horizontal']),
};

export { Radio, RadioGroup };
export default Radio;
