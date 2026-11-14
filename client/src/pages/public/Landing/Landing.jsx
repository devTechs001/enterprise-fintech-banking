import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Shield, Zap, Globe, Users, CheckCircle, Lock,
  CreditCard, TrendingUp, Receipt, HelpCircle, ChevronUp,
} from 'lucide-react';

import { Button } from '@/components/common/Button';

/**
 * Marketing landing page.
 *
 * What was wrong with it, beyond being unstyled:
 *
 *  - The nav linked to `#pricing`, `#about` and `#contact`. Only `#features`
 *    existed, so three of the four nav items jumped nowhere.
 *  - Every footer link was `href="#"` — eleven dead links.
 *  - "Learn More" navigated to `/login`, which is not learning more.
 *  - The hero had no background at all.
 *
 * Anchor links now use `scrollIntoView` rather than relying on the browser's
 * default jump, so they respect `scroll-behavior` and work with the fixed header
 * offset. Dead links were removed rather than pointed at placeholder pages: a
 * link that goes nowhere honest is better than one that pretends.
 */

const FEATURES = [
  { icon: Shield, title: 'Bank-grade security', description: 'Two-factor authentication, encrypted credentials and full control over every signed-in session.' },
  { icon: Zap, title: 'Instant transfers', description: 'Move money between accounts and to saved payees, with limits enforced server-side.' },
  { icon: Globe, title: 'Multi-currency', description: 'Hold and transact in several currencies, each with its own balance and limits.' },
  { icon: CreditCard, title: 'Card controls', description: 'Freeze a card instantly and switch contactless, online or international payments off independently.' },
  { icon: TrendingUp, title: 'Investments', description: 'Track a portfolio with allocation, holdings and performance in one place.' },
  { icon: Receipt, title: 'Bill payments', description: 'Pay registered billers once or on a schedule you control.' },
];

const SECURITY_POINTS = [
  'Passwords hashed with bcrypt — never stored in plaintext',
  'One-time codes and reset links from a cryptographic RNG, not Math.random()',
  'Refresh tokens in an httpOnly cookie, rotated on every use',
  'Replaying a rotated token revokes the whole session family',
  'Failed sign-ins are counted and the account locks after five',
  'Card numbers and authenticator secrets encrypted at rest',
];

const NAV = [
  { id: 'features', label: 'Features' },
  { id: 'security', label: 'Security' },
  { id: 'get-started', label: 'Get started' },
];

