import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/utils/helpers';

const Breadcrumb = forwardRef(
  (
    {
      className,
      items = [],
      separator = <ChevronRight className="h-4 w-4 text-gray-400" />,
      maxItems,
      ...props
    },
    ref
  ) => {
    const displayItems = maxItems && items.length > maxItems
      ? [items[0], { label: '...', href: null }, ...items.slice(-maxItems + 1)]
      : items;

    return (
      <nav ref={ref} className={cn('flex items-center space-x-2 text-sm', className)} {...props}>
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isEllipsis = item.label === '...';

          return (
            <div key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2">{separator}</span>
              )}
              {isLast ? (
                <span className="font-medium text-gray-900 dark:text-white">
                  {item.label}
                </span>
              ) : isEllipsis ? (
                <span className="text-gray-400">...</span>
              ) : item.href ? (
                <Link
                  to={item.href}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-600 dark:text-gray-400">
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </nav>
    );
  }
);

Breadcrumb.displayName = 'Breadcrumb';

Breadcrumb.Item = forwardRef(({ className, href, children, ...props }, ref) => (
  <Link
    ref={ref}
    to={href}
    className={cn('text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white', className)}
    {...props}
  >
    {children}
  </Link>
));

Breadcrumb.Item.displayName = 'Breadcrumb.Item';

Breadcrumb.Separator = forwardRef(({ className, children = <ChevronRight className="h-4 w-4" />, ...props }, ref) => (
  <span ref={ref} className="mx-2 text-gray-400" {...props}>
    {children}
  </span>
));

Breadcrumb.Separator.displayName = 'Breadcrumb.Separator';

Breadcrumb.propTypes = {
  className: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    href: PropTypes.string,
  })),
  separator: PropTypes.node,
  maxItems: PropTypes.number,
};

export { Breadcrumb };
export default Breadcrumb;
