import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Download, Plus, Wallet } from 'lucide-react';

import axiosInstance from '@/api/axiosInstance';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { Spinner } from '@/components/common/Spinner';
import { AccountCard } from '@/components/banking/AccountCard';
import { TransactionList } from '@/components/banking/TransactionList';
import { formatCurrency } from '@/utils/formatters';

/**
 * Accounts.
 *
 * Listed in the sidebar as "coming soon" because there was no page — the
 * `AccountCard` and `TransactionList` components it composes already existed.
 *
 * Balances are shown as *available* alongside *current*, because a hold reserves
 * money that has been authorised but not settled, and quoting only the current
 * balance is how customers overdraw.
 */
const Accounts = () => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => (await axiosInstance.get('/accounts')).data,
  });

  const accounts = data?.accounts ?? [];
  const selected = accounts.find((a) => a.id === selectedId) ?? accounts[0] ?? null;

  const { data: txnData, isLoading: txnLoading } = useQuery({
    queryKey: ['account-transactions', selected?.id],
    enabled: Boolean(selected?.id),
    queryFn: async () => (await axiosInstance.get(`/accounts/${selected.id}/transactions`)).data,
  });

  const total = accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0);

  if (isLoading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Accounts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {accounts.length} account{accounts.length === 1 ? '' : 's'} · total balance{' '}
            <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(total)}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" leftIcon={Download} onClick={() => navigate('/analytics')}>
            Statements & analytics
          </Button>
          <Button leftIcon={Plus} onClick={() => navigate('/transfers')}>Move money</Button>
        </div>
      </header>

      {error && (
        <Alert variant="danger">
          Your accounts could not be loaded. {error.apiMessage || 'Please try again.'}
        </Alert>
      )}

      {accounts.length === 0 && !error ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
          <Wallet className="mx-auto h-10 w-10 text-gray-400" aria-hidden="true" />
          <h2 className="mt-4 font-semibold text-gray-900 dark:text-white">No accounts yet</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Open your first account to start moving money.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onTransfer={() => navigate('/transfers')}
              onViewDetails={() => setSelectedId(account.id)}
              showActions
            />
          ))}
        </div>
      )}

      {selected && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent activity — {selected.accountName || selected.name}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Available {formatCurrency(selected.availableBalance ?? selected.balance)} of{' '}
            {formatCurrency(selected.balance)}. A hold reserves money that is authorised
            but not yet settled.
          </p>
          {txnLoading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : (
            <TransactionList transactions={txnData?.transactions ?? []} />
          )}
        </section>
      )}
    </div>
  );
};

export { Accounts };
export default Accounts;
