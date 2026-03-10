import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import { Button } from '@/components/common/Button';

const Alert = ({
  children,
  variant = 'info',
  title,
  icon,
  dismissible = false,
  onDismiss,
  className,
  ...props
}) => {
  const variantClasses = {
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
  };

  const variantIcons = {
    info: Info,
    success: CheckCircle,
    warning: AlertCircle,
    error: XCircle,
  };

  const Icon = icon || variantIcons[variant];

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border',
        variantClasses[variant],
        className
      )}
      role="alert"
      {...props}
    >
      {Icon && (
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      )}
      <div className="flex-1">
        {title && (
          <h4 className="font-medium mb-1">{title}</h4>
        )}
        <div className="text-sm opacity-90">{children}</div>
      </div>
      {dismissible && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDismiss}
          className="opacity-50 hover:opacity-100 -mr-2 -mt-2"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

Alert.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  title: PropTypes.node,
  icon: PropTypes.elementType,
  dismissible: PropTypes.bool,
  onDismiss: PropTypes.func,
  className: PropTypes.string,
};

export { Alert };
export default Alert;
