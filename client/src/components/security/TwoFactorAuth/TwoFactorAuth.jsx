import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import { KeyRound, ShieldCheck, Copy, Check, Loader2, Smartphone } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/Card';
import { Alert } from '@/components/common/Alert';
import { Badge } from '@/components/common/Badge';
import { OTPInput } from '@/components/common/OTPInput';
import { authService } from '@/services/api/authService';
import { useToast } from '@/hooks/ui/useToast';
import { cn } from '@/utils/helpers';

/**
 * TOTP enrolment and removal.
 *
 * The API never returns a usable code — it returns the shared secret plus an
 * `otpauth://` URI for an authenticator app, and the user proves possession by
 * entering a live code. Disabling MFA also requires a live code, so a stolen
 * access token alone cannot weaken the account.
 */
const TwoFactorAuth = ({ enabled = false, method = 'authenticator', onChanged }) => {
  const { toast } = useToast();
  const [secret, setSecret] = useState(null);
  const [otpauthUrl, setOtpauthUrl] = useState('');
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState(null);

  const setup = useMutation({
    mutationFn: async () => (await authService.setupMfa()).data,
    onSuccess: (data) => {
      setSecret(data.secret);
      setOtpauthUrl(data.otpauthUrl);
      setCode('');
      setFormError(null);
      if (data.demoCurrentCode) {
        // Preview-only convenience: the mock exposes the live code so the flow
        // is clickable without a real authenticator app.
        setCode(data.demoCurrentCode);
      }
    },
    onError: () => toast.error('Could not start enrolment', 'Please try again.'),
  });

  const enable = useMutation({
    mutationFn: async (value) => (await authService.enableMfa(value)).data,
    onSuccess: () => {
      toast.success('Two-factor authentication enabled', 'Your account now requires a code at sign-in.');
      setSecret(null);
      setCode('');
      onChanged?.(true);
    },
    onError: (error) => {
      setFormError(error?.apiMessage || 'Invalid code.');
      setCode('');
    },
  });

  const disable = useMutation({
    mutationFn: async (value) => (await authService.disableMfa(value)).data,
    onSuccess: () => {
      toast.warning('Two-factor authentication disabled', 'Your account is now protected by password only.');
      setSecret(null);
      setCode('');
      onChanged?.(false);
    },
    onError: (error) => setFormError(error?.apiMessage || 'Invalid code.'),
  });

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Clipboard blocked', 'Copy the key manually from the field below.');
    }
  };

  const submit = (event) => {
    event.preventDefault();
    setFormError(null);
    if (code.replace(/\s/g, '').length !== 6) {
      setFormError('Enter the 6-digit code from your authenticator app.');
      return;
    }
    if (enabled) disable.mutate(code);
    else enable.mutate(code);
  };

  const busy = setup.isPending || enable.isPending || disable.isPending;

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div className="flex items-start gap-3">
          <span className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            enabled ? 'bg-success-50 text-success-600 dark:bg-success-500/10' : 'bg-warning-50 text-warning-600 dark:bg-warning-500/10'
          )}>
            <Smartphone className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <CardTitle>Authenticator app</CardTitle>
            <CardDescription>
              Time-based one-time passwords (RFC 6238), 30-second step.
            </CardDescription>
          </div>
        </div>
        <Badge variant={enabled ? 'success' : 'warning'} dot>
          {enabled ? `On · ${method}` : 'Off'}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {!enabled && !secret && (
          <>
            <Alert variant="warning" title="Second factor not enrolled">
              A password alone is not sufficient for a banking account. Enrol an authenticator app so a
              leaked password cannot be used on its own.
            </Alert>
            <Button onClick={() => setup.mutate()} loading={setup.isPending} leftIcon={KeyRound}>
              Start enrolment
            </Button>
          </>
        )}

        {secret && !enabled && (
          <div className="space-y-4 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">1. Add this key to your authenticator app</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Scan the <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">otpauth://</code> URI, or enter the
                setup key manually.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-lg bg-gray-100 px-3 py-2 font-mono text-sm tracking-wider dark:bg-gray-800">
                {secret}
              </code>
              <Button variant="outline" size="icon" onClick={copySecret} aria-label="Copy setup key">
                {copied ? <Check className="h-4 w-4 text-success-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="break-all rounded-lg bg-gray-50 p-2 font-mono text-[11px] text-gray-500 dark:bg-gray-800/60 dark:text-gray-400">
              {otpauthUrl}
            </p>
          </div>
        )}

        {(secret || enabled) && (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <p className="mb-2 text-center text-sm font-medium text-gray-900 dark:text-white">
                {enabled ? 'Confirm with a live code to disable' : '2. Enter the 6-digit code to confirm'}
              </p>
              <OTPInput value={code} onChange={setCode} error={Boolean(formError)} disabled={busy} />
            </div>
            {formError && <Alert variant="danger">{formError}</Alert>}
            <div className="flex justify-center gap-2">
              <Button type="submit" disabled={busy} variant={enabled ? 'danger' : 'primary'}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {enabled ? 'Disable two-factor' : 'Verify and enable'}
              </Button>
              {secret && !enabled && (
                <Button type="button" variant="ghost" onClick={() => { setSecret(null); setCode(''); setFormError(null); }} disabled={busy}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        )}

        {enabled && !secret && (
          <div className="flex items-center gap-2 rounded-xl bg-success-50 p-3 text-sm text-success-700 dark:bg-success-500/10 dark:text-success-500">
            <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
            Sign-in requires your password plus a code from your authenticator app.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

TwoFactorAuth.propTypes = {
  enabled: PropTypes.bool,
  method: PropTypes.string,
  onChanged: PropTypes.func,
};

export { TwoFactorAuth };
export default TwoFactorAuth;
