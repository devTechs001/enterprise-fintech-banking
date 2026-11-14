import PropTypes from 'prop-types';
import { TrendingDown, TrendingUp } from 'lucide-react';

import { Card, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { cn } from '@/utils/helpers';

/** Single holding with value, day change and allocation weight. */
const InvestmentCard = ({ holding }) => {
  const positive = holding.changePercent >= 0;
  return (
    <Card variant="elevated">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{holding.symbol}</p>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">{holding.name}</p>
          </div>
          <Badge variant={positive ? 'success' : 'danger'} size="sm">
            {holding.assetClass}
          </Badge>
        </div>
        <p className="text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
          {holding.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className={cn('flex items-center gap-1 text-sm font-medium tabular-nums', positive ? 'text-success-600' : 'text-danger-600')}>
          {positive ? <TrendingUp className="h-4 w-4" aria-hidden="true" /> : <TrendingDown className="h-4 w-4" aria-hidden="true" />}
          {positive ? '+' : ''}{holding.changePercent.toFixed(2)}% today
        </p>
      </CardContent>
    </Card>
  );
};

InvestmentCard.propTypes = {
  holding: PropTypes.shape({
    symbol: PropTypes.string.isRequired, name: PropTypes.string.isRequired, value: PropTypes.number.isRequired,
    changePercent: PropTypes.number.isRequired, assetClass: PropTypes.string,
  }).isRequired,
};

export { InvestmentCard };
export default InvestmentCard;
