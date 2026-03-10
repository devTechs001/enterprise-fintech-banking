import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';

const HeaderLogo = ({ className }) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center">
        <span className="text-white font-bold text-lg">S</span>
      </div>
      <span className="text-xl font-bold text-gray-900 dark:text-white">
        SecureBank
      </span>
    </div>
  );
};

HeaderLogo.propTypes = {
  className: PropTypes.string,
};

export { HeaderLogo };
export default HeaderLogo;
