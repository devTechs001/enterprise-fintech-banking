import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

/** Full-page notification feed. */
const Notifications = () => (
  <DashboardLayout>
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Security alerts and account activity.</p>
    </div>
    <NotificationCenter />
  </DashboardLayout>
);

export { Notifications };
export default Notifications;
