import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cva } from 'class-variance-authority';
import { cn } from '@/utils/helpers';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
        secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
        success: 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200',
        danger: 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200',
        warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200',
        info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        outline: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
      },
      size: {
        sm: 'px-1.5 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
      dot: {
        true: 'gap-1.5 pl-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const Badge = forwardRef(
  (
    {
      className,
      variant,
      size,
      dot,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, dot }), className)}
        {...props}
      >
        {dot && (
          <span className={cn(
            'h-1.5 w-1.5 rounded-full',
            variant === 'success' && 'bg-success-500',
            variant === 'danger' && 'bg-danger-500',
            variant === 'warning' && 'bg-warning-500',
            variant === 'info' && 'bg-blue-500',
            variant === 'default' && 'bg-primary-500',
            variant === 'secondary' && 'bg-gray-500'
          )} />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

Badge.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'secondary', 'success', 'danger', 'warning', 'info', 'outline']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  dot: PropTypes.bool,
  children: PropTypes.node,
};

export { Badge, badgeVariants };
export default Badge;
