import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';
import {
  Bell,
  Search,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  HelpCircle,
  Moon,
  Sun,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { useNotifications } from '@/context/NotificationContext';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/common/Dropdown';
import { SearchInput } from '@/components/common/SearchInput';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

const Header = ({ sidebarOpen, sidebarCollapsed, onToggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();

  const navigate = useNavigate();
  // Real notification feed. The dropdown previously showed two hardcoded sample
  // items and a badge hardcoded to "3" regardless of actual unread count.
  const { notifications = [], unreadCount = 0 } = useNotifications() || {};
  const previewNotifications = (notifications || []).slice(0, 4);
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query) => {
    console.log('Searching for:', query);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-30',
        'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl',
        'border-b border-gray-200 dark:border-gray-800',
        'h-16 px-6 flex items-center justify-between'
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
        >
          {sidebarCollapsed ? (
            <Menu className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </Button>

        <div className="hidden md:block w-80">
          <SearchInput
            placeholder="Search transactions, accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={handleSearch}
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </Button>

        {/* Help — was inert; now routes to the Help Centre. */}
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
          onClick={() => navigate('/help')}
          aria-label="Help centre"
          title="Help centre"
        >
          <HelpCircle className="w-5 h-5" aria-hidden="true" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 relative"
            >
              <Bell className="w-5 h-5" />
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
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold">Notifications</h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {previewNotifications.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  You are all caught up.
                </p>
              ) : (
                previewNotifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex-col items-start gap-1 p-4"
                    onSelect={() => navigate('/notifications')}
                  >
                    <span className="font-medium">{notification.title}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{notification.body || notification.message}</span>
                    <span className="text-xs text-gray-400">
                      {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : ''}
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

        {/* Settings — was inert; now routes to Settings. */}
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
          onClick={() => navigate('/settings')}
          aria-label="Settings"
          title="Settings"
        >
          <Settings className="w-5 h-5" aria-hidden="true" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-1.5 transition-colors">
              <Avatar
                src={user?.avatar}
                alt={user?.firstName}
                size="sm"
              />
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
            <DropdownMenuItem asChild>
              <Link to="/settings/profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-danger-600">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

Header.propTypes = {
  sidebarOpen: PropTypes.bool,
  sidebarCollapsed: PropTypes.bool,
  onToggleSidebar: PropTypes.func,
};

export { Header };
export default Header;
