import PropTypes from 'prop-types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/Card';
import { formatCurrency } from '@/utils/formatters';

/** Amortisation schedule: interest vs principal split per instalment. */
const EMISchedule = ({ rows = [] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Repayment schedule</CardTitle>
      <CardDescription>Interest and principal split per instalment.</CardDescription>
    </CardHeader>
    <CardContent>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">No schedule available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500 dark:border-gray-700">
                <th className="py-2 pr-3 font-medium">#</th>
                <th className="py-2 pr-3 font-medium">Due</th>
                <th className="py-2 pr-3 text-right font-medium">Principal</th>
                <th className="py-2 pr-3 text-right font-medium">Interest</th>
                <th className="py-2 text-right font-medium">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {rows.map((row) => (
                <tr key={row.period}>
                  <td className="py-2 pr-3 tabular-nums text-gray-500">{row.period}</td>
                  <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">{new Date(row.dueAt).toLocaleDateString()}</td>
                  <td className="py-2 pr-3 text-right tabular-nums dark:text-white">{formatCurrency(row.principal)}</td>
                  <td className="py-2 pr-3 text-right tabular-nums text-gray-500">{formatCurrency(row.interest)}</td>
                  <td className="py-2 text-right tabular-nums font-medium dark:text-white">{formatCurrency(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CardContent>
  </Card>
);

EMISchedule.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.shape({
    period: PropTypes.number.isRequired, dueAt: PropTypes.string.isRequired, principal: PropTypes.number.isRequired,
    interest: PropTypes.number.isRequired, balance: PropTypes.number.isRequired,
  })),
};

export { EMISchedule };
export default EMISchedule;
