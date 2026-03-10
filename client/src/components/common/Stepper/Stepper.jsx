import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';

const Stepper = forwardRef(
  (
    {
      className,
      steps = [],
      currentStep,
      onStepChange,
      orientation = 'horizontal',
      ...props
    },
    ref
  ) => {
    return (
      <nav
        ref={ref}
        className={cn(
          orientation === 'horizontal' ? 'flex items-center' : 'flex-col',
          className
        )}
        {...props}
      >
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = step.onClick || onStepChange;

          return (
            <Step
              key={step.id || index}
              number={index + 1}
              title={step.title}
              description={step.description}
              isCompleted={isCompleted}
              isCurrent={isCurrent}
              isClickable={!!isClickable}
              onClick={() => isClickable && (step.onClick?.() || onStepChange?.(index))}
              last={index === steps.length - 1}
              orientation={orientation}
            />
          );
        })}
      </nav>
    );
  }
);

Stepper.displayName = 'Stepper';

const Step = forwardRef(
  (
    {
      number,
      title,
      description,
      isCompleted,
      isCurrent,
      isClickable,
      onClick,
      last,
      orientation,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          orientation === 'vertical' ? 'flex-col items-start' : '',
          isClickable && 'cursor-pointer'
        )}
        onClick={onClick}
      >
        {/* Step Circle */}
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-colors',
            isCompleted
              ? 'border-primary-600 bg-primary-600 text-white'
              : isCurrent
              ? 'border-primary-600 text-primary-600'
              : 'border-gray-300 text-gray-400 dark:border-gray-600'
          )}
        >
          {isCompleted ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            number
          )}
        </div>

        {/* Step Content */}
        <div className={cn('ml-3', orientation === 'vertical' && 'mt-2 ml-0')}>
          <p
            className={cn(
              'text-sm font-medium',
              isCurrent ? 'text-primary-600' : 'text-gray-900 dark:text-white',
              isCompleted && 'text-gray-500'
            )}
          >
            {title}
          </p>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>

        {/* Connector Line */}
        {!last && (
          <div
            className={cn(
              'bg-gray-300 dark:bg-gray-600',
              orientation === 'horizontal'
                ? 'mx-4 h-0.5 w-16 flex-1'
                : 'ml-5 my-2 h-16 w-0.5'
            )}
          />
        )}
      </div>
    );
  }
);

Step.displayName = 'Step';

Stepper.propTypes = {
  className: PropTypes.string,
  steps: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    onClick: PropTypes.func,
  })).isRequired,
  currentStep: PropTypes.number.isRequired,
  onStepChange: PropTypes.func,
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
};

export { Stepper, Step };
export default Stepper;
