import { useState } from 'react';
import PropTypes from 'prop-types';
import { Lock, Unlock, AlertTriangle, Check } from 'lucide-react';

import { Button } from '../../common/Button';
import { Switch } from '../../common/Switch';
import { Alert } from '../../common/Alert';
import { Card as UiCard } from '../../common/Card';

/**
 * Per-card controls: freeze, and the four payment channels.
 *
 * Previously `export const CardControls = () => <div>CardControls</div>;` — a
 * placeholder rendering its own name. The Cards area therefore had controls in
 * the design and none in the product, which is worse than no controls: it
 * implies a capability that does not exist.
 *
 * Freeze is optimistic in the UI and confirmed by the API. Every channel toggle
 * is a separate switch rather than one "security mode", because turning off
 * international payments is the single most effective control for someone who
 * does not travel, and it should not require giving up contactless.
 */
const CHANNELS = [
  { key: 'contactless', label: 'Contactless', hint: 'Tap to pay at terminals' },
  { key: 'online', label: 'Online payments', hint: 'E-commerce and in-app purchases' },
  { key: 'international', label: 'International', hint: 'Transactions outside your home country' },
  { key: 'atm', label: 'ATM withdrawals', hint: 'Cash withdrawal at ATMs' },
];

const CardControls = ({ card, onUpdate, busy = false }) => {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState(null);

  if (!card) {
    return (
      <UiCard className="p-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">Select a card to manage its controls.</p>
      </UiCard>
    );
  }

  const frozen = card.status === 'frozen';
  const limits = card.limits || {};
  const working = pending || busy;

  const commit = async (patch, description) => {
    setPending(true);
    setMessage(null);
    try {
      await onUpdate?.(card.id, patch);
      setMessage({ tone: 'success', text: `${description} — applied immediately.` });
    } catch (error) {
      setMessage({ tone: 'danger', text: error?.apiMessage || error?.message || 'That change could not be saved.' });
    } finally {
      setPending(false);
    }
  };

  const toggleFreeze = () =>
    commit(
      { status: frozen ? 'active' : 'frozen' },
      frozen ? 'Card unfrozen' : 'Card frozen'
    );

  const toggleChannel = (key, next) =>
    commit({ limits: { ...limits, [key]: next } }, `${CHANNELS.find((c) => c.key === key)?.label} ${next ? 'enabled' : 'disabled'}`);

  return (
    <UiCard className="p-5 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Card controls</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {card.label} ···· {card.last4}
          </p>
        </div>
        <Button
          variant={frozen ? 'primary' : 'danger'}
          size="sm"
          onClick={toggleFreeze}
          disabled={working}
          leftIcon={frozen ? Unlock : Lock}
        >
          {frozen ? 'Unfreeze' : 'Freeze'}
        </Button>
      </div>

      {message && (
        <Alert variant={message.tone} icon={message.tone === 'success' ? Check : AlertTriangle}>
          {message.text}
        </Alert>
      )}

      {frozen && (
        <Alert variant="warning" icon={AlertTriangle}>
          This card is frozen. New authorisations are declined; transactions already
          authorised will still settle.
        </Alert>
      )}

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {CHANNELS.map((channel) => (
          <div key={channel.key} className="flex items-center justify-between gap-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{channel.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{channel.hint}</p>
            </div>
            <Switch
              checked={Boolean(limits[channel.key])}
              onChange={(next) => toggleChannel(channel.key, next)}
              disabled={working || frozen}
              label={channel.label}
              size="sm"
            />
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Changes take effect immediately and are enforced by the issuer, not by this
        app. Controls are a convenience — the server re-checks every limit when a
        transaction is authorised.
      </p>
    </UiCard>
  );
};

CardControls.propTypes = {
  card: PropTypes.object,
  onUpdate: PropTypes.func,
  busy: PropTypes.bool,
};

export { CardControls };
export default CardControls;
