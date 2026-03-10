import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  ...props
}) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-200',
    secondary: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/50 dark:text-secondary-200',
    success: 'bg-success-100 text-success-800 dark:bg-success-900/50 dark:text-success-200',
    warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900/50 dark:text-warning-200',
    danger: 'bg-danger-100 text-danger-800 dark:bg-danger-900/50 dark:text-danger-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
    outline: 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    'default',
    'primary',
    'secondary',
    'success',
    'warning',
    'danger',
    'info',
    'outline',
  ]),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export { Badge };
export default Badge;
