import { useState } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';
import { Search } from 'lucide-react';
import { SearchInput } from '@/components/common/SearchInput';

const HeaderSearch = ({ className }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={cn('relative', className)}>
      {isExpanded ? (
        <SearchInput
          placeholder="Search..."
          onSearch={() => setIsExpanded(false)}
          onClear={() => setIsExpanded(false)}
          autoFocus
        />
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

HeaderSearch.propTypes = {
  className: PropTypes.string,
};

export { HeaderSearch };
export default HeaderSearch;
