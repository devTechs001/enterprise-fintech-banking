import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helpers';
import { X } from 'lucide-react';
import { Button } from '@/components/common/Button';

const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  position = 'right',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  className,
  overlayClassName,
}) => {
  const drawerRef = useRef(null);

  // Handle ESC key
  useEffect(() => {
    if (!closeOnEsc || !isOpen) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [closeOnEsc, isOpen, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'w-80 max-w-sm',
    md: 'w-96 max-w-md',
    lg: 'w-[32rem] max-w-lg',
    xl: 'w-[40rem] max-w-xl',
    full: 'w-full',
  };

  const positionClasses = {
    left: 'left-0 top-0 h-full border-r',
    right: 'right-0 top-0 h-full border-l',
    bottom: 'bottom-0 left-0 w-full border-t',
  };

  const slideVariants = {
    hidden: {
      x: position === 'left' ? '-100%' : position === 'right' ? '100%' : 0,
      y: position === 'bottom' ? '100%' : 0,
    },
    visible: { x: 0, y: 0 },
    exit: {
      x: position === 'left' ? '-100%' : position === 'right' ? '100%' : 0,
      y: position === 'bottom' ? '100%' : 0,
    },
  };

  const drawerContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'fixed inset-0 bg-black/50 backdrop-blur-sm z-50',
              overlayClassName
            )}
            onClick={closeOnOverlayClick ? onClose : undefined}
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            variants={slideVariants}
            className={cn(
              'fixed z-50 bg-white dark:bg-gray-900 shadow-elevated',
              positionClasses[position],
              sizeClasses[size],
              'flex flex-col',
              className
            )}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div
                className={cn(
                  'flex items-center justify-between px-6 py-4',
                  'border-b border-gray-200 dark:border-gray-700'
                )}
              >
                {title && (
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {title}
                  </h2>
                )}

                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

            {/* Footer */}
            {footer && (
              <div
                className={cn(
                  'flex items-center justify-end gap-3 px-6 py-4',
                  'border-t border-gray-200 dark:border-gray-700'
                )}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(drawerContent, document.body);
};

Drawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  position: PropTypes.oneOf(['left', 'right', 'bottom']),
  closeOnOverlayClick: PropTypes.bool,
  closeOnEsc: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  className: PropTypes.string,
  overlayClassName: PropTypes.string,
};

export { Drawer };
export default Drawer;
