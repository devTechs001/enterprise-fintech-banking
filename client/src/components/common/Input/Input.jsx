import { forwardRef, useId } from 'react';
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
      type = 'text',
      variant,
      size,
      fullWidth,
      label,
      error,
      helperText,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      id,
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;
    // An `error` string should also drive the visual state; previously callers
    // had to remember to pass variant="error" separately, and most did not.
    const resolvedVariant = error ? 'error' : variant;
    const describedBy = [error ? errorId : null, helperText ? helperId : null]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <div className={cn('space-y-1', fullWidth && 'w-full', className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
            {required && <span className="ml-0.5 text-danger-500" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative">
          {LeftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <LeftIcon className="h-4 w-4" aria-hidden="true" />
            </div>
          )}
          <input
            {...props}
            id={inputId}
            type={type}
            ref={ref}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              inputVariants({ variant: resolvedVariant, size, fullWidth }),
              LeftIcon && 'pl-10',
              RightIcon && 'pr-10'
            )}
          />
          {RightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <RightIcon className="h-4 w-4" aria-hidden="true" />
            </div>
          )}
        </div>
        {helperText && (
          <p id={helperId} className={cn('text-xs', error ? 'text-danger-500' : 'text-gray-500 dark:text-gray-400')}>
            {helperText}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-xs text-danger-500">{error}</p>
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
  id: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  leftIcon: PropTypes.elementType,
  rightIcon: PropTypes.elementType,
};

export { Input, inputVariants };
export default Input;
