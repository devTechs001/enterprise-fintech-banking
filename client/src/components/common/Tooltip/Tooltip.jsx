import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';

const Tooltip = ({
  children,
  content,
  position = 'top',
  delay = 200,
  className,
  contentClassName,
  disabled = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);

  const showTooltip = () => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    'top-start': 'bottom-full left-0 mb-2',
    'top-end': 'bottom-full right-0 mb-2',
    'bottom-start': 'top-full left-0 mt-2',
    'bottom-end': 'top-full right-0 mt-2',
  };

  if (disabled) {
    return children;
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            'absolute z-50 px-2 py-1',
            'bg-gray-900 dark:bg-gray-700 text-white',
            'text-xs font-medium rounded-md whitespace-nowrap',
            'shadow-lg animate-fade-in',
            positionClasses[position],
            contentClassName
          )}
          role="tooltip"
        >
          {content}
          {/* Arrow */}
          <div
            className={cn(
              'absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45',
              position === 'top' && 'left-1/2 -translate-x-1/2 -bottom-1',
              position === 'bottom' && 'left-1/2 -translate-x-1/2 -top-1',
              position === 'left' && 'top-1/2 -translate-y-1/2 -right-1',
              position === 'right' && 'top-1/2 -translate-y-1/2 -left-1'
            )}
          />
        </div>
      )}
    </div>
  );
};

Tooltip.propTypes = {
  children: PropTypes.node.isRequired,
  content: PropTypes.node.isRequired,
  position: PropTypes.oneOf([
    'top',
    'bottom',
    'left',
    'right',
    'top-start',
    'top-end',
    'bottom-start',
    'bottom-end',
  ]),
  delay: PropTypes.number,
  className: PropTypes.string,
  contentClassName: PropTypes.string,
  disabled: PropTypes.bool,
};

export { Tooltip };
export default Tooltip;
