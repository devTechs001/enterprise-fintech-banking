import PropTypes from 'prop-types';
import { History } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { formatCurrency, formatDateTime } from '@/utils/formatters';

/** Read-only payment history with status badges and references. */
const PaymentHistory = ({ payments = [] }) => (
  <Card>
    <CardHeader className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10">
        <History className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <CardTitle>Payment history</CardTitle>
        <CardDescription>Every outbound payment with its reference.</CardDescription>
      </div>
    </CardHeader>
    <CardContent>
      {payments.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">No payments yet.</p>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {payments.map((payment) => (
            <li key={payment.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{payment.payee}</p>
                <p className="truncate font-mono text-xs text-gray-500 dark:text-gray-400">{payment.reference}</p>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-gray-900 dark:text-white">
                {formatCurrency(payment.amount, payment.currency)}
              </span>
              <Badge variant={payment.status === 'completed' ? 'success' : payment.status === 'failed' ? 'danger' : 'warning'} size="sm">
                {payment.status}
              </Badge>
              <time dateTime={payment.at} className="hidden shrink-0 text-xs text-gray-400 sm:block">
                {formatDateTime(payment.at)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </CardContent>
  </Card>
);

PaymentHistory.propTypes = {
  payments: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired, payee: PropTypes.string.isRequired, amount: PropTypes.number.isRequired,
    currency: PropTypes.string, reference: PropTypes.string.isRequired, status: PropTypes.string, at: PropTypes.string,
  })),
};

export { PaymentHistory };
export default PaymentHistory;
