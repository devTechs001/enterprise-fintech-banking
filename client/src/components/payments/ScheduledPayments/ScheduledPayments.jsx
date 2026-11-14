import PropTypes from 'prop-types';
import { CalendarClock } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { formatCurrency, formatDate } from '@/utils/formatters';

/** Upcoming scheduled payments with next-run dates and cancel affordances. */
const ScheduledPayments = ({ schedules = [], onCancel }) => (
  <Card>
    <CardHeader className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10">
        <CalendarClock className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <CardTitle>Scheduled payments</CardTitle>
        <CardDescription>Recurring and future-dated instructions.</CardDescription>
      </div>
    </CardHeader>
    <CardContent>
      {schedules.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">Nothing scheduled.</p>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {schedules.map((schedule) => (
            <li key={schedule.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{schedule.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatCurrency(schedule.amount, schedule.currency)} · next {formatDate(schedule.nextRunAt)} · {schedule.frequency}
                </p>
              </div>
              <Badge variant={schedule.status === 'active' ? 'success' : 'secondary'} size="sm">{schedule.status}</Badge>
              {onCancel && schedule.status === 'active' && (
                <button type="button" onClick={() => onCancel(schedule.id)} className="text-xs font-medium text-danger-600 hover:underline">
                  Cancel
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </CardContent>
  </Card>
);

ScheduledPayments.propTypes = {
  schedules: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired, name: PropTypes.string.isRequired, amount: PropTypes.number.isRequired,
    currency: PropTypes.string, nextRunAt: PropTypes.string.isRequired, frequency: PropTypes.string, status: PropTypes.string,
  })),
  onCancel: PropTypes.func,
};

export { ScheduledPayments };
export default ScheduledPayments;
