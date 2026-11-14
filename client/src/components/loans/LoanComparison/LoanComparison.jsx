import PropTypes from 'prop-types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';

/** Side-by-side product comparison, best APR highlighted. */
const LoanComparison = ({ products = [] }) => {
  const bestApr = products.length ? Math.min(...products.map((p) => p.apr)) : null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compare products</CardTitle>
        <CardDescription>Indicative APRs. Your rate depends on underwriting.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-3 sm:grid-cols-2">
          {products.map((product) => (
            <li key={product.name} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{product.name}</p>
                {product.apr === bestApr && <Badge variant="success" size="sm">Best APR</Badge>}
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-gray-900 dark:text-white">{product.apr.toFixed(2)}%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">APR · up to {product.maxTerm} months · {product.maxAmount.toLocaleString()} max</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

LoanComparison.propTypes = {
  products: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired, apr: PropTypes.number.isRequired, maxTerm: PropTypes.number, maxAmount: PropTypes.number,
  })),
};

export { LoanComparison };
export default LoanComparison;
