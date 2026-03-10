import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';

const Skeleton = ({ className, variant = 'text', ...props }) => {
  const variantClasses = {
    text: 'h-4 w-full',
    title: 'h-6 w-2/3',
    subtitle: 'h-4 w-1/2',
    circle: 'rounded-full',
    rect: 'rounded-lg',
    card: 'rounded-xl h-48',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 dark:bg-gray-700 rounded',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
};

Skeleton.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['text', 'title', 'subtitle', 'circle', 'rect', 'card']),
};

export { Skeleton };
export default Skeleton;
