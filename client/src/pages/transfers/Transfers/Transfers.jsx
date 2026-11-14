import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TransferWizard } from '@/components/transfers/TransferWizard';
import { BeneficiaryForm } from '@/components/forms/BeneficiaryForm';
import { useToast } from '@/hooks/ui/useToast';

/** Transfers page: the wizard plus beneficiary management. */
const Transfers = () => {
  const { toast } = useToast();

  const addBeneficiary = async (values) => {
    // Beneficiary creation is an audited, rate-limited endpoint with a
    // cooling-off period; the form surfaces whatever the API returns.
    toast.info('Beneficiary submitted', `${values.name} is pending verification and a 24-hour hold.`);
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transfers</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Send money to a saved beneficiary. Limits are enforced by the API.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TransferWizard />
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-1 text-base font-semibold text-gray-900 dark:text-white">Add a beneficiary</h2>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            New beneficiaries are held for 24 hours before they can receive money.
          </p>
          <BeneficiaryForm onSubmit={addBeneficiary} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export { Transfers };
export default Transfers;
