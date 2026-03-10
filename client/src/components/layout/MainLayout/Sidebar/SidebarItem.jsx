import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';
import { NavLink } from 'react-router-dom';

const SidebarItem = ({ icon: Icon, label, to, isActive, onClick, collapsed, className }) => {
  const content = (
    <>
      <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-primary-600')} />
      {!collapsed && (
        <span className={cn('text-sm font-medium', isActive ? 'text-primary-600' : '')}>
          {label}
        </span>
      )}
    </>
  );

  if (to) {
    return (
      <NavLink
        to={to}
        className={({ isActive: navIsActive }) =>
          cn(
            'flex items-center gap-3 px-4 py-3 mx-3 rounded-lg',
            'transition-colors duration-200',
            navIsActive
              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
            collapsed && 'justify-center px-3',
            className
          )
        }
      >
        {content}
      </NavLink>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-3 mx-3 rounded-lg w-full',
        'transition-colors duration-200',
        isActive
          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
        collapsed && 'justify-center px-3',
        className
      )}
    >
      {content}
    </button>
  );
};

SidebarItem.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  to: PropTypes.string,
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
  collapsed: PropTypes.bool,
  className: PropTypes.string,
};

export { SidebarItem };
export default SidebarItem;
