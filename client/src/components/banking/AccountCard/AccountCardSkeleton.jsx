import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';

const AccountCardSkeleton = ({ className }) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-6',
        'bg-gray-200 dark:bg-gray-800',
        'animate-pulse min-h-[200px]',
        className
      )}
    >
      {/* Header Skeleton */}
      <div className="flex items-start justify-between mb-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700" />
          <div className="space-y-2">
            <div className="w-32 h-4 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="w-20 h-3 bg-gray-300 dark:bg-gray-700 rounded" />
          </div>
        </div>
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded" />
      </div>

      {/* Balance Skeleton */}
      <div className="my-6 space-y-2">
        <div className="w-28 h-3 bg-gray-300 dark:bg-gray-700 rounded" />
        <div className="w-40 h-8 bg-gray-300 dark:bg-gray-700 rounded" />
      </div>

      {/* Footer Skeleton */}
      <div className="flex items-center justify-between mt-auto">
        <div className="space-y-2">
          <div className="w-24 h-2 bg-gray-300 dark:bg-gray-700 rounded" />
          <div className="w-32 h-4 bg-gray-300 dark:bg-gray-700 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="w-20 h-8 bg-gray-300 dark:bg-gray-700 rounded" />
          <div className="w-20 h-8 bg-gray-300 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
};

AccountCardSkeleton.propTypes = {
  className: PropTypes.string,
};

export { AccountCardSkeleton };
export default AccountCardSkeleton;
