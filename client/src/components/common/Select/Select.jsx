import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';
import { ChevronDown, Check, X } from 'lucide-react';
import { useClickOutside } from '@/hooks/ui/useClickOutside';

const Select = ({
  options = [],
  value,
  onChange,
  label,
  placeholder = 'Select an option',
  disabled = false,
  error,
  clearable = false,
  searchable = false,
  className,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);

  useClickOutside(containerRef, () => setIsOpen(false));

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = searchable
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  const handleSelect = (optionValue) => {
    onChange?.(optionValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.('');
  };

  return (
    <div className={cn('w-full', className)} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'w-full flex items-center justify-between px-4 py-2.5',
            'bg-white dark:bg-gray-800',
            'border rounded-lg text-left',
            'transition-colors duration-200',
            disabled && 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900',
            error
              ? 'border-danger-500 focus:border-danger-500'
              : isOpen
              ? 'border-primary-500 ring-2 ring-primary-500/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
          )}
          {...props}
        >
          <span
            className={cn(
              !selectedOption && 'text-gray-500 dark:text-gray-400'
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <div className="flex items-center gap-2">
            {clearable && selectedOption && (
              <X
                className="w-4 h-4 text-gray-400 hover:text-gray-600"
                onClick={handleClear}
              />
            )}
            <ChevronDown
              className={cn(
                'w-4 h-4 text-gray-400 transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchable && (
              <div className="px-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-md dark:bg-gray-900 dark:border-gray-600"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            {filteredOptions.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-2 text-sm',
                    'hover:bg-gray-100 dark:hover:bg-gray-700',
                    'transition-colors',
                    option.value === value && 'bg-primary-50 dark:bg-primary-900/20'
                  )}
                >
                  <span className={cn(
                    option.disabled && 'opacity-50'
                  )}>
                    {option.label}
                  </span>
                  {option.value === value && (
                    <Check className="w-4 h-4 text-primary-600" />
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-sm text-danger-600 dark:text-danger-400">
          {error}
        </p>
      )}
    </div>
  );
};

Select.propTypes = {
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
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  clearable: PropTypes.bool,
  searchable: PropTypes.bool,
  className: PropTypes.string,
};

export { Select };
export default Select;
