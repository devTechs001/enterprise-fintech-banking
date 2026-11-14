import { Link, useLocation } from 'react-router-dom';

import { ErrorLayout } from '@/components/layout/ErrorLayout/ErrorLayout';

/**
 * 404.
 *
 * Renders through `ErrorLayout` (it previously duplicated a bare div), and tells the
 * user what was asked for — a 404 that does not name the path sends the customer
 * hunting. The requested URL is interpolated as text, never as HTML, so a crafted
 * path cannot inject markup into the page.
 */
const SUGGESTED = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/accounts', label: 'Accounts' },
  { to: '/transfers', label: 'Transfers' },
  { to: '/payments', label: 'Payments' },
  { to: '/cards', label: 'Cards' },
  { to: '/settings', label: 'Settings' },
];

const NotFound = () => {
  const { pathname } = useLocation();

  return (
    <ErrorLayout
      errorCode="404"
      title="Page not found"
      description={`Nothing is served at ${pathname || 'that address'}.`}
    >
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800/50">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Were you looking for one of these?</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {SUGGESTED.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="inline-block rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:border-primary-400 hover:text-primary-700 dark:border-gray-600 dark:text-gray-300"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </ErrorLayout>
  );
};

export { NotFound };
export default NotFound;
