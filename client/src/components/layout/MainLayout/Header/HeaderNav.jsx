import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';

const HeaderNav = ({ className }) => {
  const navItems = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Accounts', to: '/accounts' },
    { label: 'Transfers', to: '/transfers' },
    { label: 'Payments', to: '/payments' },
    { label: 'Cards', to: '/cards' },
  ];

  return (
    <nav className={cn('flex items-center gap-1', className)}>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
};

HeaderNav.propTypes = {
  className: PropTypes.string,
};

export { HeaderNav };
export default HeaderNav;
