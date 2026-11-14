import { Link } from 'react-router-dom';
import { Compass, Scale, Wrench } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { PublicLayout } from '@/components/layout/PublicLayout';

/**
 * About — its own page.
 *
 * The old landing nav's `#about` anchor pointed at nothing. This page states what the
 * project is and, just as importantly, what it is not: it is a demonstration build,
 * not a licensed bank, and saying so plainly is part of being trustworthy.
 */
const VALUES = [
  { icon: Scale, title: 'Plain language', copy: 'Fees, limits and security controls are published in words a customer can act on, not in terms-of-service prose.' },
  { icon: Compass, title: 'Controls in your hands', copy: 'Freeze a card, revoke a session, rotate a token — the actions live in the app, not in a phone queue.' },
  { icon: Wrench, title: 'Built to be inspected', copy: 'The security model is documented in the repository and summarised on the trust page, so it can be checked rather than believed.' },
];

const TIMELINE = [
  ['2025', 'Core banking screens: accounts, transfers, cards.'],
  ['2026', 'Full security review and remediation; two-factor auth, session control and lockout.'],
  ['2026', 'Payments, investments, loans and analytics joined the app; this public site split into real pages.'],
];

const About = () => (
  <PublicLayout>
    <div className="py-16">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight">About SecureBank</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          SecureBank is a demonstration of what consumer banking software looks like when
          the security model is treated as the product, not as a compliance afterthought.
        </p>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          It is not a licensed bank and moves no real money. That is stated on every page
          footer on purpose.
        </p>
      </header>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {VALUES.map((value) => (
          <div key={value.title} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10">
              <value.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-semibold">{value.title}</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{value.copy}</p>
          </div>
        ))}
      </div>

      <section className="mt-16">
        <h2 className="text-xl font-semibold">How it got here</h2>
        <ol className="mt-6 space-y-4 border-l-2 border-gray-200 pl-6 dark:border-gray-700">
          {TIMELINE.map(([year, event]) => (
            <li key={year + event} className="relative">
              <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-primary-600" aria-hidden="true" />
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{year}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{event}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-16 flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
        <p className="flex-1 text-sm text-gray-600 dark:text-gray-300">
          Questions, or something that looks wrong?{' '}
          <Link to="/contact" className="font-semibold underline">Tell us</Link>.
        </p>
        <Link to="/register"><Button>Open an account</Button></Link>
      </div>
    </div>
  </PublicLayout>
);

export { About };
export default About;
