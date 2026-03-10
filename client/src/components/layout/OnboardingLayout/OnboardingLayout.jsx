import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';
import { HeaderLogo } from '../MainLayout/Header/HeaderLogo';

const OnboardingLayout = ({ children, className, step, totalSteps }) => {
  const progress = ((step || 1) / (totalSteps || 1)) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <HeaderLogo />
        </div>
      </header>

      {/* Progress Bar */}
      {totalSteps && (
        <div className="bg-gray-200 dark:bg-gray-800 h-1">
          <div
            className="bg-primary-600 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Content */}
      <main className={cn('max-w-3xl mx-auto px-6 py-12', className)}>
        {children}
      </main>
    </div>
  );
};

OnboardingLayout.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  step: PropTypes.number,
  totalSteps: PropTypes.number,
};

export { OnboardingLayout };
export default OnboardingLayout;
