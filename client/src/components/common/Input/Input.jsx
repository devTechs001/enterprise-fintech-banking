import { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Eye, EyeOff, X } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { Button } from '@/components/common/Button';

const Input = forwardRef(
  (
    {
      className,
      type = 'text',
      label,
      error,
      hint,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      clearable = false,
      value,
      onChange,
      disabled = false,
      readOnly = false,
      required = false,
      showPasswordToggle = false,
      containerClassName,
      labelClassName,
      inputClassName,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const inputType = showPasswordToggle
      ? showPassword
        ? 'text'
        : 'password'
      : type;

    const handleClear = () => {
      onChange?.({ target: { value: '' } });
    };

    const hasValue = value && value.length > 0;
    const showClearButton = clearable && hasValue && !disabled && !readOnly;
    const showPasswordToggleButton =
      showPasswordToggle && type === 'password';

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label
            className={cn(
              'block text-sm font-medium mb-1.5',
              error
                ? 'text-danger-600 dark:text-danger-400'
                : 'text-gray-700 dark:text-gray-300',
              labelClassName
            )}
          >
            {label}
            {required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}

        <div
          className={cn(
            'relative flex items-center',
            'rounded-lg border transition-all duration-200',
            'bg-white dark:bg-gray-800',
            disabled && 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900',
            readOnly && 'bg-gray-50 dark:bg-gray-900',
            error
              ? 'border-danger-500 focus-within:border-danger-500 focus-within:ring-2 focus-within:ring-danger-500/20'
              : isFocused
              ? 'border-primary-500 ring-2 ring-primary-500/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
            className
          )}
        >
          {LeftIcon && (
            <div className="pl-3 text-gray-400 dark:text-gray-500">
              <LeftIcon className="h-5 w-5" />
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            value={value}
            onChange={onChange}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            className={cn(
              'w-full px-4 py-2.5 bg-transparent',
              'text-gray-900 dark:text-white',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'focus:outline-none',
              disabled && 'cursor-not-allowed',
              LeftIcon && 'pl-2',
              (showClearButton || showPasswordToggleButton || RightIcon) && 'pr-2',
              inputClassName
            )}
            {...props}
          />

          <div className="flex items-center gap-1 pr-2">
            {showClearButton && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </Button>
            )}

            {showPasswordToggleButton && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            )}

            {!showClearButton &&
              !showPasswordToggleButton &&
              RightIcon && (
                <div className="text-gray-400 dark:text-gray-500">
                  <RightIcon className="h-5 w-5" />
                </div>
              )}
          </div>
        </div>

        {(error || hint) && (
          <p
            className={cn(
              'mt-1.5 text-sm',
              error
                ? 'text-danger-600 dark:text-danger-400'
                : 'text-gray-500 dark:text-gray-400'
            )}
          >
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

Input.propTypes = {
  type: PropTypes.oneOf([
    'text',
    'email',
    'password',
    'number',
    'tel',
    'url',
    'search',
    'date',
    'time',
    'datetime-local',
  ]),
  label: PropTypes.string,
  error: PropTypes.string,
  hint: PropTypes.string,
  leftIcon: PropTypes.elementType,
  rightIcon: PropTypes.elementType,
  clearable: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  required: PropTypes.bool,
  showPasswordToggle: PropTypes.bool,
  containerClassName: PropTypes.string,
  labelClassName: PropTypes.string,
  inputClassName: PropTypes.string,
  className: PropTypes.string,
};

export { Input };
export default Input;
