import { forwardRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { cva } from 'class-variance-authority';
import { X, CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { Button } from '../Button';

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full',
  {
    variants: {
      variant: {
        default: 'border-gray-200 bg-white text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100',
        success: 'border-success-200 bg-success-50 text-success-900 dark:border-success-800 dark:bg-success-900/20 dark:text-success-100',
        error: 'border-danger-200 bg-danger-50 text-danger-900 dark:border-danger-800 dark:bg-danger-900/20 dark:text-danger-100',
        warning: 'border-warning-200 bg-warning-50 text-warning-900 dark:border-warning-800 dark:bg-warning-900/20 dark:text-warning-100',
        info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const iconMap = {
  default: Info,
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const Toast = forwardRef(
  (
    {
      className,
      variant,
      title,
      description,
      icon: CustomIcon,
      action,
      onDismiss,
      duration = 5000,
      ...props
    },
    ref
  ) => {
    const Icon = CustomIcon || iconMap[variant] || iconMap.default;

    return (
      <div
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        {...props}
      >
        <div className="flex gap-3">
          <Icon className="h-5 w-5 flex-shrink-0" />
          <div className="space-y-1">
            {title && (
              <p className="font-medium text-sm">{title}</p>
            )}
            {description && (
              <p className="text-sm opacity-90">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {action && (
            <Button
              size="sm"
              variant={variant === 'error' ? 'danger' : 'primary'}
              {...action}
            />
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="absolute right-2 top-2 rounded-md p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

Toast.displayName = 'Toast';

Toast.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'success', 'error', 'warning', 'info']),
  title: PropTypes.string,
  description: PropTypes.string,
  icon: PropTypes.elementType,
  action: PropTypes.shape({
    children: PropTypes.node,
    onClick: PropTypes.func,
  }),
  onDismiss: PropTypes.func,
  duration: PropTypes.number,
};

// Toast Container
const ToastContainer = ({ toasts, removeToast, position = 'top-right' }) => {
  const positionClasses = {
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'top-center': 'top-0 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2',
  };

  return (
    <div
      className={cn(
        'fixed z-[100] flex max-h-screen w-full flex-col gap-2 p-4 sm:max-w-[420px]',
        positionClasses[position]
      )}
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

ToastContainer.propTypes = {
  toasts: PropTypes.arrayOf(PropTypes.object).isRequired,
  removeToast: PropTypes.func.isRequired,
  position: PropTypes.oneOf(['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center']),
};

export { Toast, ToastContainer, toastVariants };
export default Toast;
