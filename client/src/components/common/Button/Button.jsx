import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cva } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/helpers';

const buttonVariants = cva(
  // Base styles
  `inline-flex items-center justify-center gap-2 
   font-medium transition-all duration-200 
   focus:outline-none focus:ring-2 focus:ring-offset-2 
   disabled:opacity-50 disabled:pointer-events-none
   active:scale-[0.98]`,
  {
    variants: {
      variant: {
        primary: `
          bg-primary-600 text-white 
          hover:bg-primary-700 
          focus:ring-primary-500
          shadow-sm hover:shadow-md
        `,
        secondary: `
          bg-secondary-100 text-secondary-900 
          hover:bg-secondary-200 
          focus:ring-secondary-500
          dark:bg-secondary-800 dark:text-secondary-100
          dark:hover:bg-secondary-700
        `,
        outline: `
          border-2 border-primary-600 text-primary-600 
          hover:bg-primary-50 
          focus:ring-primary-500
          dark:border-primary-400 dark:text-primary-400
          dark:hover:bg-primary-950
        `,
        ghost: `
          text-secondary-600 
          hover:bg-secondary-100 hover:text-secondary-900
          focus:ring-secondary-500
          dark:text-secondary-400 
          dark:hover:bg-secondary-800 dark:hover:text-secondary-100
        `,
        danger: `
          bg-danger-600 text-white 
          hover:bg-danger-700 
          focus:ring-danger-500
          shadow-sm hover:shadow-md
        `,
        success: `
          bg-success-600 text-white 
          hover:bg-success-700 
          focus:ring-success-500
          shadow-sm hover:shadow-md
        `,
        warning: `
          bg-warning-500 text-white 
          hover:bg-warning-600 
          focus:ring-warning-500
          shadow-sm hover:shadow-md
        `,
        link: `
          text-primary-600 underline-offset-4 
          hover:underline hover:text-primary-700
          focus:ring-0 focus:ring-offset-0
          p-0 h-auto
        `,
        gradient: `
          bg-gradient-to-r from-primary-600 to-purple-600 
          text-white 
          hover:from-primary-700 hover:to-purple-700
          focus:ring-primary-500
          shadow-md hover:shadow-lg
        `,
      },
      size: {
        xs: 'h-7 px-2.5 text-xs rounded',
        sm: 'h-8 px-3 text-sm rounded-md',
        md: 'h-10 px-4 text-sm rounded-lg',
        lg: 'h-12 px-6 text-base rounded-lg',
        xl: 'h-14 px-8 text-lg rounded-xl',
        icon: 'h-10 w-10 rounded-lg',
        'icon-sm': 'h-8 w-8 rounded-md',
        'icon-lg': 'h-12 w-12 rounded-xl',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

const Button = forwardRef(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading = false,
      disabled = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          LeftIcon && <LeftIcon className="h-4 w-4" />
        )}
        {children}
        {!loading && RightIcon && <RightIcon className="h-4 w-4" />}
      </button>
    );
  }
);

Button.displayName = 'Button';

Button.propTypes = {
  variant: PropTypes.oneOf([
    'primary',
    'secondary',
    'outline',
    'ghost',
    'danger',
    'success',
    'warning',
    'link',
    'gradient',
  ]),
  size: PropTypes.oneOf([
    'xs',
    'sm',
    'md',
    'lg',
    'xl',
    'icon',
    'icon-sm',
    'icon-lg',
  ]),
  fullWidth: PropTypes.bool,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  leftIcon: PropTypes.elementType,
  rightIcon: PropTypes.elementType,
  className: PropTypes.string,
  children: PropTypes.node,
};

export { Button, buttonVariants };
export default Button;