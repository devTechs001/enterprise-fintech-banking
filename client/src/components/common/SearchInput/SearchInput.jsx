import { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/common/Button';

const SearchInput = forwardRef(
  (
    {
      value = '',
      onChange,
      placeholder = 'Search...',
      onSearch,
      onClear,
      debounce = 300,
      className,
      containerClassName,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(value);

    const handleChange = (e) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      onChange?.(e);
    };

    const handleClear = () => {
      setInternalValue('');
      onClear?.();
      const event = { target: { value: '' } };
      onChange?.(event);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        onSearch?.(internalValue);
      }
      props.onKeyDown?.(e);
    };

    return (
      <div className={cn('relative w-full', containerClassName)}>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Search className="w-5 h-5" />
        </div>

        <input
          ref={ref}
          type="text"
          value={value !== undefined ? value : internalValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'w-full pl-10 pr-10 py-2.5',
            'bg-white dark:bg-gray-800',
            'border border-gray-300 dark:border-gray-600 rounded-lg',
            'text-gray-900 dark:text-white',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
            'transition-all duration-200',
            className
          )}
          {...props}
        />

        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

SearchInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  onSearch: PropTypes.func,
  onClear: PropTypes.func,
  debounce: PropTypes.number,
  className: PropTypes.string,
  containerClassName: PropTypes.string,
};

export { SearchInput };
export default SearchInput;
