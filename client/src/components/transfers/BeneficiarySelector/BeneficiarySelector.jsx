import { useQuery } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import { Landmark } from 'lucide-react';

import { Skeleton } from '@/components/common/Skeleton';
import { axiosInstance } from '@/api/axiosInstance';
import { cn } from '@/utils/helpers';

const BENEFICIARIES_KEY = ['beneficiaries'];

/**
 * Beneficiary picker.
 *
 * Only pre-registered beneficiaries can be paid. Adding one is a separate,
 * audited flow with a cooling-off period, which is what stops a hijacked session
 * from draining an account to an attacker-controlled number.
 */
const BeneficiarySelector = ({ value, onChange, disabled }) => {
  const { data, isLoading } = useQuery({
    queryKey: BENEFICIARIES_KEY,
    queryFn: async () => (await axiosInstance.get('/beneficiaries')).data,
  });

  const beneficiaries = data?.beneficiaries ?? [];

  if (isLoading) return <Skeleton className="h-24 w-full rounded-xl" />;

  return (
    <fieldset disabled={disabled}>
      <legend className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Pay to</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {beneficiaries.map((b) => {
          const selected = value === b.id;
          return (
            <label
              key={b.id}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-colors',
                selected
                  ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-900/20'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
              )}
            >
              <input
                type="radio"
                name="beneficiary"
                value={b.id}
                checked={selected}
                onChange={() => onChange?.(b.id)}
                className="sr-only"
              />
              <span className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                selected ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
              )}>
                <Landmark className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-gray-900 dark:text-white">{b.name}</span>
                <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                  {b.bankName} · •••• {String(b.accountNumber).slice(-4)}
                </span>
              </span>
            </label>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Only saved beneficiaries can receive transfers. New beneficiaries require verification and a cooling-off period.
      </p>
    </fieldset>
  );
};

BeneficiarySelector.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
};

export { BeneficiarySelector };
export default BeneficiarySelector;
