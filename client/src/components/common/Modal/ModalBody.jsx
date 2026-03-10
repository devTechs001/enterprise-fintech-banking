import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';

const ModalBody = ({ children, className, scrollable = false }) => {
  return (
    <div
      className={cn(
        'px-6',
        scrollable ? 'overflow-y-auto flex-1' : 'py-4',
        className
      )}
    >
      {children}
    </div>
  );
};

ModalBody.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  scrollable: PropTypes.bool,
};

export { ModalBody };
export default ModalBody;
