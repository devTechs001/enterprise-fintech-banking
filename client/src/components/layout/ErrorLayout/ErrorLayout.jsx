import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';
import { Button } from '@/components/common/Button';
import { Link } from 'react-router-dom';

const ErrorLayout = ({
  children,
  errorCode = '404',
  title = 'Page Not Found',
  description = "Sorry, we couldn't find the page you're looking for.",
  showHomeButton = true,
  className,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className={cn('text-center max-w-md', className)}>
        {/* Error Code */}
        <div className="mb-8">
          <span className="text-9xl font-bold text-primary-600 dark:text-primary-400">
            {errorCode}
          </span>
        </div>

        {/* Title & Description */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">{description}</p>

        {/* Children (additional content) */}
        {children}

        {/* Home Button */}
        {showHomeButton && (
          <Link to="/">
            <Button size="lg">Go Back Home</Button>
          </Link>
        )}
      </div>
    </div>
  );
};

ErrorLayout.propTypes = {
  children: PropTypes.node,
  errorCode: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  showHomeButton: PropTypes.bool,
  className: PropTypes.string,
};

export { ErrorLayout };
export default ErrorLayout;
