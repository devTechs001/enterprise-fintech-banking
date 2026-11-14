import { useQuery } from '@tanstack/react-query';

import axiosInstance from '@/api/axiosInstance';
import { Alert } from '@/components/common/Alert';
import { Spinner } from '@/components/common/Spinner';
import { AreaChart } from '@/components/charts';
import { DonutChart } from '@/components/charts';
import { BudgetTracker } from '@/components/banking/BudgetTracker';
import { CreditScore } from '@/components/banking/CreditScore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/Card';
import { formatCurrency } from '@/utils/formatters';

/**
 * Analytics.
 *
 * Charts are hand-rolled SVG rather than chart.js: removing that dependency
 * takes a rendering library and its XSS surface out of a banking client, and the
 * four chart types this product needs do not justify it.
 */
const Analytics = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: async () => (await axiosInstance.get('/analytics/overview')).data,
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error) return <Alert variant="danger">Analytics could not be loaded. {error.apiMessage || ''}</Alert>;

  const a = data?.analytics ?? {};
  const credit = data?.creditScore ?? null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Net worth {formatCurrency(a.netWorth)} · savings rate {a.savingsRate}%
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Net worth', value: formatCurrency(a.netWorth), sub: `${a.netWorthChange >= 0 ? '+' : ''}${a.netWorthChange}% this month` },
          { label: 'Savings rate', value: `${a.savingsRate}%`, sub: 'Of net income' },
          { label: 'Credit score', value: credit ? String(credit.score) : '—', sub: credit ? credit.band : 'Not available' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* AreaChart expects exactly { month, income, expenses } — the shape the
            API already returns, so no reshaping and no risk of a silent mismatch. */}
        <AreaChart title="Income vs expenses" data={a.cashflow ?? []} xKey="month" series={['income', 'expenses']} height={280} />
        <DonutChart
          title="Spending by category"
          data={(a.byCategory ?? []).map((c) => ({ category: c.category, value: c.amount, color: c.color }))}
          nameKey="category"
          valueKey="value"
          centreLabel="This month"
          height={280}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Budgets</CardTitle>
            <CardDescription>Two categories are over budget this month.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(a.budgetProgress ?? []).map((b) => (
              <BudgetTracker key={b.category} budget={b.budget} spent={b.spent} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top merchants</CardTitle>
            <CardDescription>Where your money went this month.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {(a.topMerchants ?? []).map((m) => (
                <li key={m.merchant} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{m.merchant}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{m.visits} transactions</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-gray-900 dark:text-white">
                    {formatCurrency(m.spend)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {credit && (
        <div className="grid gap-6 lg:grid-cols-2">
          <CreditScore score={credit.score} />
          <Card>
            <CardHeader>
              <CardTitle>Score factors</CardTitle>
              <CardDescription>What is driving your score.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {(credit.factors ?? []).map((f, i) => (
                  <li key={i} className="flex justify-between gap-3">
                    <span className="text-gray-600 dark:text-gray-300">{f.label || f.name || f}</span>
                    <span className="font-medium tabular-nums text-gray-900 dark:text-white">{f.impact || f.value || ''}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export { Analytics };
export default Analytics;
