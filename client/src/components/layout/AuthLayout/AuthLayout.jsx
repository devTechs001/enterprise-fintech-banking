import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';
import { HeaderLogo } from '../MainLayout/Header/HeaderLogo';

const AuthLayout = ({ children, className }) => {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-purple-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <HeaderLogo className="text-white" />

          <div className="max-w-md">
            <h1 className="text-4xl font-bold mb-4">
              Banking Made Simple
            </h1>
            <p className="text-lg text-white/80">
              Experience the future of banking with secure, fast, and intuitive financial services at your fingertips.
            </p>
          </div>

          <div className="text-sm text-white/60">
            © {new Date().getFullYear()} SecureBank. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div
        className={cn(
          'flex-1 flex items-center justify-center p-8',
          'bg-gray-50 dark:bg-gray-900',
          className
        )}
      >
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <HeaderLogo />
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export { AuthLayout };
export default AuthLayout;
