import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';

const Radio = forwardRef(
  (
    {
      checked = false,
      onChange,
      label,
      disabled = false,
      error,
      className,
      id,
      value,
      name,
      ...props
    },
    ref
  ) => {
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={cn('flex items-start gap-3', className)}>
        <div className="relative flex items-center">
          <input
            ref={ref}
            type="radio"
            id={radioId}
            name={name}
            value={value}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className={cn('peer sr-only', disabled && 'cursor-not-allowed')}
            {...props}
          />
          <label
            htmlFor={radioId}
            className={cn(
              'w-5 h-5 border-2 rounded-full transition-all duration-200',
              'flex items-center justify-center',
              'cursor-pointer',
              checked
                ? 'border-primary-600'
                : 'border-gray-300 dark:border-gray-600',
              disabled && 'opacity-50 cursor-not-allowed',
              error && 'border-danger-500'
            )}
          >
            {checked && (
              <span className="w-2.5 h-2.5 rounded-full bg-primary-600" />
            )}
          </label>
        </div>

        {label && (
          <label
            htmlFor={radioId}
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

Radio.displayName = 'Radio';

Radio.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  label: PropTypes.node,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
  id: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  name: PropTypes.string,
};

const RadioGroup = ({ options, value, onChange, label, error, className, name }) => {
  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      {options.map((option) => (
        <Radio
          key={option.value}
          name={name}
          value={option.value}
          checked={value === option.value}
          onChange={() => onChange?.(option.value)}
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

RadioGroup.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.node.isRequired,
      disabled: PropTypes.bool,
    })
  ).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  label: PropTypes.string,
  error: PropTypes.string,
  className: PropTypes.string,
  name: PropTypes.string,
};

export { Radio, RadioGroup };
export default Radio;
