import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Popover } from '@/components/common/Popover';

const DatePicker = ({
  value,
  onChange,
  label,
  placeholder = 'Select date',
  disabled = false,
  minDate,
  maxDate,
  dateFormat = 'MM/dd/yyyy',
  className,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const [viewDate, setViewDate] = useState(selectedDate || new Date());
  const buttonRef = useRef(null);

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    onChange?.(date);
    setIsOpen(false);
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();

    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isSelected =
        selectedDate &&
        date.toDateString() === selectedDate.toDateString();
      const isToday = date.toDateString() === today.toDateString();
      const isDisabled =
        (minDate && date < minDate) || (maxDate && date > maxDate);

      days.push(
        <button
          key={day}
          onClick={() => !isDisabled && handleDateSelect(date)}
          disabled={isDisabled}
          className={cn(
            'h-8 w-8 rounded-full text-sm font-medium transition-colors',
            isSelected && 'bg-primary-600 text-white',
            !isSelected && !isDisabled && 'hover:bg-gray-100 dark:hover:bg-gray-700',
            isToday && !isSelected && 'bg-primary-100 dark:bg-primary-900/50 text-primary-600',
            isDisabled && 'opacity-30 cursor-not-allowed'
          )}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}

      <Popover
        open={isOpen}
        onOpenChange={setIsOpen}
        trigger={
          <Button
            ref={buttonRef}
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !value && 'text-gray-500'
            )}
            disabled={disabled}
            leftIcon={CalendarIcon}
          >
            {value ? formatDate(new Date(value)) : placeholder}
          </Button>
        }
        side="bottom"
        align="start"
      >
        <div className="p-4">
          {/* Month/Year header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              {'<'}
            </button>
            <span className="font-medium">
              {months[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              {'>'}
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div
                key={day}
                className="h-8 flex items-center justify-center text-xs font-medium text-gray-500"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
        </div>
      </Popover>
    </div>
  );
};

DatePicker.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  onChange: PropTypes.func,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  minDate: PropTypes.instanceOf(Date),
  maxDate: PropTypes.instanceOf(Date),
  dateFormat: PropTypes.string,
  className: PropTypes.string,
};

export { DatePicker };
export default DatePicker;
