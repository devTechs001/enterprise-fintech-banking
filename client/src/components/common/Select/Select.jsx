import { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { Button } from '../Button';

const Select = forwardRef(
  (
    {
      className,
      options = [],
      value,
      onChange,
      placeholder = 'Select an option',
      disabled = false,
      searchable = false,
      clearable = false,
      label,
      error,
      size = 'md',
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const selectedOption = options.find((opt) => opt.value === value);

    const filteredOptions = options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (optionValue) => {
      onChange?.(optionValue);
      setIsOpen(false);
      setSearchTerm('');
    };

    const sizeClasses = {
      sm: 'h-8 text-xs',
      md: 'h-10 text-sm',
      lg: 'h-12 text-base',
    };

    return (
      <div className={cn('relative w-full', className)} ref={ref} {...props}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'relative w-full flex items-center justify-between rounded-lg border bg-white px-3 py-2 text-left',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'border-gray-300 dark:border-gray-700 dark:bg-gray-900',
            error && 'border-danger-500 focus:ring-danger-500',
            sizeClasses[size]
          )}
        >
          <span className={cn(!selectedOption && 'text-gray-400')}>
            {selectedOption?.label || placeholder}
          </span>
          <div className="flex items-center gap-2">
            {clearable && selectedOption && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange?.(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform', isOpen && 'rotate-180')} />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white rounded-lg border border-gray-200 shadow-lg dark:bg-gray-900 dark:border-gray-700">
            {searchable && (
              <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800"
                    autoFocus
                  />
                </div>
              </div>
            )}
            
            <div className="max-h-60 overflow-y-auto py-1">
              {filteredOptions.length === 0 ? (
                <p className="px-3 py-2 text-sm text-gray-500">No options found</p>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 text-sm',
                      'hover:bg-gray-100 dark:hover:bg-gray-800',
                      value === option.value && 'bg-primary-50 dark:bg-primary-900/20'
                    )}
                  >
                    <span className={cn(option.disabled && 'text-gray-400')}>
                      {option.label}
                    </span>
                    {value === option.value && (
                      <Check className="h-4 w-4 text-primary-600" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {error && (
          <p className="mt-1 text-xs text-danger-500">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

Select.propTypes = {
  className: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    label: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
  })),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  searchable: PropTypes.bool,
  clearable: PropTypes.bool,
  label: PropTypes.string,
  error: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

export { Select };
export default Select;
