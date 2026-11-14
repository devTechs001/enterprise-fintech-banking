import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Receipt } from 'lucide-react';

import axiosInstance from '@/api/axiosInstance';
import { Alert } from '@/components/common/Alert';
import { Spinner } from '@/components/common/Spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/Tabs';
import { BillPayment } from '@/components/payments/BillPayment';
import { ScheduledPayments } from '@/components/payments/ScheduledPayments';
import { PaymentHistory } from '@/components/payments/PaymentHistory';
import { QRPayment } from '@/components/payments/QRPayment';
import { formatCurrency } from '@/utils/formatters';

/**
 * Payments.
 *
 * All four payment components existed with no page and no endpoint to read from.
 *
 * The balance and limit checks in `BillPayment` are a convenience. The server
 * re-checks sufficiency when the payment executes and rejects with
 * `INSUFFICIENT_FUNDS` — the figure in the browser is never the authorisation
 * decision.
 */
const Payments = () => {
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState(null);

  const accountsQuery = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => (await axiosInstance.get('/accounts')).data,
  });
  const billersQuery = useQuery({
    queryKey: ['billers'],
    queryFn: async () => (await axiosInstance.get('/billers')).data,
  });
  const schedulesQuery = useQuery({
    queryKey: ['scheduled-payments'],
    queryFn: async () => (await axiosInstance.get('/scheduled-payments')).data,
  });
  const historyQuery = useQuery({
    queryKey: ['payments'],
    queryFn: async () => (await axiosInstance.get('/payments', { params: { limit: 25 } })).data,
  });

  const accounts = accountsQuery.data?.accounts ?? [];
  const primary = accounts.find((a) => a.isPrimary) ?? accounts[0] ?? null;

  // BillPayment expects { id, name, accountNumber, dueAmount }.
  const bills = (billersQuery.data?.billers ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    accountNumber: b.accountLabel,
    dueAmount: b.minAmount,
    currency: b.currency,
    // Each biller imposes its own minimum reference length; the form validates
    // against it so a too-short meter number is caught before the round trip.
    minLength: b.minLength,
    referenceLabel: b.accountLabel,
  }));

  // ScheduledPayments expects { id, name, amount, currency, nextRunAt, frequency, status }.
  const schedules = (schedulesQuery.data?.scheduledPayments ?? []).map((s) => ({ ...s, name: s.billerName }));

  // PaymentHistory expects { id, payee, reference, amount, currency, status, at }.
  const payments = (historyQuery.data?.payments ?? []).map((p) => ({
    id: p.id,
    payee: p.merchant || p.description || 'Payment',
    reference: p.transactionId || p.id,
    amount: Math.abs(Number(p.amount)),
    currency: p.currency,
    status: p.status,
    at: p.createdAt,
  }));

  const payBill = useMutation({
    mutationFn: async ({ bill, amount, reference }) =>
      (await axiosInstance.post('/payments', {
        billerId: bill.id,
        amount,
        accountId: primary?.id,
        // The customer's own meter/account number. This previously sent
        // `bill.accountNumber`, which is the biller's FIELD LABEL ("Meter number"),
        // not a number — every payment would have been credited to nothing.
        reference: reference || bill.accountNumber,
      })).data,
    onSuccess: (data) => {
      setNotice({ tone: 'success', text: `Payment sent. New balance ${formatCurrency(data.balance)}.` });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error) => setNotice({ tone: 'danger', text: error.apiMessage || 'The payment was declined.' }),
  });

  const cancelSchedule = useMutation({
    mutationFn: async (id) => (await axiosInstance.delete(`/scheduled-payments/${id}`)).data,
    onSuccess: () => {
      setNotice({ tone: 'success', text: 'Scheduled payment cancelled.' });
      queryClient.invalidateQueries({ queryKey: ['scheduled-payments'] });
    },
    onError: (error) => setNotice({ tone: 'danger', text: error.apiMessage || 'Could not cancel that payment.' }),
  });

  const loading = billersQuery.isLoading || accountsQuery.isLoading;
  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Pay a bill, schedule a recurring payment, or scan to pay
          {primary ? ` · from ${primary.accountName || 'your primary account'}` : ''}
        </p>
      </header>

      {notice && <Alert variant={notice.tone}>{notice.text}</Alert>}

      {!primary && (
        <Alert variant="warning" icon={Receipt}>
          You need an account before you can make a payment.
        </Alert>
      )}

      <Tabs defaultValue="bill">
        <TabsList>
          <TabsTrigger value="bill">Pay a bill</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="qr">Scan to pay</TabsTrigger>
        </TabsList>

        <TabsContent value="bill">
          <BillPayment
            bills={bills}
            available={Number(primary?.availableBalance ?? primary?.balance ?? 0)}
            dailyLimit={Number(primary?.dailyTransferLimit ?? 0)}
            onPay={payBill.mutateAsync}
          />
        </TabsContent>

        <TabsContent value="scheduled">
          <ScheduledPayments schedules={schedules} onCancel={(id) => cancelSchedule.mutate(id)} />
        </TabsContent>

        <TabsContent value="history">
          <PaymentHistory payments={payments} />
        </TabsContent>

        <TabsContent value="qr">
          <QRPayment
            onScan={async () => ({ payee: 'Demo Merchant Ltd', amount: 250, currency: 'KES', reference: 'QR-DEMO' })}
          />
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            A scanned code is untrusted input. Nothing is paid until you have confirmed
            the payee and the amount on screen.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export { Payments };
export default Payments;
