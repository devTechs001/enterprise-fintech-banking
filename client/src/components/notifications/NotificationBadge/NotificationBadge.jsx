import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';

/** Unread counter. Hidden from assistive tech when zero to avoid noise. */
const NotificationBadge = ({ count = 0, max = 99, className }) => {
  if (!count) return null;
  return (
    <span
      aria-label={`${count} unread notification${count === 1 ? '' : 's'}`}
      className={cn(
        'inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-danger-500 px-1.5',
        'text-[11px] font-bold leading-none text-white tabular-nums',
        className
      )}
    >
      {count > max ? `${max}+` : count}
    </span>
  );
};

NotificationBadge.propTypes = { count: PropTypes.number, max: PropTypes.number, className: PropTypes.string };

export { NotificationBadge };
export default NotificationBadge;
