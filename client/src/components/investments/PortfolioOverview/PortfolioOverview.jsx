import PropTypes from 'prop-types';
import { Briefcase } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/Card';
import { ProgressBar } from '@/components/common/ProgressBar';

/** Portfolio summary: total value, day change and target-allocation drift. */
const PortfolioOverview = ({ total = 0, changePercent = 0, holdings = [] }) => {
  const positive = changePercent >= 0;
  return (
    <Card>
      <CardHeader className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10">
          <Briefcase className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <CardTitle>Portfolio</CardTitle>
          <CardDescription>{holdings.length} holding{holdings.length === 1 ? '' : 's'}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-3xl font-bold tabular-nums text-gray-900 dark:text-white">
            {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className={positive ? 'text-sm font-medium text-success-600' : 'text-sm font-medium text-danger-600'}>
            {positive ? '+' : ''}{changePercent.toFixed(2)}% today
          </p>
        </div>
        <ProgressBar value={Math.min(100, Math.abs(changePercent) * 20 + 50)} variant={positive ? 'success' : 'danger'} size="sm" />
      </CardContent>
    </Card>
  );
};

PortfolioOverview.propTypes = {
  total: PropTypes.number, changePercent: PropTypes.number,
  holdings: PropTypes.arrayOf(PropTypes.object),
};

export { PortfolioOverview };
export default PortfolioOverview;
