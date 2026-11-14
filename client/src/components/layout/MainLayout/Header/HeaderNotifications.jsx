import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';

import { cn } from '@/utils/helpers';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { useNotifications } from '@/context/NotificationContext';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/common/Dropdown';

/**
 * Header notification bell.
 *
 * Previously held two hardcoded sample items in local `useState` — a bell that
 * always shows a badge and whose "mark all as read" mutated only that local array,
 * so it reset on every remount. It now reads the real feed from
 * `NotificationContext`, which queries `/notifications` and owns the read state, and
 * clicking an item marks it read server-side rather than just locally.
 */
const HeaderNotifications = ({ className }) => {
  const navigate = useNavigate();
  const {
    notifications = [], unreadCount = 0, markAsRead, markAllAsRead, isLoading,
  } = useNotifications() || {};

  const preview = (notifications ?? []).slice(0, 4);

  const openNotification = async (notification) => {
    try { await markAsRead?.(notification.id); } catch { /* the list page will show it unread */ }
    navigate('/notifications');
  };

  return (
    <div className={cn('relative', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative text-gray-500 hover:text-gray-700 dark:text-gray-400"
            aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
          >
            <Bell className="w-5 h-5" aria-hidden="true" />
            {unreadCount > 0 && (
              <Badge
                variant="danger"
                size="sm"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-80">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 dark:border-gray-700">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && markAllAsRead && (
              <button
                type="button"
                onClick={() => markAllAsRead()}
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">Loading…</p>
            ) : preview.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">You are all caught up.</p>
            ) : (
              preview.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  onSelect={() => openNotification(notification)}
                  className={cn(
                    'flex-col items-start gap-1 cursor-pointer p-4',
                    !notification.read && 'bg-primary-50 dark:bg-primary-900/20'
                  )}
                >
                  <span className="font-medium">{notification.title}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {notification.body || notification.description || notification.message}
                  </span>
                  <span className="text-xs text-gray-400">
                    {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : notification.time}
                  </span>
                </DropdownMenuItem>
              ))
            )}
          </div>

          <DropdownMenuSeparator />
          <DropdownMenuItem className="justify-center text-primary-600" onSelect={() => navigate('/notifications')}>
            View all notifications
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

HeaderNotifications.propTypes = { className: PropTypes.string };

export { HeaderNotifications };
export default HeaderNotifications;
