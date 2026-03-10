import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';

const ModalFooter = ({ children, className, align = 'end' }) => {
  const alignmentClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-6 py-4',
        'border-t border-gray-200 dark:border-gray-700',
        alignmentClasses[align],
        className
      )}
    >
      {children}
    </div>
  );
};

ModalFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  align: PropTypes.oneOf(['start', 'center', 'end', 'between']),
};

export { ModalFooter };
export default ModalFooter;
