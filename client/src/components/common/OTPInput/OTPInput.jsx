import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';

/**
 * One-time-code input for TOTP / SMS step-up authentication.
 *
 * Digits are held in component state only — never written to storage — and the
 * inputs use `autocomplete="one-time-code"` so password managers do not offer to
 * fill a banking credential here.
 */
const OTPInput = ({ length = 6, value = '', onChange, disabled = false, error = false, autoFocus = true, className }) => {
  const refs = useRef([]);
  const digits = value.padEnd(length, ' ').slice(0, length).split('');

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const commit = (next) => onChange?.(next.replace(/\s/g, '').slice(0, length));

  const handleChange = (index, raw) => {
    const cleaned = raw.replace(/\D/g, '');
    if (!cleaned) {
      const arr = value.padEnd(length, ' ').split('');
      arr[index] = ' ';
      commit(arr.join(''));
      return;
    }
    const arr = value.padEnd(length, ' ').split('');
    cleaned.split('').forEach((ch, offset) => {
      if (index + offset < length) arr[index + offset] = ch;
    });
    commit(arr.join(''));
    const nextIndex = Math.min(length - 1, index + cleaned.length);
    refs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !digits[index].trim() && index > 0) {
      event.preventDefault();
      refs.current[index - 1]?.focus();
      handleChange(index - 1, '');
    }
    if (event.key === 'ArrowLeft' && index > 0) refs.current[index - 1]?.focus();
    if (event.key === 'ArrowRight' && index < length - 1) refs.current[index + 1]?.focus();
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const text = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (text) {
      commit(text);
      refs.current[Math.min(length - 1, text.length)]?.focus();
    }
  };

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {Array.from({ length }).map((_, index) => (
        <input
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          ref={(el) => { refs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={length}
          autoComplete="one-time-code"
          aria-label={`Digit ${index + 1} of ${length}`}
          disabled={disabled}
          value={digits[index].trim()}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={cn(
            'h-14 w-11 rounded-xl border-2 bg-white text-center text-2xl font-semibold tabular-nums',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1',
            'dark:bg-gray-900 dark:text-white',
            error
              ? 'border-danger-500 focus:border-danger-600 focus:ring-danger-500'
              : 'border-gray-200 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        />
      ))}
    </div>
  );
};

OTPInput.propTypes = {
  length: PropTypes.number,
  value: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  error: PropTypes.bool,
  autoFocus: PropTypes.bool,
  className: PropTypes.string,
};

export { OTPInput };
export default OTPInput;
