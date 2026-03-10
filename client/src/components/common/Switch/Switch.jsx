import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';

const Switch = forwardRef(
  (
    {
      className,
      checked,
      onChange,
      disabled = false,
      label,
      size = 'md',
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'h-4 w-7',
      md: 'h-5 w-9',
      lg: 'h-6 w-11',
    };

    const thumbSizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    };

    const translateClasses = {
      sm: 'translate-x-3',
      md: 'translate-x-4',
      lg: 'translate-x-5',
    };

    return (
      <label className={cn('flex items-center gap-3 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed')}>
        <button
          ref={ref}
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => !disabled && onChange?.(!checked)}
          className={cn(
            'relative inline-flex flex-shrink-0 rounded-full transition-colors duration-200 ease-in-out',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            checked ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600',
            sizeClasses[size],
            className
          )}
          {...props}
        >
          <span
            className={cn(
              'pointer-events-none inline-block rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out transform',
              thumbSizeClasses[size],
              checked ? translateClasses[size] : 'translate-x-0.5'
            )}
          />
        </button>
        {label && (
          <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
        )}
      </label>
    );
  }
);

Switch.displayName = 'Switch';

Switch.propTypes = {
  className: PropTypes.string,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  label: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

export { Switch };
export default Switch;
