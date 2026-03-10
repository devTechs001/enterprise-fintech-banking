import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';

const Card = ({ children, className, variant = 'default', ...props }) => {
  const variantClasses = {
    default:
      'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm',
    elevated: 'bg-white dark:bg-gray-800 shadow-card',
    outlined:
      'bg-transparent border-2 border-gray-200 dark:border-gray-700 shadow-none',
    filled: 'bg-gray-50 dark:bg-gray-900 border-none',
    glass:
      'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50',
  };

  return (
    <div
      className={cn(
        'rounded-xl transition-all duration-200',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'elevated', 'outlined', 'filled', 'glass']),
};

const CardHeader = ({ children, className, ...props }) => {
  return (
    <div
      className={cn('px-6 py-4 border-b border-gray-200 dark:border-gray-700', className)}
      {...props}
    >
      {children}
    </div>
  );
};

CardHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

const CardTitle = ({ children, className, as: Component = 'h3', ...props }) => {
  return (
    <Component
      className={cn('text-lg font-semibold text-gray-900 dark:text-white', className)}
      {...props}
    >
      {children}
    </Component>
  );
};

CardTitle.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  as: PropTypes.elementType,
};

const CardDescription = ({ children, className, ...props }) => {
  return (
    <p
      className={cn('text-sm text-gray-500 dark:text-gray-400 mt-1', className)}
      {...props}
    >
      {children}
    </p>
  );
};

CardDescription.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

const CardContent = ({ children, className, ...props }) => {
  return (
    <div className={cn('px-6 py-4', className)} {...props}>
      {children}
    </div>
  );
};

CardContent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

const CardFooter = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'px-6 py-4 border-t border-gray-200 dark:border-gray-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

CardFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
export default Card;
