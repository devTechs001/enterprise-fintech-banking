import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';

const Table = ({ children, className, ...props }) => {
  return (
    <div className="overflow-x-auto">
      <table
        className={cn('w-full text-sm text-left', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

Table.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

const TableHeader = ({ children, className, ...props }) => {
  return (
    <thead className={cn('bg-gray-50 dark:bg-gray-900', className)} {...props}>
      {children}
    </thead>
  );
};

TableHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

const TableBody = ({ children, className, ...props }) => {
  return (
    <tbody className={cn('divide-y divide-gray-200 dark:divide-gray-700', className)} {...props}>
      {children}
    </tbody>
  );
};

TableBody.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

const TableFooter = ({ children, className, ...props }) => {
  return (
    <tfoot
      className={cn('bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700', className)}
      {...props}
    >
      {children}
    </tfoot>
  );
};

TableFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

const TableRow = ({ children, className, hoverable = true, onClick, ...props }) => {
  return (
    <tr
      className={cn(
        'transition-colors duration-150',
        hoverable && onClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </tr>
  );
};

TableRow.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  hoverable: PropTypes.bool,
  onClick: PropTypes.func,
};

const TableHead = ({ children, className, sortable, sortDirection, onSort, ...props }) => {
  const SortIcon = () => {
    if (!sortable) return null;

    if (sortDirection === 'asc') {
      return <ChevronUp className="ml-1 h-4 w-4" />;
    }

    if (sortDirection === 'desc') {
      return <ChevronDown className="ml-1 h-4 w-4" />;
    }

    return <ChevronsUpDown className="ml-1 h-4 w-4 opacity-50" />;
  };

  return (
    <th
      className={cn(
        'px-4 py-3 font-medium text-gray-500 dark:text-gray-400',
        'border-b border-gray-200 dark:border-gray-700',
        sortable && 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-200',
        className
      )}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div className="flex items-center">
        {children}
        <SortIcon />
      </div>
    </th>
  );
};

TableHead.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  sortable: PropTypes.bool,
  sortDirection: PropTypes.oneOf(['asc', 'desc', null]),
  onSort: PropTypes.func,
};

const TableCell = ({ children, className, ...props }) => {
  return (
    <td
      className={cn(
        'px-4 py-3 text-gray-900 dark:text-white',
        'border-b border-gray-100 dark:border-gray-800 last:border-0',
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
};

TableCell.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

const TableCaption = ({ children, className, ...props }) => {
  return (
    <caption
      className={cn('mt-4 text-sm text-gray-500 dark:text-gray-400', className)}
      {...props}
    >
      {children}
    </caption>
  );
};

TableCaption.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

// Sortable Table Hook
const useSortableTable = (initialSort = { key: null, direction: 'asc' }) => {
  const [sortConfig, setSortConfig] = useState(initialSort);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedData = (data, key) => {
    if (!sortConfig.key || !key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  return { sortConfig, handleSort, sortedData };
};

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  useSortableTable,
};
export default Table;
