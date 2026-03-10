import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';

const BudgetTracker = ({ budget, spent, className }) => {
  const percentage = Math.min(100, (spent / budget) * 100);

  return (
    <div className={cn('p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg', className)}>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">Monthly Budget</span>
        <span className="text-sm text-gray-500">${spent} / ${budget}</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

BudgetTracker.propTypes = {
  budget: PropTypes.number.isRequired,
  spent: PropTypes.number.isRequired,
  className: PropTypes.string,
};

export { BudgetTracker };
export default BudgetTracker;
