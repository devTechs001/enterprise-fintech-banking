import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';
import { formatRelativeTime } from '@/utils/formatters';

const RecentActivity = ({ activities, className }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {activities.map((activity, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <activity.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{activity.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
            </div>
          </div>
          <span
            className={cn(
              'font-semibold',
              activity.type === 'credit'
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            )}
          >
            {activity.amount}
          </span>
        </div>
      ))}
    </div>
  );
};

RecentActivity.propTypes = {
  activities: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
      amount: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['credit', 'debit']).isRequired,
      icon: PropTypes.elementType,
    })
  ),
  className: PropTypes.string,
};

export { RecentActivity };
export default RecentActivity;
