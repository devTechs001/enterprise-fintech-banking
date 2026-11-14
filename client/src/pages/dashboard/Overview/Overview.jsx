import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, PiggyBank, ShieldAlert, Wallet } from 'lucide-react';

import axiosInstance from '@/api/axiosInstance';
import { Alert } from '@/components/common/Alert';
import { Spinner } from '@/components/common/Spinner';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/Card';
import { AccountCard } from '@/components/banking/AccountCard';
import { CreditScore } from '@/components/banking/CreditScore';
import { SavingsGoal } from '@/components/banking/SavingsGoal';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/utils/formatters';

/**
 * Overview — the at-a-glance panel.
 *
 * This file was `export const Overview = () => <div>Overview</div>;` and it is
 * still exported from `pages/dashboard/Overview/index.js`, so anything importing it
 * got a component that rendered the single word "Overview" with no error anywhere:
 * `vite build` passed, vitest passed, and the string appeared on screen as if it
 * were intentional. That is the failure mode worth naming — a placeholder that
 * renders *something* is invisible to every check that only asks whether the app
 * compiled.
 *
 * It now composes real data: balances from `/accounts`, savings rate and credit
 * score from `/analytics/overview`.
 *
 * It deliberately does NOT restate the dashboard's stats grid. It shows the things
 * that need a decision — a frozen account, two-factor authentication switched off,
 * a savings goal falling behind — because a panel that only repeats numbers you can
 * already see adds a scroll, not information.
 */
const Overview = ({ className }) => {
  const { user } = useAuth();

  const accountsQuery = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => (await axiosInstance.get('/accounts')).data,
  });
  const analyticsQuery = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: async () => (await axiosInstance.get('/analytics/overview')).data,
    staleTime: 60_000,
  });

  if (accountsQuery.isLoading && analyticsQuery.isLoading) {
    return <div className="flex justify-center py-12"><Spinner /></div>;
  }

  const accounts = accountsQuery.data?.accounts ?? [];
  const analytics = analyticsQuery.data?.analytics ?? null;
  const creditScore = analyticsQuery.data?.creditScore ?? null;

  const total = accounts.reduce((sum, a) => sum + Number(a.balance ?? 0), 0);
  const frozen = accounts.filter((a) => a.isFrozen || a.status === 'frozen');
  const overdrawn = accounts.filter((a) => Number(a.balance) < 0);
  const goal = analytics?.savingsGoal ?? null;

  // Security posture is part of an overview: a customer with two-factor
  // authentication off is one leaked password away from an emptied account, and
  // the dashboard is the one screen they are guaranteed to look at.
  const securityWarnings = [];
  if (user && user.mfaEnabled === false) securityWarnings.push('Two-factor authentication is off.');
  if (user && user.emailVerified === false) securityWarnings.push('Your email address is not verified.');
  if (user && user.kycStatus && user.kycStatus !== 'verified') securityWarnings.push(`Identity verification is ${user.kycStatus}.`);

  return (
    <section className={className} aria-label="Overview">
      <div className="space-y-4">
        {securityWarnings.map((warning) => (
          <Alert key={warning} variant="warning" icon={ShieldAlert}>
            <span className="flex flex-wrap items-center justify-between gap-2">
              <span>{warning}</span>
              <Link to="/security" className="inline-flex items-center gap-1 text-xs font-semibold underline">
                Fix it <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </span>
          </Alert>
        ))}

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Wallet className="h-4 w-4" aria-hidden="true" /> Total balance
              </span>
              <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
                {formatCurrency(total)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Across {accounts.length} account{accounts.length === 1 ? '' : 's'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <PiggyBank className="h-4 w-4" aria-hidden="true" /> Savings rate
              </span>
              <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
                {analytics ? `${analytics.savingsRate}%` : '—'}
              </p>
              <ProgressBar
                value={analytics?.savingsRate ?? 0}
                max={100}
                size="sm"
                animated={false}
                className="mt-2"
                aria-label="Savings rate"
              />
            </CardContent>
          </Card>

          {creditScore
            ? <CreditScore score={creditScore.score} />
            : (
              <Card>
                <CardContent className="p-5">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Credit score</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">—</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Not available yet</p>
                </CardContent>
              </Card>
            )}
        </div>

        {frozen.length > 0 && (
          <Alert variant="danger">
            {frozen.length === 1
              ? `${frozen[0].accountName || 'One account'} is frozen and cannot send or receive money.`
              : `${frozen.length} of your accounts are frozen and cannot send or receive money.`}
            {' '}<Link to="/accounts" className="font-semibold underline">Review accounts</Link>
          </Alert>
        )}

        {overdrawn.length > 0 && (
          <Alert variant="warning">
            {overdrawn.length === 1
              ? `${overdrawn[0].accountName || 'One account'} is overdrawn at ${formatCurrency(overdrawn[0].balance)}.`
              : `${overdrawn.length} accounts are overdrawn.`}
            Interest and fees may apply.
          </Alert>
        )}

        {accounts.slice(0, 2).map((account) => (
          <AccountCard key={account.id} account={account} showActions={false} />
        ))}

        {goal && (
          <SavingsGoal
            goal={goal.name}
            current={goal.current}
            target={goal.target}
            deadline={goal.deadline}
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle>Where to next</CardTitle>
            <CardDescription>The pages this overview summarises.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {[
              ['/accounts', 'Accounts'], ['/transfers', 'Transfers'], ['/payments', 'Payments'],
              ['/cards', 'Cards'], ['/analytics', 'Analytics'], ['/loans', 'Loans'],
            ].map(([to, label]) => (
              <Link
                key={to}
                to={to}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-primary-400 hover:text-primary-700 dark:border-gray-700 dark:text-gray-200"
              >
                {label} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export { Overview };
export default Overview;
