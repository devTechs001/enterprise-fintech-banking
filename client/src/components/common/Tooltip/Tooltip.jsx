import { forwardRef, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/helpers';
import { useClickOutside } from '@/hooks/ui/useClickOutside';

const Tooltip = forwardRef(
  (
    {
      className,
      content,
      children,
      position = 'top',
      delay = 200,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(false);
    const [mounted, setMounted] = useState(false);
    const triggerRef = useRef(null);
    const tooltipRef = useRef(null);

    useEffect(() => {
      setMounted(true);
    }, []);

    const showTimeout = useRef(null);

    const handleMouseEnter = () => {
      if (disabled) return;
      showTimeout.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    };

    const handleMouseLeave = () => {
      if (showTimeout.current) {
        clearTimeout(showTimeout.current);
      }
      setIsVisible(false);
    };

    useClickOutside(tooltipRef, () => setIsVisible(false));

    const positionClasses = {
      top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
      bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
      left: 'right-full top-1/2 -translate-y-1/2 mr-2',
      right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    const arrowClasses = {
      top: 'absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900',
      bottom: 'absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-gray-900',
      left: 'absolute left-full top-1/2 -translate-y-1/2 border-8 border-transparent border-l-gray-900',
      right: 'absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-gray-900',
    };

    const tooltip = (
      <div
        ref={tooltipRef}
        className={cn(
          'relative z-50 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap animate-fade-in',
          positionClasses[position],
          className
        )}
        role="tooltip"
        {...props}
      >
        {content}
        <div className={arrowClasses[position]} />
      </div>
    );

    return (
      <>
        <span
          ref={triggerRef}
          className="inline-block"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onFocus={handleMouseEnter}
          onBlur={handleMouseLeave}
        >
          {children}
        </span>
        {mounted && isVisible && createPortal(tooltip, document.body)}
      </>
    );
  }
);

Tooltip.displayName = 'Tooltip';

Tooltip.propTypes = {
  className: PropTypes.string,
  content: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  delay: PropTypes.number,
  disabled: PropTypes.bool,
};

export { Tooltip };
export default Tooltip;
