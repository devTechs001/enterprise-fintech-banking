import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ArrowLeft, ArrowRight, Send } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/Card';
import { Alert } from '@/components/common/Alert';
import { Input } from '@/components/common/Input';
import { Stepper } from '@/components/common/Stepper';
import { accountService } from '@/services/api/accountService';
import { transactionService } from '@/services/api/transactionService';
import { useToast } from '@/hooks/ui/useToast';
import { AmountInput } from '../AmountInput/AmountInput';
import { BeneficiarySelector } from '../BeneficiarySelector/BeneficiarySelector';
import { TransferConfirmation } from '../TransferConfirmation/TransferConfirmation';
import { TransferReceipt } from '../TransferReceipt/TransferReceipt';

const STEPS = [
  { id: 'account', title: 'Account' },
  { id: 'recipient', title: 'Recipient' },
  { id: 'amount', title: 'Amount' },
  { id: 'review', title: 'Review' },
];

/**
 * Transfer wizard.
 *
 * Client-side checks are convenience only — balance, daily limit, frozen status
 * and beneficiary validity are all re-enforced by the API inside a serialisable
 * database transaction. Nothing here is trusted.
 */
const TransferWizard = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [accountId, setAccountId] = useState('');
  const [beneficiaryId, setBeneficiaryId] = useState('');
  const [amount, setAmount] = useState(null);
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [receipt, setReceipt] = useState(null);

  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accountsData } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => (await accountService.getAccounts()).data,
  });

  const accounts = useMemo(
    () => (accountsData?.accounts ?? []).filter((a) => a.status === 'active' && !a.isFrozen && a.accountType !== 'credit'),
    [accountsData]
  );

  const selected = accounts.find((a) => a.id === accountId);

  const send = useMutation({
    mutationFn: async () =>
      (await transactionService.createTransaction({ accountId, beneficiaryId, amount, description })).data,
    onSuccess: (data) => {
      setReceipt(data.transaction);
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transfer sent', `${data.transaction.merchantName} will receive the funds.`);
      onComplete?.(data.transaction);
    },
    onError: (err) => {
      setError(err?.apiMessage || 'Transfer failed. Please try again.');
      toast.error('Transfer declined', err?.apiMessage || 'Please try again.');
    },
  });

  const canAdvance = [Boolean(accountId), Boolean(beneficiaryId), Boolean(amount && amount > 0), true][step];

  if (receipt) {
    return (
      <Card>
        <CardContent className="p-6">
          <TransferReceipt transaction={receipt} onDone={() => navigate('/dashboard')} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Make a transfer</CardTitle>
        <CardDescription>Send money to a saved beneficiary.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Stepper steps={STEPS} currentStep={step} />

        {error && <Alert variant="danger" title="Transfer declined" description={error} onDismiss={() => setError(null)} />}

        {step === 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Choose the account to debit</p>
            {accounts.length === 0 && (
              <Alert variant="info" title="No eligible accounts">Frozen or closed accounts cannot send transfers.</Alert>
            )}
            {accounts.map((account) => (
              <label
                key={account.id}
                className={
                  'flex cursor-pointer items-center justify-between gap-3 rounded-xl border-2 p-3 transition-colors ' +
                  (accountId === account.id
                    ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-900/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700')
                }
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="source-account"
                    className="sr-only"
                    checked={accountId === account.id}
                    onChange={() => setAccountId(account.id)}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-gray-900 dark:text-white">{account.accountName}</span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">•••• {String(account.accountNumber).slice(-4)} · {account.accountType}</span>
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-gray-900 dark:text-white">
                  {account.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </label>
            ))}
          </div>
        )}

        {step === 1 && <BeneficiarySelector value={beneficiaryId} onChange={setBeneficiaryId} />}

        {step === 2 && (
          <div className="space-y-4">
            <AmountInput
              value={amount ?? ''}
              onChange={setAmount}
              available={selected?.availableBalance ?? 0}
              currency={selected?.currency ?? 'USD'}
              dailyLimit={selected?.dailyTransferLimit}
            />
            <Input
              label="Reference (optional)"
              placeholder="e.g. November rent"
              value={description}
              maxLength={140}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
        )}

        {step === 3 && selected && (
          <TransferConfirmation
            from={`${selected.accountName} (•••• ${String(selected.accountNumber).slice(-4)})`}
            to={beneficiaryId ? 'Selected beneficiary' : '—'}
            amount={amount}
            reference={description || undefined}
          />
        )}

        <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || send.isPending} leftIcon={ArrowLeft}>
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canAdvance} rightIcon={ArrowRight}>Continue</Button>
          ) : (
            <Button onClick={() => send.mutate()} loading={send.isPending} leftIcon={Send}>Confirm transfer</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

TransferWizard.propTypes = { onComplete: PropTypes.func };

export { TransferWizard };
export default TransferWizard;
