import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';
import { ArrowUpRight, ArrowDownLeft, CreditCard, Users } from 'lucide-react';
import { Button } from '@/components/common/Button';

const QuickActions = ({ onAction, className }) => {
  const actions = [
    { icon: ArrowUpRight, label: 'Send', action: 'send' },
    { icon: ArrowDownLeft, label: 'Request', action: 'request' },
    { icon: CreditCard, label: 'Pay Bills', action: 'payBills' },
    { icon: Users, label: 'Transfer', action: 'transfer' },
  ];

  return (
    <div className={cn('grid grid-cols-4 gap-4', className)}>
      {actions.map((item) => (
        <button
          key={item.action}
          onClick={() => onAction?.(item.action)}
          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-500 transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <item.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
};

QuickActions.propTypes = {
  onAction: PropTypes.func,
  className: PropTypes.string,
};

export { QuickActions };
export default QuickActions;
