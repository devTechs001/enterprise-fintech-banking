import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';

const Footer = ({ className }) => {
  return (
    <footer
      className={cn(
        'border-t border-gray-200 dark:border-gray-800',
        'bg-white dark:bg-gray-900',
        'px-6 py-4',
        className
      )}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} SecureBank. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <a
            href="/privacy"
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Terms of Service
          </a>
          <a
            href="/security"
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Security
          </a>
        </div>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  className: PropTypes.string,
};

export { Footer };
export default Footer;
