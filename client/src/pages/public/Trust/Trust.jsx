import { Link } from 'react-router-dom';
import { CheckCircle, Users } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { PublicLayout } from '@/components/layout/PublicLayout';

/**
 * Trust & security — the public, plain-language account of the controls.
 *
 * Most banks describe security in adjectives. This page lists the actual controls,
 * and every one of them is inspectable somewhere in the app under Security. It also
 * states the one thing customers most need to know and most often get wrong: what
 * happens on a failed sign-in, and what SecureBank will never ask for.
 */
const CONTROLS = [
  'Passwords hashed with bcrypt — never stored in plaintext',
  'One-time codes and reset links from a cryptographic RNG, not Math.random()',
  'Refresh tokens in an httpOnly cookie, rotated on every use',
  'Replaying a rotated token revokes the whole session family',
  'Failed sign-ins are counted and the account locks after five',
  'Card numbers and authenticator secrets encrypted at rest',
  'Every session listed with its device and IP, revocable individually',
];

const FAILED_SIGNIN = [
  'The attempt is counted against the account, not just the IP address.',
  'After five failures the account locks for 15 minutes.',
  'A wrong password and an unknown account return the identical response.',
  'The comparison still runs, so timing cannot reveal which one it was.',
  'A successful sign-in clears the counter and issues a rotating refresh token.',
];

const Trust = () => (
  <PublicLayout>
    <div className="py-16">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight">Security you can inspect</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          These are the actual controls, and every one of them is visible somewhere in
          the app — under Security in the sidebar.
        </p>
      </header>

      <div className="mt-12 grid items-start gap-12 lg:grid-cols-2">
        <section aria-labelledby="controls">
          <h2 id="controls" className="text-xl font-semibold">The controls</h2>
          <ul className="mt-5 space-y-3">
            {CONTROLS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success-600" aria-hidden="true" />
                <span className="text-gray-700 dark:text-gray-300">{point}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register"><Button>Create your account</Button></Link>
            <Link to="/help"><Button variant="outline">Read the security guide</Button></Link>
          </div>
        </section>

        <section
          aria-labelledby="failed-signin"
          className="rounded-2xl border border-gray-200 bg-gray-50 p-7 dark:border-gray-700 dark:bg-gray-800/50"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50 text-success-600 dark:bg-success-500/10">
              <Users className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="failed-signin" className="font-semibold">What happens on a failed sign-in</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">The real sequence, not a diagram of it.</p>
            </div>
          </div>
          <ol className="mt-5 space-y-3 text-sm">
            {FAILED_SIGNIN.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-600 text-[11px] font-semibold text-white">
                  {index + 1}
                </span>
                <span className="text-gray-700 dark:text-gray-300">{step}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="mt-16 rounded-2xl border border-warning-300 bg-warning-50 p-6 dark:border-warning-700 dark:bg-warning-900/20">
        <h2 className="font-semibold text-warning-900 dark:text-warning-200">What we will never do</h2>
        <p className="mt-2 text-sm text-warning-900/90 dark:text-warning-200/90">
          SecureBank will never ask for your password, one-time code or recovery codes by
          phone, SMS or email, and never sends a sign-in link in a message. If anyone does
          any of those things claiming to be us, it is fraud — report it via the{' '}
          <Link to="/contact" className="font-semibold underline">contact page</Link>.
        </p>
      </section>
    </div>
  </PublicLayout>
);

export { Trust };
export default Trust;
