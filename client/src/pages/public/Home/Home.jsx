import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Lock, Receipt, TrendingUp, CreditCard } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { PublicLayout } from '@/components/layout/PublicLayout';

/**
 * Home — the public landing page.
 *
 * Deliberately a TEASER, not the whole site. The previous landing page tried to be
 * every page at once in one long scroll, which is why its nav resorted to anchors
 * (`#pricing`, `#about`) that pointed at sections nobody had written. Each of those
 * is now its own route (`/pricing`, `/about`, `/features`, `/trust`, `/contact`),
 * and this page exists to orient and route, not to contain.
 */
const TEASERS = [
  { to: '/features', icon: Receipt, title: 'Everything in one place', copy: 'Accounts, transfers, cards, investments and loans — each a real screen, not a roadmap item.' },
  { to: '/trust', icon: Shield, title: 'Security you can inspect', copy: 'The actual controls, named: rotating refresh tokens, lockout, encrypted secrets, session revocation.' },
  { to: '/pricing', icon: TrendingUp, title: 'Pricing with no surprises', copy: 'Three tiers, published fees, and the things we will never charge you for.' },
];

const Home = () => (
  <PublicLayout wide>
    {/* Hero */}
    <section className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <img src="/images/hero-bg.jpg" alt="" className="h-full w-full object-cover" decoding="async" />
        {/* The scrim carries the contrast ratio; the photograph is decoration. */}
        <div className="absolute inset-0 bg-white/85 dark:bg-gray-950/80" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent dark:from-gray-900" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-24 text-center sm:px-6 lg:px-8">
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
          <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">digital age</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300"
        >
          Accounts, transfers, cards, investments and loans — with the security controls
          visible and in your hands, not buried in a settings page.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <Link to="/register"><Button size="lg" rightIcon={ArrowRight}>Open an account</Button></Link>
          <Link to="/features"><Button size="lg" variant="outline">See what it does</Button></Link>
          <Link to="/help"><Button size="lg" variant="ghost">Help centre</Button></Link>
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

    {/* Teasers route outward rather than duplicating the pages */}
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-6 md:grid-cols-3">
        {TEASERS.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="group rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10">
              <t.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-semibold">{t.title}</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t.copy}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400">
              Learn more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </section>

    {/* Closing CTA */}
    <section className="relative isolate overflow-hidden py-20">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <img src="/images/hero-bg.jpg" alt="" className="h-full w-full object-cover object-center" loading="lazy" decoding="async" />
        <div className="absolute inset-0 bg-gray-950/85" />
      </div>
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-white">Ready to get started?</h2>
        <p className="mx-auto mt-4 max-w-xl text-gray-300">
          Opening an account takes a few minutes. You will confirm your email and enrol an
          authenticator before the account can move money.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/register"><Button size="lg" rightIcon={ArrowRight}>Create your account</Button></Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">I already have one</Button>
          </Link>
        </div>
      </div>
    </section>
  </PublicLayout>
);

export { Home };
export default Home;
