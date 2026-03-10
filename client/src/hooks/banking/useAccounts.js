import { useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector, useDispatch } from 'react-redux';
import { accountService } from '@/services/api/accountService';
import { setAccounts, updateAccount, selectAccounts } from '@/store/slices/accountSlice';
import { useToast } from '@/hooks/ui/useToast';

const QUERY_KEYS = {
  accounts: ['accounts'],
  account: (id) => ['accounts', id],
  accountBalance: (id) => ['accounts', id, 'balance'],
  accountTransactions: (id) => ['accounts', id, 'transactions'],
};

export const useAccounts = (options = {}) => {
  const { enabled = true, refetchInterval = 30000 } = options;
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const cachedAccounts = useSelector(selectAccounts);

  const { data: accountsData, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: QUERY_KEYS.accounts,
    queryFn: async () => {
      const response = await accountService.getAccounts();
      dispatch(setAccounts(response.data.accounts));
      return response.data;
    },
    enabled,
    staleTime: 1000 * 60 * 5,
    refetchInterval,
    refetchOnWindowFocus: true,
    retry: 3,
    onError: (err) => {
      toast({ title: 'Error', description: err.message || 'Failed to fetch accounts', variant: 'error' });
    },
  });

  const totals = useMemo(() => {
    const accounts = accountsData?.accounts || cachedAccounts || [];
    return accounts.reduce(
      (acc, account) => {
        const balance = parseFloat(account.balance) || 0;
        acc.totalBalance += balance;
        switch (account.accountType) {
          case 'checking': acc.checkingBalance += balance; break;
          case 'savings': acc.savingsBalance += balance; break;
          case 'investment': acc.investmentBalance += balance; break;
          case 'credit': acc.creditBalance += balance; break;
        }
        return acc;
      },
      { totalBalance: 0, checkingBalance: 0, savingsBalance: 0, investmentBalance: 0, creditBalance: 0 }
    );
  }, [accountsData?.accounts, cachedAccounts]);

  const primaryAccount = useMemo(() => {
    const accounts = accountsData?.accounts || cachedAccounts || [];
    return accounts.find((acc) => acc.isPrimary) || accounts[0];
  }, [accountsData?.accounts, cachedAccounts]);

  const getAccountsByType = useCallback((type) => {
    const accounts = accountsData?.accounts || cachedAccounts || [];
    return accounts.filter((acc) => acc.accountType === type);
  }, [accountsData?.accounts, cachedAccounts]);

  const createAccountMutation = useMutation({
    mutationFn: accountService.createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries(QUERY_KEYS.accounts);
      toast({ title: 'Success', description: 'Account created successfully', variant: 'success' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message || 'Failed to create account', variant: 'error' });
    },
  });

  const refreshBalances = useCallback(async () => {
    await queryClient.invalidateQueries(QUERY_KEYS.accounts);
    return refetch();
  }, [queryClient, refetch]);

  return {
    accounts: accountsData?.accounts || cachedAccounts || [],
    totalBalance: totals.totalBalance,
    checkingBalance: totals.checkingBalance,
    savingsBalance: totals.savingsBalance,
    investmentBalance: totals.investmentBalance,
    creditBalance: totals.creditBalance,
    primaryAccount,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    refreshBalances,
    getAccountsByType,
    createAccount: createAccountMutation.mutateAsync,
    isCreating: createAccountMutation.isPending,
  };
};

export const useAccount = (accountId, options = {}) => {
  const { enabled = true } = options;
  const queryClient = useQueryClient();

  const { data: accountData, isLoading, isError, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.account(accountId),
    queryFn: async () => {
      const response = await accountService.getAccountById(accountId);
      return response.data;
    },
    enabled: enabled && !!accountId,
    staleTime: 1000 * 60 * 2,
  });

  const refreshBalance = useCallback(async () => {
    const response = await accountService.getAccountBalance(accountId);
    queryClient.setQueryData(QUERY_KEYS.account(accountId), (old) => ({
      ...old,
      account: { ...old?.account, balance: response.data.balance, availableBalance: response.data.availableBalance },
    }));
    return response.data;
  }, [accountId, queryClient]);

  return { account: accountData?.account, isLoading, isError, error, refetch, refreshBalance };
};

export default useAccounts;
