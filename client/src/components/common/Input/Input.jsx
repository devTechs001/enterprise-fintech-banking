import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cva } from 'class-variance-authority';
import { cn } from '@/utils/helpers';

const inputVariants = cva(
  'flex w-full rounded-lg border bg-white px-3 py-2 text-sm ring-offset-white ' +
  'file:border-0 file:bg-transparent file:text-sm file:font-medium ' +
  'placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 ' +
  'focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed ' +
  'disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:ring-offset-gray-950 ' +
  'dark:placeholder:text-gray-500 dark:focus-visible:ring-primary-400',
  {
    variants: {
      variant: {
        default: 'border-gray-300',
        error: 'border-danger-500 focus-visible:ring-danger-500',
        success: 'border-success-500 focus-visible:ring-success-500',
      },
      size: {
        sm: 'h-8 text-xs',
        md: 'h-10 text-sm',
        lg: 'h-12 text-base',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const Input = forwardRef(
  (
    {
      className,
      type,
      variant,
      size,
      fullWidth,
      label,
      error,
      helperText,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('space-y-1', fullWidth && 'w-full', className)}>
        {label && (
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <div className="relative">
          {LeftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <LeftIcon className="h-4 w-4" />
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              inputVariants({ variant, size, fullWidth }),
              LeftIcon && 'pl-10',
              RightIcon && 'pr-10'
            )}
            {...props}
          />
          {RightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <RightIcon className="h-4 w-4" />
            </div>
          )}
        </div>
        {helperText && (
          <p className={cn(
            'text-xs',
            error ? 'text-danger-500' : 'text-gray-500 dark:text-gray-400'
          )}>
            {helperText}
          </p>
        )}
        {error && (
          <p className="text-xs text-danger-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

Input.propTypes = {
  className: PropTypes.string,
  type: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'error', 'success']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  fullWidth: PropTypes.bool,
  label: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  leftIcon: PropTypes.elementType,
  rightIcon: PropTypes.elementType,
};

export { Input, inputVariants };
export default Input;
