import { useQuery } from '@tanstack/react-query';
import { transactionService } from '@/services/api/transactionService';

const QUERY_KEYS = {
  transactions: ['transactions'],
  transaction: (id) => ['transactions', id],
};

export const useTransactions = (filters = {}) => {
  const { limit = 20, page = 1, ...otherFilters } = filters;

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: [QUERY_KEYS.transactions, filters],
    queryFn: async () => {
      const response = await transactionService.getTransactions({ limit, page, ...otherFilters });
      return response.data;
    },
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });

  return {
    transactions: data?.transactions || [],
    pagination: data?.pagination,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  };
};

export const useTransaction = (transactionId) => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.transaction(transactionId),
    queryFn: async () => {
      const response = await transactionService.getTransactionById(transactionId);
      return response.data;
    },
    enabled: !!transactionId,
  });

  return { transaction: data?.transaction, isLoading, isError, error, refetch };
};

export default useTransactions;
