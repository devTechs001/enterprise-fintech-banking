import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { Button } from '../Button';

const Modal = forwardRef(
  (
    {
      className,
      children,
      isOpen,
      onClose,
      title,
      description,
      footer,
      closeOnOverlay = true,
      showCloseButton = true,
      size = 'md',
      ...props
    },
    ref
  ) => {
    if (!isOpen) return null;

    const sizeClasses = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
      full: 'max-w-[95vw]',
    };

    const handleOverlayClick = (e) => {
      if (closeOnOverlay && e.target === e.currentTarget) {
        onClose();
      }
    };

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div
          ref={ref}
          className={cn(
            'relative w-full mx-4 bg-white rounded-2xl shadow-2xl animate-scale-in dark:bg-gray-900',
            sizeClasses[size],
            className
          )}
          {...props}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                {title && (
                  <h2
                    id="modal-title"
                    className="text-xl font-semibold text-gray-900 dark:text-white"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {description}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="p-6">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-2xl">
              {footer}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';

Modal.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  footer: PropTypes.node,
  closeOnOverlay: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
};

export const ModalHeader = ({ className, children, ...props }) => (
  <div className={cn('p-6 border-b border-gray-200 dark:border-gray-700', className)} {...props}>
    {children}
  </div>
);

export const ModalBody = ({ className, children, ...props }) => (
  <div className={cn('p-6', className)} {...props}>
    {children}
  </div>
);

export const ModalFooter = ({ className, children, ...props }) => (
  <div className={cn('p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800', className)} {...props}>
    {children}
  </div>
);

ModalHeader.displayName = 'ModalHeader';
ModalBody.displayName = 'ModalBody';
ModalFooter.displayName = 'ModalFooter';

export { Modal };
export default Modal;
