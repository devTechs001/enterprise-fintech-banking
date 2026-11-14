import PropTypes from 'prop-types';
import { AlertTriangle, CheckCircle2, Info, ShieldAlert, XCircle } from 'lucide-react';

import { cn } from '@/utils/helpers';
import { formatRelativeTime } from '@/utils/formatters';

const ICONS = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  danger: ShieldAlert,
  error: XCircle,
};

const TONES = {
  success: 'bg-success-50 text-success-600 dark:bg-success-500/10',
  info: 'bg-primary-50 text-primary-600 dark:bg-primary-500/10',
  warning: 'bg-warning-50 text-warning-600 dark:bg-warning-500/10',
  danger: 'bg-danger-50 text-danger-600 dark:bg-danger-500/10',
  error: 'bg-danger-50 text-danger-600 dark:bg-danger-500/10',
};

const NotificationItem = ({ notification, onRead, className }) => {
  const severity = notification.severity || 'info';
  const Icon = ICONS[severity] || Info;

  return (
    <li
      className={cn(
        'flex items-start gap-3 rounded-xl border p-3 transition-colors',
        notification.read
          ? 'border-transparent bg-gray-50 dark:bg-gray-800/40'
          : 'border-primary-100 bg-primary-50/50 dark:border-primary-900/40 dark:bg-primary-900/10',
        className
      )}
    >
      <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', TONES[severity])}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
        <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">{notification.description}</p>
        <time dateTime={notification.at} className="mt-1 block text-[11px] text-gray-400">
          {formatRelativeTime(notification.at)}
        </time>
      </div>
      {!notification.read && onRead && (
        <button
          type="button"
          onClick={() => onRead(notification.id)}
          className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-primary-600 transition hover:bg-primary-100 dark:hover:bg-primary-900/30"
        >
          Mark read
        </button>
      )}
    </li>
  );
};

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    severity: PropTypes.string,
    read: PropTypes.bool,
    at: PropTypes.string,
  }).isRequired,
  onRead: PropTypes.func,
  className: PropTypes.string,
};

export { NotificationItem };
export default NotificationItem;
