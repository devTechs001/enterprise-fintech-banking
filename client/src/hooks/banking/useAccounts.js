import { useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector, useDispatch } from 'react-redux';
import { accountService } from '@/services/api/accountService';
import { 
  setAccounts, 
  updateAccount, 
  selectAccounts 
} from '@/store/slices/accountSlice';
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

  // Fetch all accounts
  const {
    data: accountsData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: QUERY_KEYS.accounts,
    queryFn: async () => {
      const response = await accountService.getAccounts();
      dispatch(setAccounts(response.data.accounts));
      return response.data;
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval,
    refetchOnWindowFocus: true,
    retry: 3,
    onError: (err) => {
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch accounts',
        variant: 'error',
      });
    },
  });

  // Calculate totals
  const totals = useMemo(() => {
    const accounts = accountsData?.accounts || cachedAccounts || [];
    return accounts.reduce(
      (acc, account) => {
        const balance = parseFloat(account.balance) || 0;
        acc.totalBalance += balance;
        
        switch (account.accountType) {
          case 'checking':
            acc.checkingBalance += balance;
            break;
          case 'savings':
            acc.savingsBalance += balance;
            break;
          case 'investment':
            acc.investmentBalance += balance;
            break;
          case 'credit':
            acc.creditBalance += balance;
            break;
        }
        
        return acc;
      },
      {
        totalBalance: 0,
        checkingBalance: 0,
        savingsBalance: 0,
        investmentBalance: 0,
        creditBalance: 0,
      }
    );
  }, [accountsData?.accounts, cachedAccounts]);

  // Get primary account
  const primaryAccount = useMemo(() => {
    const accounts = accountsData?.accounts || cachedAccounts || [];
    return accounts.find((acc) => acc.isPrimary) || accounts[0];
  }, [accountsData?.accounts, cachedAccounts]);

  // Get accounts by type
  const getAccountsByType = useCallback((type) => {
    const accounts = accountsData?.accounts || cachedAccounts || [];
    return accounts.filter((acc) => acc.accountType === type);
  }, [accountsData?.accounts, cachedAccounts]);

  // Create account mutation
  const createAccountMutation = useMutation({
    mutationFn: accountService.createAccount,
    onSuccess: (response) => {
      queryClient.invalidateQueries(QUERY_KEYS.accounts);
      toast({
        title: 'Success',
        description: 'Account created successfully',
        variant: 'success',
      });
      return response.data;
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create account',
        variant: 'error',
      });
    },
  });

  // Update account mutation
  const updateAccountMutation = useMutation({
    mutationFn: ({ accountId, data }) => 
      accountService.updateAccount(accountId, data),
    onSuccess: (response, { accountId }) => {
      queryClient.invalidateQueries(QUERY_KEYS.accounts);
      queryClient.invalidateQueries(QUERY_KEYS.account(accountId));
      dispatch(updateAccount(response.data.account));
      toast({
        title: 'Success',
        description: 'Account updated successfully',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update account',
        variant: 'error',
      });
    },
  });

  // Freeze/Unfreeze account mutation
  const toggleFreezeMutation = useMutation({
    mutationFn: ({ accountId, freeze }) => 
      freeze 
        ? accountService.freezeAccount(accountId) 
        : accountService.unfreezeAccount(accountId),
    onSuccess: (response, { accountId, freeze }) => {
      queryClient.invalidateQueries(QUERY_KEYS.accounts);
      queryClient.invalidateQueries(QUERY_KEYS.account(accountId));
      toast({
        title: 'Success',
        description: `Account ${freeze ? 'frozen' : 'unfrozen'} successfully`,
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update account status',
        variant: 'error',
      });
    },
  });

  // Close account mutation
  const closeAccountMutation = useMutation({
    mutationFn: accountService.closeAccount,
    onSuccess: () => {
      queryClient.invalidateQueries(QUERY_KEYS.accounts);
      toast({
        title: 'Success',
        description: 'Account closed successfully',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to close account',
        variant: 'error',
      });
    },
  });

  // Refresh balances
  const refreshBalances = useCallback(async () => {
    await queryClient.invalidateQueries(QUERY_KEYS.accounts);
    return refetch();
  }, [queryClient, refetch]);

  return {
    // Data
    accounts: accountsData?.accounts || cachedAccounts || [],
    totalBalance: totals.totalBalance,
    checkingBalance: totals.checkingBalance,
    savingsBalance: totals.savingsBalance,
    investmentBalance: totals.investmentBalance,
    creditBalance: totals.creditBalance,
    primaryAccount,
    
    // State
    isLoading,
    isFetching,
    isError,
    error,
    
    // Methods
    refetch,
    refreshBalances,
    getAccountsByType,
    
    // Mutations
    createAccount: createAccountMutation.mutateAsync,
    updateAccount: updateAccountMutation.mutateAsync,
    toggleFreeze: toggleFreezeMutation.mutateAsync,
    closeAccount: closeAccountMutation.mutateAsync,
    
    // Mutation states
    isCreating: createAccountMutation.isPending,
    isUpdating: updateAccountMutation.isPending,
    isToggling: toggleFreezeMutation.isPending,
    isClosing: closeAccountMutation.isPending,
  };
};

// Hook for single account
export const useAccount = (accountId, options = {}) => {
  const { enabled = true } = options;
  const queryClient = useQueryClient();

  const {
    data: accountData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.account(accountId),
    queryFn: async () => {
      const response = await accountService.getAccountById(accountId);
      return response.data;
    },
    enabled: enabled && !!accountId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const refreshBalance = useCallback(async () => {
    const response = await accountService.getAccountBalance(accountId);
    queryClient.setQueryData(
      QUERY_KEYS.account(accountId),
      (old) => ({
        ...old,
        account: {
          ...old?.account,
          balance: response.data.balance,
          availableBalance: response.data.availableBalance,
        },
      })
    );
    return response.data;
  }, [accountId, queryClient]);

  return {
    account: accountData?.account,
    isLoading,
    isError,
    error,
    refetch,
    refreshBalance,
  };
};

export default useAccounts;