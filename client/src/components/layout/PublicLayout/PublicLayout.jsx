import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Shield, HelpCircle, Menu, X } from 'lucide-react';

import { cn } from '@/utils/helpers';
import { Button } from '@/components/common/Button';
import { DevModeBadge } from '@/components/common/DevModeBadge';

/**
 * Shared shell for the PUBLIC (marketing) area of the site.
 *
 * The public area used to be one long single-page scroll: the nav's `#pricing`,
 * `#about` and `#contact` were anchors to sections that did not exist, and the
 * whole site was a single route. It is now a normal multi-route SPA — Home,
 * Features, Trust, Pricing, About, Contact and Help are separate pages with their
 * own URLs — which is what "SPA" means here: one application, many pages, client-
 * side routing. Anchors are gone; these are real `Link`s, so each page is
 * linkable, refreshable and back-button-correct.
 *
 * `NavLink` gives the current page its active state for free, which the old
 * hand-rolled anchor nav could not do at all.
 */
const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/features', label: 'Features' },
  { to: '/trust', label: 'Trust & security' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
  { to: '/help', label: 'Help' },
];

const FOOTER = [
  {
    title: 'Product',
    links: [
      { to: '/features', label: 'Features' },
      { to: '/trust', label: 'Trust & security' },
      { to: '/pricing', label: 'Pricing' },
      { to: '/register', label: 'Open an account' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About' },
      { to: '/contact', label: 'Contact' },
      { to: '/help', label: 'Help centre' },
    ],
  },
  {
    title: 'Account',
    links: [
      { to: '/login', label: 'Sign in' },
      { to: '/register', label: 'Create account' },
      { to: '/forgot-password', label: 'Reset password' },
    ],
  },
];

const PublicLayout = ({ children, wide = false }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu on navigation; an open drawer over the next page is a
  // classic SPA bug and reads as the new page being broken.
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:rounded-lg focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <header
        className={cn(
          'fixed top-0 z-50 w-full border-b transition-colors',
          scrolled || menuOpen
            ? 'border-gray-200 bg-white/90 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-900/90'
            : 'border-transparent bg-transparent'
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2" aria-label="SecureBank home">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-purple-600">
              <Shield className="h-4 w-4 text-white" aria-hidden="true" />
            </span>
            <span className="text-xl font-bold">SecureBank</span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => cn(
                  'text-sm transition-colors',
                  isActive
                    ? 'font-semibold text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                )}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link to="/register"><Button size="sm">Open account</Button></Link>
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>

        {menuOpen && (
          <nav className="border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900 lg:hidden" aria-label="Mobile">
            <ul className="space-y-1">
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => cn(
                      'block rounded-lg px-3 py-2 text-sm',
                      isActive ? 'bg-primary-50 font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800'
                    )}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
              <li className="flex gap-2 pt-2">
                <Link to="/login" className="flex-1"><Button variant="outline" className="w-full">Sign in</Button></Link>
                <Link to="/register" className="flex-1"><Button className="w-full">Open account</Button></Link>
              </li>
            </ul>
          </nav>
        )}
      </header>

      <main id="main" className={cn('pt-16', wide ? '' : 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8')}>
        {children}
      </main>

      <footer className="mt-20 border-t border-gray-200 py-12 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-purple-600">
                  <Shield className="h-4 w-4 text-white" aria-hidden="true" />
                </span>
                <span className="text-lg font-bold">SecureBank</span>
              </div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                A demonstration build. No real money moves and no data leaves your session.
              </p>
            </div>

            {/* Every footer link is a real route. The previous footer had eleven
                href="#" placeholders that went nowhere. */}
            {FOOTER.map((group) => (
              <div key={group.title}>
                <h3 className="mb-4 text-sm font-semibold">{group.title}</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  {group.links.map((link) => (
                    <li key={link.to + link.label}>
                      <Link to={link.to} className="hover:text-gray-900 dark:hover:text-white">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t border-gray-200 pt-6 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} SecureBank. Demonstration build — not a licensed bank.</p>
            <Link to="/contact" className="inline-flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-white">
              <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" /> Contact us
            </Link>
          </div>
        </div>
      </footer>

      <DevModeBadge />
    </div>
  );
};

PublicLayout.propTypes = {
  children: PropTypes.node.isRequired,
  wide: PropTypes.bool,
};

export { PublicLayout };
export default PublicLayout;
