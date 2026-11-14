import PropTypes from 'prop-types';
import { TransferWizard } from '@/components/transfers/TransferWizard';

/**
 * Transfer form.
 *
 * Thin wrapper kept for the existing `@/components/forms` import path. The real
 * implementation is the multi-step `TransferWizard`, which handles account
 * selection, beneficiary choice, amount limits and review.
 */
const TransferForm = ({ onComplete }) => <TransferWizard onComplete={onComplete} />;

TransferForm.propTypes = { onComplete: PropTypes.func };

export { TransferForm };
export default TransferForm;
