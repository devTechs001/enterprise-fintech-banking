import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';

const SidebarGroup = ({ title, children, className }) => {
  return (
    <div className={cn('mb-6', className)}>
      {title && (
        <h3 className="px-7 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {title}
        </h3>
      )}
      <div>{children}</div>
    </div>
  );
};

SidebarGroup.propTypes = {
  title: PropTypes.node,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export { SidebarGroup };
export default SidebarGroup;
