import { useState } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Wallet,
  ArrowRightLeft,
  CreditCard,
  Receipt,
  TrendingUp,
  FileText,
  Settings,
  HelpCircle,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  Users,
  PieChart,
  Shield,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { HeaderLogo } from '../Header/HeaderLogo';
import { SidebarItem } from './SidebarItem';
import { SidebarGroup } from './SidebarGroup';
import { SidebarFooter } from './SidebarFooter';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';

/**
 * Navigation.
 *
 * Only routes that actually exist are linked. The previous list pointed at
 * /accounts, /payments, /cards, /investments, /loans, /analytics, /beneficiaries,
 * /settings and /help — none of which were mounted, so every one of them landed
 * on the 404 page. Unbuilt areas are marked `soon` and rendered inert.
 */
const mainNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: ArrowRightLeft, label: 'Transfers', to: '/transfers' },
  { icon: Shield, label: 'Security', to: '/security' },
];

const secondaryNavItems = [
  { icon: Bell, label: 'Notifications', to: '/notifications' },
  { icon: Wallet, label: 'Accounts', soon: true },
  { icon: Receipt, label: 'Payments', soon: true },
  { icon: CreditCard, label: 'Cards', soon: true },
  { icon: TrendingUp, label: 'Investments', soon: true },
  { icon: FileText, label: 'Loans', soon: true },
  { icon: PieChart, label: 'Analytics', soon: true },
  { icon: Users, label: 'Beneficiaries', soon: true },
];

const bottomNavItems = [
  { icon: Settings, label: 'Settings', soon: true },
  { icon: HelpCircle, label: 'Help Center', soon: true },
];

const Sidebar = ({ isOpen, isCollapsed, onToggle, onCollapse }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout?.();
  };

  const isActive = (to) => {
    return location.pathname.startsWith(to);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        'fixed left-0 top-0 h-screen',
        'bg-white dark:bg-gray-900',
        'border-r border-gray-200 dark:border-gray-800',
        'z-40 overflow-hidden',
        !isOpen && '-translate-x-full'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className={cn('h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-800')}>
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <HeaderLogo />
          </Link>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onCollapse}
              className="ml-auto text-gray-500"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {/* Main Navigation */}
          <SidebarGroup title={!isCollapsed ? 'Main Menu' : null}>
            {mainNavItems.map((item) => (
              <SidebarItem
                key={item.to}
                icon={item.icon}
                label={item.label}
                to={item.to}
                isActive={isActive(item.to)}
                collapsed={isCollapsed}
              />
            ))}
          </SidebarGroup>

          {/* Secondary Navigation */}
          <SidebarGroup title={!isCollapsed ? 'More' : null}>
            {secondaryNavItems.map((item) => (
              <SidebarItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                to={item.soon ? undefined : item.to}
                disabled={item.soon}
                isActive={item.to ? isActive(item.to) : false}
                collapsed={isCollapsed}
              />
            ))}
          </SidebarGroup>
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t border-gray-200 dark:border-gray-800 py-4">
          {bottomNavItems.map((item) => (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              disabled={item.soon}
              isActive={false}
              collapsed={isCollapsed}
            />
          ))}

          {/* Logout */}
          <SidebarItem
            icon={LogOut}
            label="Logout"
            onClick={handleLogout}
            isActive={false}
            collapsed={isCollapsed}
            className="text-danger-600 hover:text-danger-700"
          />
        </div>

        {/* Footer */}
        {!isCollapsed && <SidebarFooter />}
      </div>
    </motion.aside>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool,
  isCollapsed: PropTypes.bool,
  onToggle: PropTypes.func,
  onCollapse: PropTypes.func,
};

export { Sidebar };
export default Sidebar;
