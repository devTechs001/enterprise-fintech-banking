import { Bell, CheckCheck } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/Card';
import { Skeleton } from '@/components/common/Skeleton';
import { NotificationItem } from '../NotificationItem/NotificationItem';
import { NotificationBadge } from '../NotificationBadge/NotificationBadge';
import { useNotifications } from '@/context/NotificationContext';

/** Full-page notification feed driven by the API via NotificationContext. */
const NotificationCenter = () => {
  const { notifications, unreadCount, isLoading, refresh, markAsRead, markAllAsRead } = useNotifications();

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
        <div className="flex items-center gap-3">
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10">
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute -right-1 -top-1">
              <NotificationBadge count={unreadCount} />
            </span>
          </span>
          <div>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Security alerts and account activity.</CardDescription>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={refresh} leftIcon={Bell}>Refresh</Button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead} leftIcon={CheckCheck}>
              Mark all read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
          </div>
        )}
        {!isLoading && notifications.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">You are all caught up.</p>
        )}
        {!isLoading && notifications.length > 0 && (
          <ul className="space-y-2">
            {notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} onRead={markAsRead} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export { NotificationCenter };
export default NotificationCenter;
