import { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';
import { Phone } from 'lucide-react';

const countryCodes = [
  { code: '+1', label: 'US', flag: '🇺🇸' },
  { code: '+1', label: 'CA', flag: '🇨🇦' },
  { code: '+44', label: 'UK', flag: '🇬🇧' },
  { code: '+49', label: 'DE', flag: '🇩🇪' },
  { code: '+33', label: 'FR', flag: '🇫🇷' },
  { code: '+39', label: 'IT', flag: '🇮🇹' },
  { code: '+34', label: 'ES', flag: '🇪🇸' },
  { code: '+61', label: 'AU', flag: '🇦🇺' },
  { code: '+81', label: 'JP', flag: '🇯🇵' },
  { code: '+86', label: 'CN', flag: '🇨🇳' },
  { code: '+91', label: 'IN', flag: '🇮🇳' },
  { code: '+55', label: 'BR', flag: '🇧🇷' },
  { code: '+52', label: 'MX', flag: '🇲🇽' },
  { code: '+7', label: 'RU', flag: '🇷🇺' },
  { code: '+82', label: 'KR', flag: '🇰🇷' },
];

const PhoneInput = forwardRef(
  (
    {
      value = '',
      onChange,
      label,
      placeholder = '(555) 123-4567',
      defaultCountry = 'US',
      disabled = false,
      error,
      className,
      showCountrySelect = true,
      ...props
    },
    ref
  ) => {
    const [country, setCountry] = useState(defaultCountry);
    const [focused, setFocused] = useState(false);

    const selectedCountry = countryCodes.find((c) => c.label === country) || countryCodes[0];

    const formatPhone = (phone) => {
      const cleaned = phone.replace(/\D/g, '').slice(0, 10);

      if (cleaned.length <= 3) return cleaned;
      if (cleaned.length <= 6) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
      }
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    };

    const handleChange = (e) => {
      const inputValue = e.target.value.replace(/\D/g, '').slice(0, 10);
      const formatted = formatPhone(inputValue);

      onChange?.({
        target: {
          value: formatted,
          raw: inputValue,
          countryCode: selectedCountry.code,
          fullNumber: `${selectedCountry.code}${inputValue}`,
        },
      });
    };

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {label}
          </label>
        )}

        <div
          className={cn(
            'relative flex items-center rounded-lg border transition-all duration-200',
            'bg-white dark:bg-gray-800',
            disabled && 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900',
            error
              ? 'border-danger-500 focus-within:border-danger-500 focus-within:ring-2 focus-within:ring-danger-500/20'
              : focused
              ? 'border-primary-500 ring-2 ring-primary-500/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
          )}
        >
          {showCountrySelect && (
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              disabled={disabled}
              className={cn(
                'flex items-center gap-1 px-3 py-2.5',
                'bg-gray-50 dark:bg-gray-900',
                'border-r border-gray-200 dark:border-gray-700',
                'text-sm font-medium',
                'focus:outline-none cursor-pointer',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {countryCodes.map((c) => (
                <option key={c.label} value={c.label}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
          )}

          <div className="pl-3 text-gray-400 dark:text-gray-500">
            <Phone className="w-5 h-5" />
          </div>

          <input
            ref={ref}
            type="tel"
            inputMode="tel"
            value={value}
            onChange={handleChange}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(
              'w-full px-4 py-2.5 bg-transparent',
              'text-gray-900 dark:text-white',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'focus:outline-none'
            )}
            {...props}
          />
        </div>

        {error && (
          <p className="mt-1.5 text-sm text-danger-600 dark:text-danger-400">
            {error}
          </p>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

PhoneInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  defaultCountry: PropTypes.string,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
  showCountrySelect: PropTypes.bool,
};

export { PhoneInput, countryCodes };
export default PhoneInput;
