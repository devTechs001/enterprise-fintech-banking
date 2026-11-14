import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';
import { NavLink } from 'react-router-dom';

const SidebarItem = ({ icon: Icon, label, to, isActive, onClick, collapsed, className, disabled = false }) => {
  const content = (
    <>
      <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-primary-600')} />
      {!collapsed && (
        <span className={cn('flex-1 text-sm font-medium', isActive ? 'text-primary-600' : '')}>
          {label}
        </span>
      )}
      {!collapsed && disabled && (
        <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-400 dark:bg-gray-800">
          Soon
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
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      title={disabled ? `${label} — not available yet` : undefined}
      className={cn(
        'flex items-center gap-3 px-4 py-3 mx-3 rounded-lg w-full',
        disabled && 'cursor-not-allowed opacity-45 hover:bg-transparent',
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
  disabled: PropTypes.bool,
};

export { SidebarItem };
export default SidebarItem;
