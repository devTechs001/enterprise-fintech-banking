import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';

const Avatar = ({ src, alt, fallback, size = 'md', className, ...props }) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const names = name.trim().split(' ');
    const initials = names.length > 1
      ? `${names[0][0]}${names[names.length - 1][0]}`
      : names[0][0];
    return initials.toUpperCase();
  };

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full overflow-hidden',
        'bg-gray-200 dark:bg-gray-700',
        'flex-shrink-0',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt || 'Avatar'}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <span
        className={cn(
          'w-full h-full flex items-center justify-center font-medium',
          'text-gray-600 dark:text-gray-300',
          src && 'hidden'
        )}
      >
        {fallback || getInitials(alt)}
      </span>
    </div>
  );
};

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  fallback: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl']),
  className: PropTypes.string,
};

const AvatarGroup = ({ children, max = 4, size = 'md', className }) => {
  const validChildren = [];
  
  // Collect valid children
  children.forEach((child) => {
    if (child && child.type === Avatar) {
      validChildren.push(child);
    }
  });

  const displayChildren = validChildren.slice(0, max);
  const remainingCount = validChildren.length - max;

  return (
    <div className={cn('flex -space-x-2', className)}>
      {displayChildren.map((child, index) => (
        <div key={index} className="ring-2 ring-white dark:ring-gray-800 rounded-full">
          {child}
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600',
            'ring-2 ring-white dark:ring-gray-800',
            size === 'xs' && 'w-6 h-6 text-xs',
            size === 'sm' && 'w-8 h-8 text-sm',
            size === 'md' && 'w-10 h-10 text-sm',
            size === 'lg' && 'w-12 h-12 text-base',
            size === 'xl' && 'w-16 h-16 text-lg',
            size === '2xl' && 'w-20 h-20 text-xl',
          )}
        >
          <span className="font-medium text-gray-600 dark:text-gray-300">
            +{remainingCount}
          </span>
        </div>
      )}
    </div>
  );
};

AvatarGroup.propTypes = {
  children: PropTypes.node.isRequired,
  max: PropTypes.number,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl']),
  className: PropTypes.string,
};

export { Avatar, AvatarGroup };
export default Avatar;
