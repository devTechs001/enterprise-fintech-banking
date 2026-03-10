import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';
import { Target } from 'lucide-react';

const SavingsGoal = ({ goal, current, target, deadline, className }) => {
  const percentage = Math.min(100, (current / target) * 100);

  return (
    <div className={cn('p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg', className)}>
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-5 h-5 text-green-600" />
        <span className="font-medium text-gray-900 dark:text-white">{goal}</span>
      </div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-600 dark:text-gray-400">${current.toLocaleString()}</span>
        <span className="text-gray-600 dark:text-gray-400">${target.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-green-500 rounded-full transition-all duration-300" style={{ width: `${percentage}%` }} />
      </div>
      {deadline && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Target: {deadline}</p>
      )}
    </div>
  );
};

SavingsGoal.propTypes = {
  goal: PropTypes.string.isRequired,
  current: PropTypes.number.isRequired,
  target: PropTypes.number.isRequired,
  deadline: PropTypes.string,
  className: PropTypes.string,
};

export { SavingsGoal };
export default SavingsGoal;
