import PropTypes from 'prop-types';
import { DonutChart } from '@/components/charts';

/** Allocation by asset class with a target-vs-actual drift list. */
const AssetAllocation = ({ allocation = [], height = 260 }) => (
  <div className="space-y-4">
    <DonutChart data={allocation} nameKey="assetClass" valueKey="value" title="Asset allocation" centreLabel="Invested" height={height} />
    <ul className="space-y-2">
      {allocation.map((row) => {
        const drift = (row.actualPercent ?? 0) - (row.targetPercent ?? 0);
        return (
          <li key={row.assetClass} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-gray-700 dark:text-gray-300">{row.assetClass}</span>
            <span className="tabular-nums text-gray-500 dark:text-gray-400">
              {row.targetPercent ?? 0}% target ·{' '}
              <span className={drift > 0 ? 'text-success-600' : drift < 0 ? 'text-danger-600' : ''}>
                {drift > 0 ? '+' : ''}{drift.toFixed(1)}%
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  </div>
);

AssetAllocation.propTypes = {
  allocation: PropTypes.arrayOf(PropTypes.shape({
    assetClass: PropTypes.string.isRequired, value: PropTypes.number.isRequired,
    targetPercent: PropTypes.number, actualPercent: PropTypes.number,
  })),
  height: PropTypes.number,
};

export { AssetAllocation };
export default AssetAllocation;
