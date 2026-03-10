import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';
import { TrendingUp } from 'lucide-react';

const CreditScore = ({ score, className }) => {
  const getScoreColor = (s) => {
    if (s >= 750) return 'text-green-500';
    if (s >= 700) return 'text-blue-500';
    if (s >= 650) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (s) => {
    if (s >= 750) return 'Excellent';
    if (s >= 700) return 'Good';
    if (s >= 650) return 'Fair';
    return 'Poor';
  };

  return (
    <div className={cn('p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Credit Score</p>
          <p className={cn('text-2xl font-bold', getScoreColor(score))}>{score}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{getScoreLabel(score)}</p>
        </div>
        <div className={cn('p-3 rounded-full bg-gray-200 dark:bg-gray-700', getScoreColor(score))}>
          <TrendingUp className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

CreditScore.propTypes = {
  score: PropTypes.number.isRequired,
  className: PropTypes.string,
};

export { CreditScore };
export default CreditScore;
