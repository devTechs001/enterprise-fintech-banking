import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { Button } from '../Button';

const Pagination = forwardRef(
  (
    {
      className,
      currentPage,
      totalPages,
      onPageChange,
      pageSize = 10,
      totalItems,
      showSizeChanger = true,
      sizeOptions = [10, 25, 50, 100],
      onPageSizeChange,
      showQuickJumper = false,
      ...props
    },
    ref
  ) => {
    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let endPage = Math.min(totalPages, startPage + maxVisible - 1);

      if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
      }

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }

      return pages;
    };

    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(currentPage * pageSize, totalItems || 0);

    return (
      <div ref={ref} className={cn('flex items-center justify-between gap-4', className)} {...props}>
        {/* Info */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {totalItems ? (
            `Showing ${startIndex} to ${endIndex} of ${totalItems} results`
          ) : (
            `Page ${currentPage} of ${totalPages}`
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {getPageNumbers().map((page, index) => (
            <Button
              key={index}
              variant={page === currentPage ? 'primary' : 'outline'}
              size="sm"
              onClick={() => typeof page === 'number' && onPageChange?.(page)}
              disabled={page === '...'}
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Size Changer */}
        {showSizeChanger && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
            className="h-8 px-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900"
          >
            {sizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        )}

        {/* Quick Jumper */}
        {showQuickJumper && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Go to</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              defaultValue={currentPage}
              onBlur={(e) => {
                const page = Math.min(Math.max(1, Number(e.target.value)), totalPages);
                onPageChange?.(page);
              }}
              className="w-16 h-8 px-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900"
            />
          </div>
        )}
      </div>
    );
  }
);

Pagination.displayName = 'Pagination';

Pagination.propTypes = {
  className: PropTypes.string,
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func,
  pageSize: PropTypes.number,
  totalItems: PropTypes.number,
  showSizeChanger: PropTypes.bool,
  sizeOptions: PropTypes.arrayOf(PropTypes.number),
  onPageSizeChange: PropTypes.func,
  showQuickJumper: PropTypes.bool,
};

export { Pagination };
export default Pagination;
