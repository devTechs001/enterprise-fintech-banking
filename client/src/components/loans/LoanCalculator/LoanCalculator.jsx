import { useMemo, useState } from 'react';
import { Calculator } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { formatCurrency } from '@/utils/formatters';

/**
 * EMI calculator. Uses the same closed-form amortisation the server uses
 * (`shared/utils/calculators`), with a guard for the 0% case.
 */
const LoanCalculator = () => {
  const [principal, setPrincipal] = useState(25000);
  const [annualRate, setAnnualRate] = useState(11.5);
  const [months, setMonths] = useState(36);

  const result = useMemo(() => {
    const p = Number(principal);
    const r = Number(annualRate) / 12 / 100;
    const n = Number(months);
    if (!(p > 0) || !(n > 0) || Number.isNaN(r)) return null;
    const emi = r === 0 ? p / n : (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = emi * n;
    return { emi, total, interest: total - p };
  }, [principal, annualRate, months]);

  return (
    <Card>
      <CardHeader className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10">
          <Calculator className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <CardTitle>Loan calculator</CardTitle>
          <CardDescription>Indicative only — final terms are set at underwriting.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Input label="Amount" type="number" min="0" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
          <Input label="Annual rate %" type="number" min="0" step="0.1" value={annualRate} onChange={(e) => setAnnualRate(e.target.value)} />
          <Input label="Term (months)" type="number" min="1" value={months} onChange={(e) => setMonths(e.target.value)} />
        </div>
        {result ? (
          <dl className="grid gap-3 rounded-xl bg-gray-50 p-4 sm:grid-cols-3 dark:bg-gray-800/50">
            <div><dt className="text-xs text-gray-500 dark:text-gray-400">Monthly payment</dt><dd className="text-lg font-bold tabular-nums text-gray-900 dark:text-white">{formatCurrency(result.emi)}</dd></div>
            <div><dt className="text-xs text-gray-500 dark:text-gray-400">Total interest</dt><dd className="text-lg font-bold tabular-nums text-gray-900 dark:text-white">{formatCurrency(result.interest)}</dd></div>
            <div><dt className="text-xs text-gray-500 dark:text-gray-400">Total repayable</dt><dd className="text-lg font-bold tabular-nums text-gray-900 dark:text-white">{formatCurrency(result.total)}</dd></div>
          </dl>
        ) : (
          <p className="text-sm text-gray-500">Enter a positive amount and term.</p>
        )}
        <Button variant="outline">Apply for this loan</Button>
      </CardContent>
    </Card>
  );
};

export { LoanCalculator };
export default LoanCalculator;