const Landing = () => {
  const sections = useRef({});

  const scrollTo = useCallback((id) => {
    const node = sections.current[id];
    if (!node) return;
    // The header is fixed and 64px tall; without the offset the heading hides behind it.
    const top = node.getBoundingClientRect().top + window.scrollY - 76;
    window.scrollTo({ top, behavior: 'smooth' });
    node.setAttribute('tabindex', '-1');
    node.focus({ preventScroll: true });
  }, []);

  // Honour a hash on first load (e.g. someone shares /#security).
  useEffect(() => {
    const id = window.location.hash.replace('#', '');
    if (id && sections.current[id]) scrollTo(id);
  }, [scrollTo]);

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const register = (id) => (node) => { sections.current[id] = node; };

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
      <a
        href="#features"
        onClick={(e) => { e.preventDefault(); scrollTo('features'); }}
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      {/* Navigation */}
      <nav
        className={`fixed top-0 z-50 w-full border-b transition-colors ${
          scrolled
            ? 'border-gray-200 bg-white/90 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-900/90'
            : 'border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2" aria-label="SecureBank home">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-purple-600">
              <Shield className="h-4 w-4 text-white" aria-hidden="true" />
            </span>
            <span className="text-xl font-bold">SecureBank</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                {item.label}
              </button>
            ))}
            <Link to="/help" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              <HelpCircle className="h-4 w-4" aria-hidden="true" /> Help
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link to="/register"><Button size="sm">Open account</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative isolate overflow-hidden pt-32 pb-24">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <img
            src="/images/hero-bg.jpg"
            alt=""
            className="h-full w-full object-cover"
            decoding="async"
          />
          {/* The scrim is what guarantees the contrast ratio; the photograph is
              decoration and must never be load-bearing for legibility. */}
          <div className="absolute inset-0 bg-white/85 dark:bg-gray-950/80" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent dark:from-gray-900" />
        </div>

        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 dark:border-primary-800 dark:bg-primary-900/30 dark:text-primary-300"
          >
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            Two-factor authentication on every account
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
          >
            Banking for the{' '}
            <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              digital age
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300"
          >
            Accounts, transfers, cards, investments and loans — with the security
            controls visible and in your hands, not buried in a settings page.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <Link to="/register">
              <Button size="lg" rightIcon={ArrowRight}>Open an account</Button>
            </Link>
            {/* Was previously a link to /login labelled "Learn More". */}
            <Button size="lg" variant="outline" onClick={() => scrollTo('features')}>
              See what it does
            </Button>
            <Link to="/help">
              <Button size="lg" variant="ghost" leftIcon={HelpCircle}>Help centre</Button>
            </Link>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4"
          >
            {[
              ['4', 'Account types'],
              ['2FA', 'On by default'],
              ['24h', 'New-payee cooling off'],
              ['15 min', 'Session lifetime'],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd>
                  <span className="block text-2xl font-bold tabular-nums">{value}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </section>

      {/* Features */}
      <section id="features" ref={register('features')} className="scroll-mt-20 bg-gray-50 py-20 dark:bg-gray-800/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Everything in one place</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              Each of these is a real screen in the app, not a roadmap item.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10">
                  <feature.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" ref={register('security')} className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Security you can inspect</h2>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Most banks describe their security in adjectives. These are the actual
                controls, and every one of them is visible somewhere in the app —
                under Security in the sidebar.
              </p>
              <ul className="mt-7 space-y-3">
                {SECURITY_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success-600" aria-hidden="true" />
                    <span className="text-gray-700 dark:text-gray-300">{point}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/register"><Button rightIcon={ArrowRight}>Create your account</Button></Link>
                <Link to="/help"><Button variant="outline">Read the security guide</Button></Link>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-7 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50 text-success-600 dark:bg-success-500/10">
                  <Users className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold">What happens on a failed sign-in</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">The real sequence, not a diagram of it.</p>
                </div>
              </div>
              <ol className="mt-5 space-y-3 text-sm">
                {[
                  'The attempt is counted against the account, not just the IP address.',
                  'After five failures the account locks for 15 minutes.',
                  'A wrong password and an unknown account return the identical response.',
                  'The comparison still runs, so timing cannot reveal which one it was.',
                  'A successful sign-in clears the counter and issues a rotating refresh token.',
                ].map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-600 text-[11px] font-semibold text-white">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section id="get-started" ref={register('get-started')} className="relative isolate scroll-mt-20 overflow-hidden py-20">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <img src="/images/hero-bg.jpg" alt="" className="h-full w-full object-cover object-center" loading="lazy" decoding="async" />
          <div className="absolute inset-0 bg-gray-950/85" />
        </div>
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-white">Ready to get started?</h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-300">
            Opening an account takes a few minutes. You will be asked to confirm your
            email and enrol an authenticator before the account can move money.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/register">
              <Button size="lg" rightIcon={ArrowRight}>Create your account</Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                I already have one
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 dark:border-gray-800">
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
                A demonstration build. No real money moves and no data leaves your
                session.
              </p>
            </div>

            {/* Every footer link resolves to a real route or a real section. The
                previous footer had eleven `href="#"` links. */}
            <div>
              <h3 className="mb-4 text-sm font-semibold">Product</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><button type="button" onClick={() => scrollTo('features')} className="hover:text-gray-900 dark:hover:text-white">Features</button></li>
                <li><button type="button" onClick={() => scrollTo('security')} className="hover:text-gray-900 dark:hover:text-white">Security</button></li>
                <li><Link to="/register" className="hover:text-gray-900 dark:hover:text-white">Open an account</Link></li>
                <li><Link to="/login" className="hover:text-gray-900 dark:hover:text-white">Sign in</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold">Support</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link to="/help" className="hover:text-gray-900 dark:hover:text-white">Help centre</Link></li>
                <li><Link to="/forgot-password" className="hover:text-gray-900 dark:hover:text-white">Reset your password</Link></li>
                <li><Link to="/404" className="hover:text-gray-900 dark:hover:text-white">Error pages</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold">Notice</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                SecureBank will never ask for your password, one-time code or recovery
                codes by phone, SMS or email.
              </p>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
              >
                <ChevronUp className="h-4 w-4" aria-hidden="true" /> Back to top
              </button>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t border-gray-200 pt-6 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} SecureBank. Demonstration build — not a licensed bank.</p>
            <p className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" aria-hidden="true" /> English
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export { Landing };
export default Landing;
