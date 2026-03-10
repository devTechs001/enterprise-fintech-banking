import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';
import { formatCurrency } from '@/utils/formatters';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const BalanceDisplay = ({ balance, currency = 'USD', label = 'Available Balance', showToggle = true, className }) => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className={cn('inline-block', className)}>
      {label && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      )}
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {isVisible ? formatCurrency(balance, currency) : '••••••'}
        </span>
        {showToggle && (
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
};

BalanceDisplay.propTypes = {
  balance: PropTypes.number.isRequired,
  currency: PropTypes.string,
  label: PropTypes.string,
  showToggle: PropTypes.bool,
  className: PropTypes.string,
};

export { BalanceDisplay };
export default BalanceDisplay;
