import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';
import { Check } from 'lucide-react';

const Stepper = ({ steps, currentStep, onStepClick, className, orientation = 'horizontal' }) => {
  return (
    <div
      className={cn(
        'flex',
        orientation === 'vertical' ? 'flex-col' : 'flex-row',
        className
      )}
    >
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isUpcoming = index > currentStep;

        return (
          <div
            key={step.id || index}
            className={cn(
              'flex items-center',
              orientation === 'vertical' ? 'flex-row' : 'flex-row',
              index !== steps.length - 1 && orientation === 'horizontal' && 'flex-1'
            )}
          >
            {/* Step indicator */}
            <div
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-200',
                isCompleted && 'bg-primary-600 text-white',
                isCurrent && 'bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-900/50',
                isUpcoming && 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              )}
            >
              {isCompleted ? (
                <Check className="w-5 h-5" />
              ) : (
                index + 1
              )}
            </div>

            {/* Step label */}
            <div className={cn('ml-3', orientation === 'vertical' && 'flex-1')}>
              <p
                className={cn(
                  'text-sm font-medium',
                  (isCompleted || isCurrent)
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              >
                {step.title}
              </p>
              {step.description && (
                <p
                  className={cn(
                    'text-xs mt-0.5',
                    (isCompleted || isCurrent)
                      ? 'text-gray-600 dark:text-gray-400'
                      : 'text-gray-400 dark:text-gray-500'
                  )}
                >
                  {step.description}
                </p>
              )}
            </div>

            {/* Connector line */}
            {index !== steps.length - 1 && orientation === 'horizontal' && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-4',
                  isCompleted ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              />
            )}

            {index !== steps.length - 1 && orientation === 'vertical' && (
              <div
                className={cn(
                  'w-0.5 h-8 ml-4',
                  isCompleted ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

Stepper.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.node.isRequired,
      description: PropTypes.node,
    })
  ).isRequired,
  currentStep: PropTypes.number.isRequired,
  onStepClick: PropTypes.func,
  className: PropTypes.string,
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
};

export { Stepper };
export default Stepper;
