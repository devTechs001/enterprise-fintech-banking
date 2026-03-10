import { useState } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';
import { Bell } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/common/Dropdown';

const HeaderNotifications = ({ className }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Payment Received',
      description: 'You received $500 from John Doe',
      time: '2 minutes ago',
      read: false,
    },
    {
      id: 2,
      title: 'Low Balance Alert',
      description: 'Your checking account balance is below $100',
      time: '1 hour ago',
      read: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className={cn('relative', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <Badge
                variant="danger"
                size="sm"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() =>
                  setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
                }
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={cn(
                  'flex-col items-start gap-1 p-4 cursor-pointer',
                  !notification.read && 'bg-primary-50 dark:bg-primary-900/20'
                )}
              >
                <span className="font-medium">{notification.title}</span>
                <span className="text-sm text-gray-500">
                  {notification.description}
                </span>
                <span className="text-xs text-gray-400">{notification.time}</span>
              </DropdownMenuItem>
            ))}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="justify-center text-primary-600">
            View all notifications
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

HeaderNotifications.propTypes = {
  className: PropTypes.string,
};

export { HeaderNotifications };
export default HeaderNotifications;
