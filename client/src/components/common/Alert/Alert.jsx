import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cva } from 'class-variance-authority';
import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { Button } from '../Button';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 flex gap-3',
  {
    variants: {
      variant: {
        default: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100',
        info: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100',
        success: 'bg-success-50 border-success-200 text-success-900 dark:bg-success-900/20 dark:border-success-800 dark:text-success-100',
        warning: 'bg-warning-50 border-warning-200 text-warning-900 dark:bg-warning-900/20 dark:border-warning-800 dark:text-warning-100',
        danger: 'bg-danger-50 border-danger-200 text-danger-900 dark:bg-danger-900/20 dark:border-danger-800 dark:text-danger-100',
        error: 'bg-danger-50 border-danger-200 text-danger-900 dark:bg-danger-900/20 dark:border-danger-800 dark:text-danger-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const iconMap = {
  default: Info,
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  danger: XCircle,
  error: XCircle,
};

const Alert = forwardRef(
  (
    {
      className,
      variant,
      title,
      description,
      icon: CustomIcon,
      action,
      onDismiss,
      ...props
    },
    ref
  ) => {
    const Icon = CustomIcon || iconMap[variant] || iconMap.default;

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        <div className="flex-1 space-y-1">
          {title && (
            <p className="font-medium text-sm">{title}</p>
          )}
          {description && (
            <p className="text-sm opacity-90">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {action && (
            <Button
              size="sm"
              variant={variant === 'danger' || variant === 'error' ? 'danger' : 'primary'}
              {...action}
            />
          )}
          {onDismiss && (
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={onDismiss}
              className="h-6 w-6"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';

Alert.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'info', 'success', 'warning', 'danger', 'error']),
  title: PropTypes.string,
  description: PropTypes.string,
  icon: PropTypes.elementType,
  action: PropTypes.shape({
    children: PropTypes.node,
    onClick: PropTypes.func,
  }),
  onDismiss: PropTypes.func,
};

export { Alert, alertVariants };
export default Alert;
