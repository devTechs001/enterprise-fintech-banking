import { useState, useRef, useEffect, createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helpers';
import { useClickOutside } from '@/hooks/ui/useClickOutside';

const DropdownContext = createContext(null);

const Dropdown = ({ children, open: controlledOpen, onOpenChange, defaultOpen = false }) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [triggerRect, setTriggerRect] = useState(null);
  const triggerRef = useRef(null);
  const contentRef = useRef(null);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const toggle = () => setOpen(!open);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setTriggerRect(rect);
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      });
    }
  };

  useEffect(() => {
    if (open) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
    }

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  useClickOutside([triggerRef, contentRef], () => {
    if (open) setOpen(false);
  });

  return (
    <DropdownContext.Provider
      value={{
        open,
        setOpen,
        toggle,
        triggerRef,
        contentRef,
        position,
        triggerRect,
      }}
    >
      {children}
    </DropdownContext.Provider>
  );
};

Dropdown.propTypes = {
  children: PropTypes.node.isRequired,
  open: PropTypes.bool,
  onOpenChange: PropTypes.func,
  defaultOpen: PropTypes.bool,
};

const DropdownTrigger = ({ children, asChild = false, className, ...props }) => {
  const { toggle, open, triggerRef } = useContext(DropdownContext);

  if (asChild) {
    return (
      <span ref={triggerRef} onClick={toggle} className={cn('inline-block', className)} {...props}>
        {children}
      </span>
    );
  }

  return (
    <button
      ref={triggerRef}
      onClick={toggle}
      className={cn('inline-flex items-center', className)}
      aria-expanded={open}
      {...props}
    >
      {children}
    </button>
  );
};

DropdownTrigger.propTypes = {
  children: PropTypes.node.isRequired,
  asChild: PropTypes.bool,
  className: PropTypes.string,
};

const DropdownContent = ({
  children,
  align = 'start',
  sideOffset = 4,
  className,
  portal = false,
}) => {
  const { open, position, triggerRect, contentRef, setOpen } = useContext(DropdownContext);

  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  };

  const content = (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={contentRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: sideOffset, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className={cn(
            'absolute z-50 min-w-[200px] py-2',
            'bg-white dark:bg-gray-800 rounded-xl shadow-elevated',
            'border border-gray-200 dark:border-gray-700',
            'max-h-[var(--radix-dropdown-content-available-height)] overflow-y-auto',
            alignmentClasses[align],
            className
          )}
          style={{
            top: `calc(${position.top}px + ${sideOffset}px)`,
            left: align === 'center' && triggerRect
              ? `calc(${position.left}px + ${triggerRect.width / 2}px)`
              : position.left,
          }}
          role="menu"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (portal) {
    return createPortal(content, document.body);
  }

  return content;
};

DropdownContent.propTypes = {
  children: PropTypes.node.isRequired,
  align: PropTypes.oneOf(['start', 'center', 'end']),
  sideOffset: PropTypes.number,
  className: PropTypes.string,
  portal: PropTypes.bool,
};

const DropdownItem = ({ children, onClick, className, disabled = false, inset = false, ...props }) => {
  const { setOpen } = useContext(DropdownContext);

  const handleClick = (e) => {
    if (!disabled) {
      onClick?.(e);
      setOpen(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center gap-2 px-4 py-2 text-sm',
        'text-gray-700 dark:text-gray-200',
        'hover:bg-gray-100 dark:hover:bg-gray-700',
        'transition-colors duration-150 cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent',
        inset && 'pl-8',
        className
      )}
      role="menuitem"
      {...props}
    >
      {children}
    </button>
  );
};

DropdownItem.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  inset: PropTypes.bool,
};

const DropdownSeparator = ({ className }) => {
  return (
    <div
      className={cn('my-2 h-px bg-gray-200 dark:bg-gray-700', className)}
      role="separator"
    />
  );
};

DropdownSeparator.propTypes = {
  className: PropTypes.string,
};

const DropdownLabel = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

DropdownLabel.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

// Dropdown Menu Components (Alternative API)
const DropdownMenu = Dropdown;
const DropdownMenuTrigger = DropdownTrigger;
const DropdownMenuContent = DropdownContent;
const DropdownMenuItem = DropdownItem;
const DropdownMenuSeparator = DropdownSeparator;
const DropdownMenuLabel = DropdownLabel;

export {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
};
export default Dropdown;
