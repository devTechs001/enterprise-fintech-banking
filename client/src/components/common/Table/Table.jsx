import { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { Button } from '../Button';

const Table = forwardRef(
  (
    {
      className,
      data,
      columns,
      sortable = true,
      selectable = false,
      pagination = true,
      pageSize = 10,
      onRowClick,
      onSelectionChange,
      emptyMessage = 'No data available',
      loading = false,
      ...props
    },
    ref
  ) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [selectedRows, setSelectedRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    // Sort data
    const sortedData = React.useMemo(() => {
      let sortableItems = [...data];
      if (sortConfig.key !== null) {
        sortableItems.sort((a, b) => {
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        });
      }
      return sortableItems;
    }, [data, sortConfig]);

    // Filter data
    const filteredData = React.useMemo(() => {
      if (!searchTerm) return sortedData;
      return sortedData.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }, [sortedData, searchTerm]);

    // Paginate data
    const paginatedData = React.useMemo(() => {
      if (!pagination) return filteredData;
      const startIndex = (currentPage - 1) * pageSize;
      return filteredData.slice(startIndex, startIndex + pageSize);
    }, [filteredData, currentPage, pageSize, pagination]);

    const totalPages = Math.ceil(filteredData.length / pageSize);

    const handleSort = (key) => {
      if (!sortable) return;
      setSortConfig((current) => ({
        key,
        direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
      }));
    };

    const handleSelectRow = (id) => {
      if (!selectable) return;
      setSelectedRows((current) => {
        const newSelection = current.includes(id)
          ? current.filter((rowId) => rowId !== id)
          : [...current, id];
        onSelectionChange?.(newSelection);
        return newSelection;
      });
    };

    const handleSelectAll = () => {
      if (selectedRows.length === paginatedData.length) {
        setSelectedRows([]);
        onSelectionChange?.([]);
      } else {
        const allIds = paginatedData.map((row) => row.id);
        setSelectedRows(allIds);
        onSelectionChange?.(allIds);
      }
    };

    return (
      <div className="w-full space-y-4" ref={ref} {...props}>
        {/* Search */}
        <div className="flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden dark:border-gray-700">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {selectable && (
                  <th className="w-12 p-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                      sortable && column.sortable !== false && 'cursor-pointer hover:text-gray-700'
                    )}
                    onClick={() => handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.title}
                      {sortable && column.sortable !== false && sortConfig.key === column.key && (
                        sortConfig.direction === 'asc' ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-12 text-center">
                    <div className="animate-pulse text-gray-400">Loading...</div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-12 text-center text-gray-500">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, rowIndex) => (
                  <tr
                    key={row.id || rowIndex}
                    className={cn(
                      'hover:bg-gray-50 dark:hover:bg-gray-800',
                      selectedRows.includes(row.id) && 'bg-primary-50 dark:bg-primary-900/20',
                      onRowClick && 'cursor-pointer'
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {selectable && (
                      <td className="w-12 p-4">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(row.id)}
                          onChange={() => handleSelectRow(row.id)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} results
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

Table.displayName = 'Table';

Table.propTypes = {
  className: PropTypes.string,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  columns: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    sortable: PropTypes.bool,
    render: PropTypes.func,
  })).isRequired,
  sortable: PropTypes.bool,
  selectable: PropTypes.bool,
  pagination: PropTypes.bool,
  pageSize: PropTypes.number,
  onRowClick: PropTypes.func,
  onSelectionChange: PropTypes.func,
  emptyMessage: PropTypes.string,
  loading: PropTypes.bool,
};

export { Table };
export default Table;
