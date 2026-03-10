import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ children, separator = '/', className, ...props }) => {
  return (
    <nav
      className={cn('flex items-center gap-1 text-sm', className)}
      aria-label="Breadcrumb"
      {...props}
    >
      {children}
    </nav>
  );
};

Breadcrumb.propTypes = {
  children: PropTypes.node.isRequired,
  separator: PropTypes.node,
  className: PropTypes.string,
};

const BreadcrumbItem = ({ children, className, ...props }) => {
  return (
    <span className={cn('flex items-center', className)} {...props}>
      {children}
    </span>
  );
};

BreadcrumbItem.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

const BreadcrumbLink = ({ children, href, to, className, isCurrent = false, ...props }) => {
  if (isCurrent) {
    return (
      <span
        className={cn(
          'font-medium text-gray-900 dark:text-white',
          'cursor-default',
          className
        )}
        aria-current="page"
        {...props}
      >
        {children}
      </span>
    );
  }

  if (to) {
    return (
      <Link
        to={to}
        className={cn(
          'text-gray-500 dark:text-gray-400',
          'hover:text-gray-700 dark:hover:text-gray-200',
          'transition-colors',
          className
        )}
        {...props}
      >
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={cn(
        'text-gray-500 dark:text-gray-400',
        'hover:text-gray-700 dark:hover:text-gray-200',
        'transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
};

BreadcrumbLink.propTypes = {
  children: PropTypes.node.isRequired,
  href: PropTypes.string,
  to: PropTypes.string,
  className: PropTypes.string,
  isCurrent: PropTypes.bool,
};

const BreadcrumbSeparator = ({ children, className, ...props }) => {
  return (
    <span
      className={cn('mx-1 text-gray-400 dark:text-gray-500', className)}
      aria-hidden="true"
      {...props}
    >
      {children || <ChevronRight className="w-4 h-4" />}
    </span>
  );
};

BreadcrumbSeparator.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

const BreadcrumbEllipsis = ({ className, ...props }) => {
  return (
    <span
      className={cn('px-2 text-gray-400', className)}
      aria-hidden="true"
      {...props}
    >
      ...
    </span>
  );
};

BreadcrumbEllipsis.propTypes = {
  className: PropTypes.string,
};

export {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
export default Breadcrumb;
