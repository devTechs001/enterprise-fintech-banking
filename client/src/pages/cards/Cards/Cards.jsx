import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Plus } from 'lucide-react';

import axiosInstance from '@/api/axiosInstance';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { Spinner } from '@/components/common/Spinner';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/common/Modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/Tabs';
import { CardCarousel } from '@/components/cards/CardCarousel';
import { CardControls } from '@/components/cards/CardControls';
import { CardTransactions } from '@/components/cards/CardTransactions';
import { CardApplicationForm } from '@/components/forms/CardApplicationForm';

/**
 * Cards.
 *
 * Was a placeholder directory: `CardCarousel.jsx` re-exported itself, and
 * `CardControls` / `CardTransactions` were one-line stubs rendering their own
 * names. All three are real components now.
 *
 * A card number is never shown in full and a CVV is never rendered — the server
 * does not store one at all, since retaining it after authorisation is not
 * permitted under PCI DSS 3.2.
 */
const Cards = () => {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [error, setError] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['cards'],
    queryFn: async () => (await axiosInstance.get('/cards')).data,
  });
  const cards = data?.cards ?? [];
  const selected = cards.find((c) => c.id === selectedId) ?? cards[0] ?? null;

  const { data: txnData, isLoading: txnLoading } = useQuery({
    queryKey: ['transactions', 'card', selected?.id],
    enabled: Boolean(selected),
    queryFn: async () => (await axiosInstance.get('/transactions', { params: { limit: 12 } })).data,
  });

  const updateCard = useMutation({
    mutationFn: async ({ id, patch }) => (await axiosInstance.patch(`/cards/${id}`, patch)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cards'] }),
    onError: (err) => setError(err.apiMessage || err.message || 'That change could not be saved.'),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cards</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {cards.length} card{cards.length === 1 ? '' : 's'} · freeze instantly, or switch a payment channel off
          </p>
        </div>
        <Button leftIcon={Plus} onClick={() => setApplyOpen(true)}>Apply for a card</Button>
      </header>

      {error && <Alert variant="danger">{error}</Alert>}

      {cards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
          <CreditCard className="mx-auto h-10 w-10 text-gray-400" aria-hidden="true" />
          <h2 className="mt-4 font-semibold text-gray-900 dark:text-white">No cards yet</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            A virtual card can be issued instantly and carries its own limit.
          </p>
          <Button className="mt-4" onClick={() => setApplyOpen(true)}>Apply for a card</Button>
        </div>
      ) : (
        <Tabs defaultValue="manage">
          <TabsList>
            <TabsTrigger value="manage">Manage</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="manage" className="space-y-6">
            <CardCarousel cards={cards} selectedId={selected?.id} onSelect={(card) => setSelectedId(card.id)} />
            <CardControls
              card={selected}
              busy={updateCard.isPending}
              onUpdate={(id, patch) => updateCard.mutate({ id, patch })}
            />
          </TabsContent>

          <TabsContent value="activity">
            <CardTransactions
              transactions={txnData?.transactions ?? []}
              cardLabel={selected ? `${selected.label} ···· ${selected.last4}` : undefined}
              isLoading={txnLoading}
            />
          </TabsContent>
        </Tabs>
      )}

      <Modal isOpen={applyOpen} onClose={() => setApplyOpen(false)} title="Apply for a card">
        <ModalHeader>Apply for a card</ModalHeader>
        <ModalBody>
          <CardApplicationForm
            onSuccess={() => {
              setApplyOpen(false);
              queryClient.invalidateQueries({ queryKey: ['cards'] });
            }}
            onCancel={() => setApplyOpen(false)}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setApplyOpen(false)}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export { Cards };
export default Cards;
