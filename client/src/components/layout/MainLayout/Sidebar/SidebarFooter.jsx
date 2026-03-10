import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';
import { Avatar } from '@/components/common/Avatar';
import { useAuth } from '@/context/AuthContext';

const SidebarFooter = ({ className }) => {
  const { user } = useAuth();

  return (
    <div
      className={cn(
        'p-4 mx-3 mb-3 rounded-xl bg-gray-50 dark:bg-gray-800',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar src={user?.avatar} alt={user?.firstName} size="md" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {user?.email}
          </p>
        </div>
      </div>
    </div>
  );
};

SidebarFooter.propTypes = {
  className: PropTypes.string,
};

export { SidebarFooter };
export default SidebarFooter;
