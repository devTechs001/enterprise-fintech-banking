import { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';

const OTPInput = ({
  length = 6,
  value = '',
  onChange,
  disabled = false,
  error,
  className,
  inputClassName,
  type = 'text',
  autoFocus = false,
}) => {
  const [otp, setOtp] = useState(value.split('').fill('', 0, length));
  const inputRefs = useRef([]);

  useEffect(() => {
    if (value) {
      setOtp(value.split('').fill('', 0, length));
    }
  }, [value, length]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index, e) => {
    const inputValue = e.target.value;

    // Only allow single character
    if (inputValue.length > 1) return;

    // Only allow numbers if type is numeric
    if (type === 'numeric' && inputValue && !/^\d$/.test(inputValue)) return;

    const newOtp = [...otp];
    newOtp[index] = inputValue;
    setOtp(newOtp);

    const otpValue = newOtp.join('');
    onChange?.(otpValue);

    // Auto-focus next input
    if (inputValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);

    if (type === 'numeric' && !/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').fill('', 0, length);
    setOtp(newOtp);
    onChange?.(newOtp.join(''));

    // Focus on the last filled input or the next empty one
    const focusIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="flex gap-2 justify-center">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type={type === 'numeric' ? 'tel' : 'text'}
            value={digit}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            className={cn(
              'w-12 h-14 text-center text-xl font-semibold',
              'bg-white dark:bg-gray-800',
              'border-2 rounded-lg',
              'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
              'transition-all duration-200',
              error
                ? 'border-danger-500 focus:border-danger-500'
                : 'border-gray-300 dark:border-gray-600',
              disabled && 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900',
              inputClassName
            )}
            inputMode={type === 'numeric' ? 'numeric' : 'text'}
            autoComplete="one-time-code"
          />
        ))}
      </div>

      {error && (
        <p className="mt-2 text-center text-sm text-danger-600 dark:text-danger-400">
          {error}
        </p>
      )}
    </div>
  );
};

OTPInput.propTypes = {
  length: PropTypes.number,
  value: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  type: PropTypes.oneOf(['text', 'numeric']),
  autoFocus: PropTypes.bool,
};

export { OTPInput };
export default OTPInput;
