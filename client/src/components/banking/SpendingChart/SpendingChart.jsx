import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';

const SpendingChart = ({ period = 'month', data, className }) => {
  // Placeholder chart component
  return (
    <div className={cn('h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg', className)}>
      <div className="text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-2">Spending Chart</p>
        <p className="text-sm text-gray-400 dark:text-gray-500">Period: {period}</p>
      </div>
    </div>
  );
};

SpendingChart.propTypes = {
  period: PropTypes.string,
  data: PropTypes.array,
  className: PropTypes.string,
};

export { SpendingChart };
export default SpendingChart;
