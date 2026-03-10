import { useQuery } from '@tanstack/react-query';
import { cardService } from '@/services/api/cardService';

const QUERY_KEYS = {
  cards: ['cards'],
  card: (id) => ['cards', id],
};

export const useCards = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.cards,
    queryFn: async () => {
      const response = await cardService.getCards();
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const cards = data?.cards || [];
  const primaryCard = cards.find((c) => c.isPrimary) || cards[0];

  return {
    cards,
    primaryCard,
    isLoading,
    isError,
    error,
    refetch,
  };
};

export default useCards;
