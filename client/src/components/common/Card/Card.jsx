import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';

const Card = forwardRef(({ className, variant = 'default', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-xl border bg-white text-gray-950 shadow-sm',
      'dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50',
      variant === 'elevated' && 'shadow-card hover:shadow-card-hover transition-shadow',
      variant === 'outlined' && 'border-2 shadow-none',
      variant === 'filled' && 'bg-gray-100 dark:bg-gray-800 border-0',
      className
    )}
    {...props}
  />
));

Card.displayName = 'Card';

const CardHeader = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));

CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-semibold text-lg leading-none tracking-tight', className)}
    {...props}
  >
    {children}
  </h3>
));

CardTitle.displayName = 'CardTitle';

const CardSubtitle = forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-gray-500 dark:text-gray-400', className)}
    {...props}
  />
));

CardSubtitle.displayName = 'CardSubtitle';

const CardDescription = forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-gray-500 dark:text-gray-400', className)}
    {...props}
  />
));

CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));

CardContent.displayName = 'CardContent';

const CardFooter = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));

CardFooter.displayName = 'CardFooter';

const CardImage = forwardRef(({ className, src, alt, ...props }, ref) => (
  <img
    ref={ref}
    src={src}
    alt={alt}
    className={cn('w-full h-48 object-cover rounded-t-xl', className)}
    {...props}
  />
));

CardImage.displayName = 'CardImage';

Card.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'elevated', 'outlined', 'filled']),
};

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardSubtitle,
  CardDescription,
  CardContent,
  CardImage,
};

export default Card;
