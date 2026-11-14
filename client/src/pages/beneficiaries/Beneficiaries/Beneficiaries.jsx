import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock, Plus, Users } from 'lucide-react';

import axiosInstance from '@/api/axiosInstance';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { Badge } from '@/components/common/Badge';
import { Spinner } from '@/components/common/Spinner';
import { Modal, ModalBody, ModalHeader } from '@/components/common/Modal';
import { BeneficiaryForm } from '@/components/forms/BeneficiaryForm';
import { formatDate } from '@/utils/formatters';

/**
 * Beneficiaries.
 *
 * The `BeneficiaryForm` component already explained the 24-hour cooling-off
 * period; there was no page to put it on.
 *
 * A new payee enters `pending` and cannot receive money until it is confirmed out
 * of band. That is deliberate: an attacker who has taken over a session should not
 * be able to add their own account and drain it in the same minute.
 */
const Beneficiaries = () => {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['beneficiaries'],
    queryFn: async () => (await axiosInstance.get('/beneficiaries')).data,
  });
  const beneficiaries = data?.beneficiaries ?? [];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Beneficiaries</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {beneficiaries.length} saved payee{beneficiaries.length === 1 ? '' : 's'}
          </p>
        </div>
        <Button leftIcon={Plus} onClick={() => setAddOpen(true)}>Add beneficiary</Button>
      </header>

      <Alert variant="info" icon={Clock}>
        New payees are held for 24 hours and confirmed out of band before they can
        receive money. This limits what an attacker can do in a hijacked session.
      </Alert>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : beneficiaries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
          <Users className="mx-auto h-10 w-10 text-gray-400" aria-hidden="true" />
          <h2 className="mt-4 font-semibold text-gray-900 dark:text-white">No saved payees</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Add someone you pay often to skip retyping their details.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {beneficiaries.map((b) => (
            <li key={b.id} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900 dark:text-white">{b.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {b.bankName || 'Bank'} · ···· {String(b.accountNumber || '').slice(-4)}
                  </p>
                </div>
                <Badge variant={b.status === 'active' ? 'success' : 'warning'}>
                  {b.status === 'active' ? 'Active' : 'Cooling off'}
                </Badge>
              </div>
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                {b.lastPaidAt ? `Last paid ${formatDate(b.lastPaidAt)}` : 'Never paid'}
                {b.status !== 'active' && b.activatedAt ? ` · available ${formatDate(b.activatedAt)}` : ''}
              </p>
            </li>
          ))}
        </ul>
      )}

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add beneficiary">
        <ModalHeader>Add a beneficiary</ModalHeader>
        <ModalBody>
          <BeneficiaryForm
            onSuccess={() => {
              setAddOpen(false);
              queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
            }}
            onCancel={() => setAddOpen(false)}
          />
        </ModalBody>
      </Modal>
    </div>
  );
};

export { Beneficiaries };
export default Beneficiaries;
