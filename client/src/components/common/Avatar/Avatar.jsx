import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';

const Avatar = forwardRef(
  (
    {
      className,
      src,
      alt,
      name,
      size = 'md',
      variant = 'image',
      status,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      xs: 'h-6 w-6 text-xs',
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base',
      xl: 'h-16 w-16 text-lg',
      '2xl': 'h-20 w-20 text-xl',
    };

    const statusClasses = {
      online: 'bg-success-500',
      offline: 'bg-gray-400',
      busy: 'bg-danger-500',
      away: 'bg-warning-500',
    };

    const statusPositionClasses = {
      xs: 'h-1.5 w-1.5 bottom-0 right-0',
      sm: 'h-2 w-2 bottom-0 right-0',
      md: 'h-2.5 w-2.5 bottom-0 right-0',
      lg: 'h-3 w-3 bottom-0 right-0',
      xl: 'h-4 w-4 bottom-0 right-0',
      '2xl': 'h-5 w-5 bottom-0 right-0',
    };

    const getInitials = (name) => {
      if (!name) return '';
      const names = name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {variant === 'image' && src ? (
          <img
            src={src}
            alt={alt || name}
            className="h-full w-full object-cover rounded-full"
          />
        ) : (
          <span className="font-medium text-primary-700 dark:text-primary-300">
            {getInitials(name)}
          </span>
        )}
        {status && (
          <span
            className={cn(
              'absolute rounded-full border-2 border-white dark:border-gray-900',
              statusClasses[status],
              statusPositionClasses[size]
            )}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

Avatar.propTypes = {
  className: PropTypes.string,
  src: PropTypes.string,
  alt: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl']),
  variant: PropTypes.oneOf(['image', 'initials']),
  status: PropTypes.oneOf(['online', 'offline', 'busy', 'away']),
};

const AvatarGroup = forwardRef(
  ({ className, avatars, max = 4, size = 'md' }, ref) => {
    const displayedAvatars = avatars.slice(0, max);
    const remaining = avatars.length - max;

    return (
      <div ref={ref} className={cn('flex items-center', className)}>
        {displayedAvatars.map((avatar, index) => (
          <Avatar
            key={avatar.id || index}
            {...avatar}
            size={size}
            className={cn(
              'border-2 border-white dark:border-gray-900',
              index > 0 && '-ml-2'
            )}
          />
        ))}
        {remaining > 0 && (
          <div
            className={cn(
              '-ml-2 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700',
              size === 'xs' && 'h-6 w-6 text-xs',
              size === 'sm' && 'h-8 w-8 text-xs',
              size === 'md' && 'h-10 w-10 text-sm',
              size === 'lg' && 'h-12 w-12 text-base',
              size === 'xl' && 'h-16 w-16 text-lg',
              size === '2xl' && 'h-20 w-20 text-xl'
            )}
          >
            +{remaining}
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';

AvatarGroup.propTypes = {
  className: PropTypes.string,
  avatars: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    src: PropTypes.string,
    alt: PropTypes.string,
    name: PropTypes.string,
    status: PropTypes.oneOf(['online', 'offline', 'busy', 'away']),
  })).isRequired,
  max: PropTypes.number,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl']),
};

export { Avatar, AvatarGroup };
export default Avatar;
