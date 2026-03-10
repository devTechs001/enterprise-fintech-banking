import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';

const Switch = forwardRef(
  (
    {
      checked = false,
      onChange,
      label,
      disabled = false,
      size = 'md',
      className,
      id,
      ...props
    },
    ref
  ) => {
    const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;

    const sizeClasses = {
      sm: 'w-9 h-5',
      md: 'w-11 h-6',
      lg: 'w-14 h-8',
    };

    const thumbSizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-7 h-7',
    };

    const translateClasses = {
      sm: 'translate-x-4',
      md: 'translate-x-5',
      lg: 'translate-x-6',
    };

    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            id={switchId}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <label
            htmlFor={switchId}
            className={cn(
              'block rounded-full transition-colors duration-200 cursor-pointer',
              sizeClasses[size],
              checked
                ? 'bg-primary-600'
                : 'bg-gray-300 dark:bg-gray-600',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <span
              className={cn(
                'block rounded-full bg-white shadow-sm transition-transform duration-200',
                thumbSizeClasses[size],
                checked ? translateClasses[size] : 'translate-x-0.5'
              )}
            />
          </label>
        </div>

        {label && (
          <label
            htmlFor={switchId}
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

Switch.displayName = 'Switch';

Switch.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  label: PropTypes.node,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  id: PropTypes.string,
};

export { Switch };
export default Switch;
