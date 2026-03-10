import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { Button } from '@/components/common/Button';

const ModalHeader = ({
  title,
  subtitle,
  onClose,
  showCloseButton = true,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex items-start justify-between px-6 py-4',
        'border-b border-gray-200 dark:border-gray-700',
        className
      )}
    >
      <div className="flex-1">
        {title && (
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>

      {showCloseButton && onClose && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 -mr-2 -mt-2"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

ModalHeader.propTypes = {
  title: PropTypes.node,
  subtitle: PropTypes.node,
  onClose: PropTypes.func,
  showCloseButton: PropTypes.bool,
  className: PropTypes.string,
};

export { ModalHeader };
export default ModalHeader;
