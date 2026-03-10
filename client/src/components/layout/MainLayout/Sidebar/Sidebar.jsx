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
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  Users,
  PieChart,
  Shield,
  MessageSquare,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { HeaderLogo } from './Header/HeaderLogo';
import { SidebarItem } from './SidebarItem';
import { SidebarGroup } from './SidebarGroup';
import { SidebarFooter } from './SidebarFooter';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';

const mainNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: Wallet, label: 'Accounts', to: '/accounts' },
  { icon: ArrowRightLeft, label: 'Transfers', to: '/transfers' },
  { icon: Receipt, label: 'Payments', to: '/payments' },
  { icon: CreditCard, label: 'Cards', to: '/cards' },
  { icon: TrendingUp, label: 'Investments', to: '/investments' },
  { icon: FileText, label: 'Loans', to: '/loans' },
];

const secondaryNavItems = [
  { icon: PieChart, label: 'Analytics', to: '/analytics' },
  { icon: Users, label: 'Beneficiaries', to: '/beneficiaries' },
  { icon: Shield, label: 'Security', to: '/settings/security' },
  { icon: MessageSquare, label: 'Support', to: '/support' },
];

const bottomNavItems = [
  { icon: Settings, label: 'Settings', to: '/settings' },
  { icon: HelpCircle, label: 'Help Center', to: '/help' },
];

const Sidebar = ({ isOpen, isCollapsed, onToggle, onCollapse }) => {
  const location = useLocation();
  const { logout } = useAuth();

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
                key={item.to}
                icon={item.icon}
                label={item.label}
                to={item.to}
                isActive={isActive(item.to)}
                collapsed={isCollapsed}
              />
            ))}
          </SidebarGroup>
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t border-gray-200 dark:border-gray-800 py-4">
          {bottomNavItems.map((item) => (
            <SidebarItem
              key={item.to}
              icon={item.icon}
              label={item.label}
              to={item.to}
              isActive={isActive(item.to)}
              collapsed={isCollapsed}
            />
          ))}

          {/* Logout */}
          <SidebarItem
            icon={LogOut}
            label="Logout"
            onClick={logout}
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
