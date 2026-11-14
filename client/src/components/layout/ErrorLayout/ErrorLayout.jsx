import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, HelpCircle } from 'lucide-react';

import { cn } from '@/utils/helpers';
import { Button } from '@/components/common/Button';

/**
 * Shared shell for the 404 and 500 pages.
 *
 * The previous version offered exactly one action — go home — which for a 404
 * means the customer loses whatever they were doing and gets no route back. It now
 * offers: go back, go home, and the Help Centre. The Help Centre is on the error
 * pages specifically because /help is public: a signed-in user who hits a 404 can
 * still reach it, and a signed-out one can too.
 *
 * `children` renders between the description and the actions, so each error page can
 * add the detail that is genuinely useful for it (a suggested link list for 404, a
 * retry for 500).
 */
const ErrorLayout = ({
  children,
  errorCode = '404',
  title = 'Page Not Found',
  description = "Sorry, we couldn't find the page you're looking for.",
  showHomeButton = true,
  showBackButton = true,
  showHelpButton = true,
  onBack,
  className,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) { onBack(); return; }
    // window.history.back() would leave the app entirely if the 404 was the first
    // thing loaded (a shared link, a bookmark). Fall back to home in that case.
    if (window.history.length > 1) navigate(-1);
    else navigate('/dashboard');
  };

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-4 dark:bg-gray-900">
      {/* Decorative backdrop — same artwork as the marketing hero so an error page
          still reads as the product rather than a browser default. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <img src="/images/auth-bg.jpg" alt="" className="h-full w-full object-cover" decoding="async" />
        <div className="absolute inset-0 bg-gray-50/90 dark:bg-gray-950/88" />
      </div>

      <div className={cn('max-w-md py-16 text-center', className)}>
        <p className="select-none bg-gradient-to-br from-primary-600 to-purple-600 bg-clip-text text-8xl font-bold text-transparent sm:text-9xl" aria-hidden="true">
          {errorCode}
        </p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{description}</p>

        {children && <div className="mt-6 text-left">{children}</div>}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {showBackButton && (
            <Button variant="outline" leftIcon={ArrowLeft} onClick={handleBack}>Go back</Button>
          )}
          {showHomeButton && (
            <Link to="/"><Button leftIcon={Home}>Go home</Button></Link>
          )}
          {showHelpButton && (
            <Link to="/help"><Button variant="ghost" leftIcon={HelpCircle}>Help centre</Button></Link>
          )}
        </div>
      </div>
    </div>
  );
};

ErrorLayout.propTypes = {
  children: PropTypes.node,
  errorCode: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  showHomeButton: PropTypes.bool,
  showBackButton: PropTypes.bool,
  showHelpButton: PropTypes.bool,
  onBack: PropTypes.func,
  className: PropTypes.string,
};

export { ErrorLayout };
export default ErrorLayout;
