import PropTypes from 'prop-types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { ProgressBar } from '@/components/common/ProgressBar';
import { formatCurrency } from '@/utils/formatters';

/** Repayment progress for an active loan. */
const LoanStatus = ({ loan }) => {
  if (!loan) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">No active loans.</CardContent>
      </Card>
    );
  }
  const paid = loan.principal - loan.outstanding;
  const percent = Math.min(100, Math.round((paid / loan.principal) * 100));
  const tone = loan.status === 'current' ? 'success' : loan.status === 'overdue' ? 'danger' : 'warning';

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle>{loan.name}</CardTitle>
          <CardDescription>Next payment {new Date(loan.nextPaymentAt).toLocaleDateString()}</CardDescription>
        </div>
        <Badge variant={tone}>{loan.status}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <ProgressBar value={percent} variant={tone} size="md" />
        <dl className="grid grid-cols-3 gap-3 text-sm">
          <div><dt className="text-xs text-gray-500">Principal</dt><dd className="font-semibold tabular-nums dark:text-white">{formatCurrency(loan.principal)}</dd></div>
          <div><dt className="text-xs text-gray-500">Outstanding</dt><dd className="font-semibold tabular-nums dark:text-white">{formatCurrency(loan.outstanding)}</dd></div>
          <div><dt className="text-xs text-gray-500">Repaid</dt><dd className="font-semibold tabular-nums text-success-600">{percent}%</dd></div>
        </dl>
      </CardContent>
    </Card>
  );
};

LoanStatus.propTypes = {
  loan: PropTypes.shape({
    name: PropTypes.string.isRequired, principal: PropTypes.number.isRequired, outstanding: PropTypes.number.isRequired,
    nextPaymentAt: PropTypes.string.isRequired, status: PropTypes.string,
  }),
};

export { LoanStatus };
export default LoanStatus;
