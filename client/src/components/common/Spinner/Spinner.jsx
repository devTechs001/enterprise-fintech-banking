import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';

const Spinner = forwardRef(
  (
    {
      className,
      size = 'md',
      variant = 'primary',
      fullScreen = false,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    };

    const variantClasses = {
      primary: 'text-primary-600',
      secondary: 'text-gray-600',
      success: 'text-success-600',
      danger: 'text-danger-600',
      warning: 'text-warning-600',
      white: 'text-white',
    };

    if (fullScreen) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            ref={ref}
            className={cn(
              'animate-spin rounded-full border-4 border-current border-t-transparent',
              sizeClasses[size],
              variantClasses[variant],
              className
            )}
            {...props}
          />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'animate-spin rounded-full border-4 border-current border-t-transparent',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Spinner.displayName = 'Spinner';

Spinner.propTypes = {
  className: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'white']),
  fullScreen: PropTypes.bool,
};

const Skeleton = forwardRef(
  (
    {
      className,
      variant = 'rectangular',
      width,
      height,
      animation = 'pulse',
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      rectangular: 'rounded-lg',
      circular: 'rounded-full',
      text: 'rounded',
    };

    const animationClasses = {
      pulse: 'animate-pulse',
      shimmer: 'animate-shimmer',
      none: '',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'bg-gray-200 dark:bg-gray-700',
          variantClasses[variant],
          animationClasses[animation],
          className
        )}
        style={{ width, height }}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

Skeleton.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['rectangular', 'circular', 'text']),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  animation: PropTypes.oneOf(['pulse', 'shimmer', 'none']),
};

export { Spinner, Skeleton };
export default Spinner;
