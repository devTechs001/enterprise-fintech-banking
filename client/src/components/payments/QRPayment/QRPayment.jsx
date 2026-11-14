import { useState } from 'react';
import PropTypes from 'prop-types';
import { QrCode, Camera, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/Card';
import { Alert } from '@/components/common/Alert';

/**
 * QR payments.
 *
 * Scanning is gated behind an explicit confirmation showing the resolved payee
 * and amount: a QR code is attacker-controlled input, so the decoded payload is
 * never paid without the user seeing what it resolved to.
 */
const QRPayment = ({ onScan }) => {
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);

  const simulateScan = async () => {
    setError(null);
    try {
      const payload = await onScan?.();
      if (payload) setPending(payload);
    } catch (err) {
      setError(err?.message || 'Could not read that code.');
    }
  };

  return (
    <Card>
      <CardHeader className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10">
          <QrCode className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <CardTitle>Scan to pay</CardTitle>
          <CardDescription>Pay a merchant code, then confirm the resolved details.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <Alert variant="danger" title="Scan failed" description={error} />}
        {pending && (
          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
            <p className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
              <ShieldCheck className="h-4 w-4 text-success-600" aria-hidden="true" />
              Verify before paying
            </p>
            <dl className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-gray-500">Payee</dt><dd className="font-medium text-gray-900 dark:text-white">{pending.payee}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-gray-500">Amount</dt><dd className="font-semibold tabular-nums text-gray-900 dark:text-white">{pending.amount?.toLocaleString()}</dd></div>
            </dl>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => { setPending(null); }}>Confirm and pay</Button>
              <Button size="sm" variant="ghost" onClick={() => setPending(null)}>Cancel</Button>
            </div>
          </div>
        )}
        <Button variant="outline" onClick={simulateScan} leftIcon={Camera}>Scan a code</Button>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Never scan a code from an untrusted source. QR payloads are attacker-controlled input.
        </p>
      </CardContent>
    </Card>
  );
};

QRPayment.propTypes = { onScan: PropTypes.func };

export { QRPayment };
export default QRPayment;
