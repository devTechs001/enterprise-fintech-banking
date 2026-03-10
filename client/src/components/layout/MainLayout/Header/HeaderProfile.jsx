import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';
import { Avatar } from '@/components/common/Avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/common/Dropdown';
import { User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const HeaderProfile = ({ className }) => {
  const { user, logout } = useAuth();

  return (
    <div className={cn('', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-1.5 transition-colors">
            <Avatar src={user?.avatar} alt={user?.firstName} size="sm" />
            <span className="hidden lg:block text-sm font-medium text-gray-700 dark:text-gray-200">
              {user?.firstName} {user?.lastName}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <p className="font-medium">{user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
          <DropdownMenuItem>
            <User className="w-4 h-4 mr-2" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="text-danger-600">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

HeaderProfile.propTypes = {
  className: PropTypes.string,
};

export { HeaderProfile };
export default HeaderProfile;
