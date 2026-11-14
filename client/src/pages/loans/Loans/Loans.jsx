import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';

import axiosInstance from '@/api/axiosInstance';
import { Alert } from '@/components/common/Alert';
import { Spinner } from '@/components/common/Spinner';
import { Badge } from '@/components/common/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/Tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/Card';
import { LoanStatus } from '@/components/loans/LoanStatus';
import { EMISchedule } from '@/components/loans/EMISchedule';
import { LoanComparison } from '@/components/loans/LoanComparison';
import { LoanCalculator } from '@/components/loans/LoanCalculator';
import { LoanApplicationForm } from '@/components/forms/LoanApplicationForm';
import { formatCurrency, formatDate } from '@/utils/formatters';

/**
 * Loans.
 *
 * Quotes are labelled indicative throughout. An application performs a **soft**
 * credit check, which leaves no footprint on the customer's file; a hard enquiry
 * happens later and only with explicit consent. That distinction is a regulatory
 * obligation, not a nicety, so it is stated on the page rather than buried in terms.
 */
const Loans = () => {
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [notice, setNotice] = useState(null);

  // The calculator's "Apply for this loan" arrives here as ?tab=apply&amount=…&months=…
  // so the figures the user dialled in prefill the form instead of being discarded.
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'mine';
  const prefill = {
    ...(searchParams.get('amount') ? { amount: searchParams.get('amount') } : {}),
    ...(searchParams.get('months') ? { termMonths: searchParams.get('months') } : {}),
  };

  const { data, isLoading } = useQuery({
    queryKey: ['loans'],
    queryFn: async () => (await axiosInstance.get('/loans')).data,
  });

  const loans = data?.loans ?? [];
  const products = data?.products ?? [];
  const summary = data?.summary ?? null;
  const selected = loans.find((l) => l.id === selectedLoanId) ?? loans.find((l) => l.status === 'active') ?? loans[0] ?? null;

  const { data: scheduleData, isLoading: scheduleLoading } = useQuery({
    queryKey: ['loan-schedule', selected?.id],
    enabled: Boolean(selected?.id),
    queryFn: async () => (await axiosInstance.get(`/loans/${selected.id}/schedule`)).data,
  });

  const apply = useMutation({
    mutationFn: async (values) => (await axiosInstance.post('/loans/applications', values)).data,
    onSuccess: (result) => {
      setNotice({
        tone: 'success',
        text: `Application ${result.application.id} submitted. A soft check was used, so your credit file is unaffected. A decision is expected by ${formatDate(result.application.decisionBy)}.`,
      });
    },
    onError: (error) => setNotice({ tone: 'danger', text: error.apiMessage || 'The application could not be submitted.' }),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Loans</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {summary ? `${summary.active} active · ${formatCurrency(summary.outstanding)} outstanding` : 'No loans'}
          </p>
        </div>
        {summary?.nextDue && (
          <Badge variant="warning">Next payment {formatDate(summary.nextDue.nextDueAt)}</Badge>
        )}
      </header>

      {notice && <Alert variant={notice.tone}>{notice.text}</Alert>}

      <Tabs defaultValue={activeTab}>
        <TabsList>
          <TabsTrigger value="mine">My loans</TabsTrigger>
          <TabsTrigger value="schedule">Repayment schedule</TabsTrigger>
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="compare">Compare</TabsTrigger>
          <TabsTrigger value="apply">Apply</TabsTrigger>
        </TabsList>

        <TabsContent value="mine" className="space-y-4">
          {loans.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
              <FileText className="mx-auto h-10 w-10 text-gray-400" aria-hidden="true" />
              <h2 className="mt-4 font-semibold text-gray-900 dark:text-white">No loans</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Compare products and apply — a soft check leaves no footprint.
              </p>
            </div>
          ) : (
            <>
              <ul className="flex flex-wrap gap-2">
                {loans.map((loan) => (
                  <li key={loan.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedLoanId(loan.id)}
                      aria-current={selected?.id === loan.id}
                      className={
                        'rounded-lg border px-3 py-1.5 text-sm transition-colors ' +
                        (selected?.id === loan.id
                          ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300')
                      }
                    >
                      {loan.product} · {loan.status}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: 'Outstanding', value: formatCurrency(selected?.outstanding ?? 0) },
                  { label: 'Monthly instalment', value: formatCurrency(selected?.emi ?? 0) },
                  { label: 'Interest rate', value: `${selected?.annualRate ?? 0}% p.a.` },
                ].map((stat) => (
                  <Card key={stat.label}>
                    <CardContent className="p-5">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                      <p className="mt-1 text-xl font-bold tabular-nums text-gray-900 dark:text-white">{stat.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <LoanStatus loan={selected} />
            </>
          )}
        </TabsContent>

        <TabsContent value="schedule">
          {scheduleLoading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : (
            <>
              {scheduleData && (
                <Card className="mb-4">
                  <CardContent className="grid gap-4 p-5 sm:grid-cols-3">
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Instalment</p><p className="text-lg font-bold tabular-nums text-gray-900 dark:text-white">{formatCurrency(scheduleData.emi)}</p></div>
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Total interest</p><p className="text-lg font-bold tabular-nums text-gray-900 dark:text-white">{formatCurrency(scheduleData.totalInterest)}</p></div>
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Total payable</p><p className="text-lg font-bold tabular-nums text-gray-900 dark:text-white">{formatCurrency(scheduleData.totalPayable)}</p></div>
                  </CardContent>
                </Card>
              )}
              {/* EMISchedule reads `dueAt`; the API returns `dueDate`. Unmapped,
                  every row rendered "Invalid Date" with no error anywhere. */}
              <EMISchedule
                rows={(scheduleData?.schedule ?? []).map((row) => ({ ...row, dueAt: row.dueAt || row.dueDate }))}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="calculator">
          <LoanCalculator />
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Indicative only. Your actual rate depends on underwriting and is confirmed
            in an offer, never by a calculator.
          </p>
        </TabsContent>

        <TabsContent value="compare">
          {/* LoanComparison reads `apr`; the API returns a rate range. */}
          <LoanComparison products={products.map((p) => ({ ...p, apr: p.rateFrom, minApr: p.rateFrom, maxApr: p.rateTo }))} />
        </TabsContent>

        <TabsContent value="apply">
          <Card>
            <CardHeader>
              <CardTitle>Apply for a loan</CardTitle>
              <CardDescription>
                A soft credit check leaves no footprint on your file. A hard enquiry
                happens only later, and only with your explicit consent.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoanApplicationForm
                products={products}
                initialValues={prefill}
                onSubmit={(values) => apply.mutate(values)}
                isSubmitting={apply.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export { Loans };
export default Loans;
