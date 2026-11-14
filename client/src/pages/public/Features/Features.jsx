import { Link } from 'react-router-dom';
import { CreditCard, Globe, Receipt, Shield, TrendingUp, Zap, Users, PieChart } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { PublicLayout } from '@/components/layout/PublicLayout';

/**
 * Features — its own page, its own URL.
 *
 * Every entry here names a screen that actually exists in the app and links to the
 * public page or auth route where you can reach it. A marketing page that describes
 * screens which do not exist is a roadmap dressed as a product; this one only lists
 * what the router mounts.
 */
const GROUPS = [
  {
    title: 'Everyday banking',
    items: [
      { icon: Zap, name: 'Instant transfers', copy: 'Move money between your accounts and to saved payees, with limits enforced server-side.', to: '/register' },
      { icon: Globe, name: 'Multi-currency', copy: 'Hold and transact in several currencies, each with its own balance and limits.', to: '/register' },
      { icon: Receipt, name: 'Bill payments', copy: 'Pay registered billers once, or on a schedule you can pause and cancel.', to: '/register' },
      { icon: Users, name: 'Beneficiaries', copy: 'New payees wait through a 24-hour cooling-off period before they can receive money.', to: '/register' },
    ],
  },
  {
    title: 'Cards & credit',
    items: [
      { icon: CreditCard, name: 'Card controls', copy: 'Freeze a card instantly and switch contactless, online or international payments off independently.', to: '/register' },
      { icon: PieChart, name: 'Loans', copy: 'An indicative calculator, product comparison, and applications that start with a soft check.', to: '/register' },
    ],
  },
  {
    title: 'Insight',
    items: [
      { icon: TrendingUp, name: 'Investments', copy: 'Portfolio value, allocation and holdings in one place — labelled indicative, never advice.', to: '/register' },
      { icon: Shield, name: 'Analytics', copy: 'Cashflow, category spend, budgets and your credit score, from your own transactions.', to: '/register' },
    ],
  },
];

const Features = () => (
  <PublicLayout>
    <div className="py-16">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight">Everything in one place</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Each of these is a real screen in the app, reachable from the sidebar the
          moment you sign in.
        </p>
      </header>

      {GROUPS.map((group) => (
        <section key={group.title} className="mt-14">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {group.title}
          </h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            {group.items.map((item) => (
              <div key={item.name} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{item.name}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{item.copy}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="mt-16 flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
        <p className="flex-1 text-sm text-gray-600 dark:text-gray-300">
          Want the controls behind these screens, named? Read the{' '}
          <Link to="/trust" className="font-semibold underline">trust & security</Link> page.
        </p>
        <Link to="/register"><Button>Open an account</Button></Link>
      </div>
    </div>
  </PublicLayout>
);

export { Features };
export default Features;
