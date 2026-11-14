import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { User, Settings, Shield, LogOut, Bell } from 'lucide-react';

import { cn } from '@/utils/helpers';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/common/Dropdown';

/**
 * Header profile menu.
 *
 * "Profile" and "Settings" were inert `DropdownMenuItem`s with no handler at all.
 * They now navigate to real pages. Sign-out is async and clears the query cache —
 * without that, the next user to sign in on the same browser tab could briefly see
 * the previous user's cached balances, which is a privacy bug rather than a cosmetic one.
 */
const HeaderProfile = ({ className }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try { await logout?.(); } finally {
      queryClient.clear();
      navigate('/login', { replace: true });
    }
  };

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();

  return (
    <div className={cn('', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={`Account menu for ${user?.firstName ?? 'user'}`}
          >
            <Avatar src={user?.avatar} alt={fullName} name={fullName} size="sm" />
            <span className="hidden text-sm font-medium text-gray-700 dark:text-gray-200 lg:block">
              {user?.firstName} {user?.lastName}
            </span>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-60">
          <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <p className="truncate font-medium">{user?.firstName} {user?.lastName}</p>
            <p className="truncate text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {user?.mfaEnabled
                ? <Badge variant="success" size="sm">2FA on</Badge>
                : <Badge variant="warning" size="sm">2FA off</Badge>}
              <Badge variant={user?.kycStatus === 'verified' ? 'success' : 'secondary'} size="sm">
                KYC {user?.kycStatus ?? 'pending'}
              </Badge>
            </div>
          </div>

          <DropdownMenuItem onSelect={() => navigate('/settings')}>
            <User className="mr-2 w-4 h-4" aria-hidden="true" /> Profile
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => navigate('/settings')}>
            <Settings className="mr-2 w-4 h-4" aria-hidden="true" /> Settings
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => navigate('/security')}>
            <Shield className="mr-2 w-4 h-4" aria-hidden="true" /> Security centre
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => navigate('/notifications')}>
            <Bell className="mr-2 w-4 h-4" aria-hidden="true" /> Notifications
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onSelect={handleLogout} className="text-danger-600">
            <LogOut className="mr-2 w-4 h-4" aria-hidden="true" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

HeaderProfile.propTypes = { className: PropTypes.string };

export { HeaderProfile };
export default HeaderProfile;
