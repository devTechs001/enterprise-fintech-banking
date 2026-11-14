import { useQuery } from '@tanstack/react-query';
import { TrendingUp } from 'lucide-react';

import axiosInstance from '@/api/axiosInstance';
import { Alert } from '@/components/common/Alert';
import { Spinner } from '@/components/common/Spinner';
import { PortfolioOverview } from '@/components/investments/PortfolioOverview';
import { AssetAllocation } from '@/components/investments/AssetAllocation';
import { StockChart } from '@/components/investments/StockChart';
import { formatCurrency } from '@/utils/formatters';

/**
 * Investments.
 *
 * Values are indicative and delayed. Nothing here is investment advice, and the
 * page says so rather than leaving a customer to infer it from a clean chart.
 */
const Investments = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => (await axiosInstance.get('/investments/portfolio')).data,
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  // The heading renders on EVERY branch, including the error and empty states.
  // An early return that skips it leaves the route with no <h1> at all — invisible
  // to a compiler, and to a screen reader it means the page has no name.
  const heading = (
    <header>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Investments</h1>
    </header>
  );

  if (error) {
    return (
      <div className="space-y-6">
        {heading}
        <Alert variant="danger">Your portfolio could not be loaded. {error.apiMessage || ''}</Alert>
      </div>
    );
  }

  const portfolio = data?.portfolio;
  if (!portfolio) {
    return (
      <div className="space-y-6">
        {heading}
        <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
          <TrendingUp className="mx-auto h-10 w-10 text-gray-400" aria-hidden="true" />
          <h2 className="mt-4 font-semibold text-gray-900 dark:text-white">No investment account</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Open one to start investing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Investments</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Portfolio value {formatCurrency(portfolio.totalValue, portfolio.currency)} ·
          {' '}{portfolio.totalGain >= 0 ? '+' : ''}{formatCurrency(portfolio.totalGain, portfolio.currency)} all time
        </p>
      </header>

      <Alert variant="info">
        Values are indicative and delayed. This is not investment advice, and past
        performance does not indicate future results.
      </Alert>

      <PortfolioOverview
        total={portfolio.totalValue}
        changePercent={portfolio.dayChangePercent}
        holdings={portfolio.holdings}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* AssetAllocation reads `assetClass`; the API returns `label`. */}
        <AssetAllocation
          allocation={portfolio.allocation.map((a) => ({ assetClass: a.label, value: a.value, percent: a.percent, color: a.color }))}
        />
        {/* StockChart reads `date` and `price`. */}
        <StockChart
          title="Portfolio value"
          data={portfolio.performance.map((p) => ({ date: p.period, price: p.value }))}
        />
      </div>
    </div>
  );
};

export { Investments };
export default Investments;
