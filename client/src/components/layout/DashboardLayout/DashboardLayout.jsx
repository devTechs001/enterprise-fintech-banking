import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';
import { MainLayout } from '../MainLayout';

const DashboardLayout = ({ children, className }) => {
  return (
    <MainLayout>
      <div className={cn('space-y-6', className)}>
        {children}
      </div>
    </MainLayout>
  );
};

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export { DashboardLayout };
export default DashboardLayout;
