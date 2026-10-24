import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Search, X } from 'lucide-react';
import { cn } from '@/utils/helpers';

/**
 * Search input with clearable value and submit handling
 */
const SearchInput = forwardRef(
  (
    {
      className,
      value,
      defaultValue = '',
      placeholder = 'Search...',
      onChange,
      onSearch,
      onClear,
      autoFocus = false,
      ...props
    },
    ref
  ) => {
    const handleChange = (e) => {
      onChange?.(e);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        onSearch?.(e.target.value);
      }
    };

    const handleClear = () => {
      if (onChange) {
        onChange({ target: { value: '' } });
      }
      onClear?.();
    };

    return (
      <div className={cn('relative w-full', className)}>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

        <input
          ref={ref}
          type="search"
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          {...props}
        />

        {(value || defaultValue) && (
          <button
            type="button"
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

SearchInput.propTypes = {
  className: PropTypes.string,
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  onSearch: PropTypes.func,
  onClear: PropTypes.func,
  autoFocus: PropTypes.bool,
};

export { SearchInput };
export default SearchInput;
