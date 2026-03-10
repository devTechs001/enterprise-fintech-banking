import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helpers';
import { useClickOutside } from '@/hooks/ui/useClickOutside';

const Popover = ({
  children,
  trigger,
  content,
  open: controlledOpen,
  onOpenChange,
  position = 'bottom',
  align = 'center',
  offset = 8,
  className,
  contentClassName,
  portal = true,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const triggerRef = useRef(null);
  const contentRef = useRef(null);
  const [positionStyle, setPositionStyle] = useState({});

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  useClickOutside([triggerRef, contentRef], () => {
    if (open) setOpen(false);
  });

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current?.getBoundingClientRect() || { width: 0, height: 0 };

      let top = 0;
      let left = 0;

      if (position === 'bottom') {
        top = rect.bottom + window.scrollY + offset;
        left = rect.left + window.scrollX;

        if (align === 'center') {
          left += (rect.width - contentRect.width) / 2;
        } else if (align === 'end') {
          left += rect.width - contentRect.width;
        }
      } else if (position === 'top') {
        top = rect.top + window.scrollY - contentRect.height - offset;
        left = rect.left + window.scrollX;

        if (align === 'center') {
          left += (rect.width - contentRect.width) / 2;
        } else if (align === 'end') {
          left += rect.width - contentRect.width;
        }
      } else if (position === 'right') {
        top = rect.top + window.scrollY;
        left = rect.right + window.scrollX + offset;

        if (align === 'center') {
          top += (rect.height - contentRect.height) / 2;
        } else if (align === 'end') {
          top += rect.height - contentRect.height;
        }
      } else if (position === 'left') {
        top = rect.top + window.scrollY;
        left = rect.left + window.scrollX - contentRect.width - offset;

        if (align === 'center') {
          top += (rect.height - contentRect.height) / 2;
        } else if (align === 'end') {
          top += rect.height - contentRect.height;
        }
      }

      setPositionStyle({ top, left });
    }
  }, [open, position, align, offset]);

  const popoverContent = (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={contentRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className={cn(
            'absolute z-50 min-w-[200px] p-4',
            'bg-white dark:bg-gray-800 rounded-xl shadow-elevated',
            'border border-gray-200 dark:border-gray-700',
            contentClassName
          )}
          style={positionStyle}
        >
          {typeof content === 'function' ? content({ setOpen }) : content}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <span ref={triggerRef} onClick={() => setOpen(!open)}>
        {trigger}
      </span>
      {portal ? createPortal(popoverContent, document.body) : popoverContent}
    </>
  );
};

Popover.propTypes = {
  children: PropTypes.node,
  trigger: PropTypes.node.isRequired,
  content: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  open: PropTypes.bool,
  onOpenChange: PropTypes.func,
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  align: PropTypes.oneOf(['start', 'center', 'end']),
  offset: PropTypes.number,
  className: PropTypes.string,
  contentClassName: PropTypes.string,
  portal: PropTypes.bool,
};

export { Popover };
export default Popover;
