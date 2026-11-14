import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { formatCurrency } from '@/utils/formatters';

/**
 * Pricing — its own page with a working billing toggle.
 *
 * This page is why the old landing nav's `#pricing` anchor was a lie: there was no
 * pricing anywhere. The monthly/annual toggle is real state that recomputes the
 * displayed figures (annual = ten months, i.e. two free), rather than two static
 * columns pretending to be a choice.
 *
 * The "never" list matters as much as the prices: hidden fees are a trust failure,
 * so the things we will not charge for are published next to the things we will.
 */
const TIERS = [
  {
    name: 'Everyday',
    monthly: 0,
    tagline: 'For getting started.',
    features: ['1 checking account', '1 debit card', 'Instant transfers', 'Bill payments', 'Two-factor authentication'],
    cta: 'Open free account',
  },
  {
    name: 'Plus',
    monthly: 9,
    tagline: 'For people who move money often.',
    features: ['4 accounts incl. savings', '2 cards incl. a virtual card', 'Scheduled payments', 'Analytics & budgets', 'Priority support'],
    cta: 'Choose Plus',
    highlight: true,
  },
  {
    name: 'Business',
    monthly: 29,
    tagline: 'For teams and invoices.',
    features: ['Everything in Plus', 'Multi-currency accounts', 'Beneficiary approval flow', 'CSV export & statements', 'Named support contact'],
    cta: 'Talk to us',
    ctaTo: '/contact',
  },
];

const NEVER = [
  'A fee to view your own balance or statements',
  'A charge for enabling two-factor authentication',
  'A fee to freeze or unfreeze a card',
  'A charge for revoking a session after a compromise',
];

const Pricing = () => {
  const [billing, setBilling] = useState('monthly');
  const annual = billing === 'annual';

  return (
    <PublicLayout>
      <div className="py-16">
        <header className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight">Pricing with no surprises</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Published fees, and a published list of the things we will never charge for.
          </p>

          {/* A real toggle: it recomputes every figure below. */}
          <div className="mt-8 inline-flex items-center rounded-full border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800" role="group" aria-label="Billing period">
            {['monthly', 'annual'].map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setBilling(period)}
                aria-pressed={billing === period}
                className={
                  'rounded-full px-4 py-1.5 text-sm font-medium transition-colors ' +
                  (billing === period
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white')
                }
              >
                {period === 'monthly' ? 'Monthly' : 'Annual · 2 months free'}
              </button>
            ))}
          </div>
        </header>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {TIERS.map((tier) => {
            const price = annual ? tier.monthly * 10 : tier.monthly * 12;
            return (
              <div
                key={tier.name}
                className={
                  'relative flex flex-col rounded-2xl border p-6 ' +
                  (tier.highlight
                    ? 'border-primary-500 bg-white shadow-lg dark:border-primary-500 dark:bg-gray-900'
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900')
                }
              >
                {tier.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-3 py-0.5 text-xs font-semibold text-white">
                    Most popular
                  </span>
                )}
                <h2 className="text-lg font-semibold">{tier.name}</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{tier.tagline}</p>
                <p className="mt-5">
                  <span className="text-4xl font-bold tabular-nums">
                    {annual ? formatCurrency(price / 12) : formatCurrency(tier.monthly)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400"> /month</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {annual ? `${formatCurrency(price)} billed yearly` : `${formatCurrency(tier.monthly * 12)} billed monthly`}
                </p>
                <ul className="mt-6 flex-1 space-y-2">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success-600" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to={tier.ctaTo || '/register'} className="mt-6">
                  <Button className="w-full" variant={tier.highlight ? 'primary' : 'outline'}>{tier.cta}</Button>
                </Link>
              </div>
            );
          })}
        </div>

        <section className="mt-16 rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
          <h2 className="font-semibold">Things we will never charge you for</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {NEVER.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success-600" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PublicLayout>
  );
};

export { Pricing };
export default Pricing;
