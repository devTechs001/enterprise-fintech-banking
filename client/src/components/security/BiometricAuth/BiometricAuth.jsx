import { useState } from 'react';
import PropTypes from 'prop-types';
import { Fingerprint, ShieldCheck, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Alert } from '@/components/common/Alert';

/**
 * Passkey / WebAuthn enrolment.
 *
 * Uses the platform authenticator (Touch ID, Windows Hello, Android biometrics)
 * via the WebAuthn API. This is a phishing-resistant factor: the private key
 * never leaves the authenticator and the challenge is bound to this origin, so a
 * credential cannot be replayed against a look-alike domain.
 *
 * Requires a secure context (HTTPS or localhost) and server-side WebAuthn
 * registration; the UI reports honestly when either is unavailable instead of
 * pretending enrolment succeeded.
 */
const BiometricAuth = ({ enrolled = false, onEnrolled }) => {
  const [status, setStatus] = useState(null);

  const supported =
    typeof window !== 'undefined' &&
    Boolean(window.PublicKeyCredential) &&
    Boolean(window.navigator?.credentials?.create);

  const secureContext = typeof window !== 'undefined' && window.isSecureContext;

  const enrol = async () => {
    setStatus({ kind: 'pending', message: 'Waiting for your authenticator…' });
    try {
      // A real deployment fetches these options from POST /api/v1/security/webauthn/options.
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: 'SecureBank' },
          user: { id: challenge.slice(0, 16), name: 'demo@securebank.test', displayName: 'Demo User' },
          pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
          authenticatorSelection: { userVerification: 'required', residentKey: 'preferred' },
          timeout: 60000,
        },
      });
      if (credential) {
        setStatus({ kind: 'success', message: 'Authenticator responded. Register it with the API to finish.' });
        onEnrolled?.(credential);
      }
    } catch (error) {
      const denied = error?.name === 'NotAllowedError';
      setStatus({
        kind: 'error',
        message: denied ? 'Enrolment was cancelled or timed out.' : `Enrolment failed: ${error?.message || 'unknown error'}`,
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10">
            <Fingerprint className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <CardTitle>Passkeys</CardTitle>
            <CardDescription>Phishing-resistant sign-in with your device biometrics.</CardDescription>
          </div>
        </div>
        <Badge variant={enrolled ? 'success' : 'secondary'} dot>
          {enrolled ? 'Enrolled' : 'Not enrolled'}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {!supported && (
          <Alert variant="warning" title="WebAuthn is unavailable in this browser">
            Passkey enrolment needs a browser with the WebAuthn API. TOTP remains available as your second factor.
          </Alert>
        )}
        {supported && !secureContext && (
          <Alert variant="warning" title="Not a secure context">
            WebAuthn requires HTTPS (or localhost). Biometric enrolment is disabled until the page is served securely.
          </Alert>
        )}

        <Button onClick={enrol} disabled={!supported || !secureContext} leftIcon={Fingerprint} variant={enrolled ? 'outline' : 'primary'}>
          {enrolled ? 'Add another passkey' : 'Enrol this device'}
        </Button>

        {status && (
          <p className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
            {status.kind === 'error' ? (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger-600" aria-hidden="true" />
            ) : (
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success-600" aria-hidden="true" />
            )}
            {status.message}
          </p>
        )}

        <p className="text-xs text-gray-500 dark:text-gray-400">
          The private key never leaves your device and the ceremony is bound to this exact origin, so a
          passkey cannot be phished on a look-alike domain.
        </p>
      </CardContent>
    </Card>
  );
};

BiometricAuth.propTypes = { enrolled: PropTypes.bool, onEnrolled: PropTypes.func };

export { BiometricAuth };
export default BiometricAuth;
