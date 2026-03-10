import { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/common/Button';

const PinInput = ({
  length = 4,
  value = '',
  onChange,
  disabled = false,
  error,
  className,
  inputClassName,
  mask = true,
  autoFocus = false,
}) => {
  const [pin, setPin] = useState(value.split('').fill('', 0, length));
  const [showPin, setShowPin] = useState(!mask);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (value) {
      setPin(value.split('').fill('', 0, length));
    }
  }, [value, length]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleChange = (e) => {
    const inputValue = e.target.value;

    // Only allow numbers
    const numericValue = inputValue.replace(/\D/g, '').slice(0, length);

    const newPin = numericValue.split('').fill('', 0, length);
    setPin(newPin);

    const pinValue = newPin.join('');
    onChange?.(pinValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace') {
      const newPin = [...pin];
      const lastFilledIndex = newPin.findLastIndex((d) => d !== '');
      if (lastFilledIndex >= 0) {
        newPin[lastFilledIndex] = '';
        setPin(newPin);
        onChange?.(newPin.join(''));
      }
    }
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        className={cn(
          'flex gap-3 justify-center p-4 rounded-lg border-2 cursor-pointer',
          'transition-all duration-200',
          error
            ? 'border-danger-500'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300',
          className
        )}
      >
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={pin.join('')}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="sr-only"
          autoComplete="one-time-code"
        />

        {Array.from({ length }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'w-12 h-14 flex items-center justify-center',
              'bg-gray-50 dark:bg-gray-800 rounded-lg',
              'text-2xl font-semibold',
              'transition-all duration-200',
              pin[index]
                ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500'
                : 'border-gray-300 dark:border-gray-600',
              'border-2',
              inputClassName
            )}
          >
            {pin[index] ? (
              showPin ? (
                pin[index]
              ) : (
                <span className="w-3 h-3 rounded-full bg-gray-800 dark:bg-gray-200" />
              )
            ) : null}
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-2 mt-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowPin(!showPin)}
          className="text-gray-500"
        >
          {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showPin ? 'Hide' : 'Show'}
        </Button>
      </div>

      {error && (
        <p className="mt-2 text-center text-sm text-danger-600 dark:text-danger-400">
          {error}
        </p>
      )}
    </div>
  );
};

PinInput.propTypes = {
  length: PropTypes.number,
  value: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  mask: PropTypes.bool,
  autoFocus: PropTypes.bool,
};

export { PinInput };
export default PinInput;
