import { useState } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';
import { ChevronDown } from 'lucide-react';

const Accordion = ({ children, className, allowMultiple = false }) => {
  const [openItems, setOpenItems] = useState([]);

  const toggleItem = (itemId) => {
    if (allowMultiple) {
      setOpenItems((prev) =>
        prev.includes(itemId)
          ? prev.filter((id) => id !== itemId)
          : [...prev, itemId]
      );
    } else {
      setOpenItems((prev) => (prev.includes(itemId) ? [] : [itemId]));
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {children.map((child) =>
        child.type === AccordionItem
          ? {
              ...child,
              props: {
                ...child.props,
                isOpen: openItems.includes(child.props.itemId),
                onToggle: () => toggleItem(child.props.itemId),
              },
            }
          : child
      )}
    </div>
  );
};

Accordion.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  allowMultiple: PropTypes.bool,
};

const AccordionItem = ({ itemId, title, children, isOpen, onToggle, className }) => {
  return (
    <div className={cn('border-b border-gray-200 dark:border-gray-700 last:border-0', className)}>
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center justify-between py-4 px-2',
          'text-left hover:bg-gray-50 dark:hover:bg-gray-800/50',
          'transition-colors duration-200'
        )}
        aria-expanded={isOpen}
      >
        <span className="font-medium text-gray-900 dark:text-white">{title}</span>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-gray-500 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="pb-4 px-2 animate-fade-in">{children}</div>
      )}
    </div>
  );
};

AccordionItem.propTypes = {
  itemId: PropTypes.string.isRequired,
  title: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  isOpen: PropTypes.bool,
  onToggle: PropTypes.func,
  className: PropTypes.string,
};

const AccordionContent = ({ children, className }) => {
  return (
    <div className={cn('text-gray-600 dark:text-gray-400', className)}>
      {children}
    </div>
  );
};

AccordionContent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export { Accordion, AccordionItem, AccordionContent };
export default Accordion;
