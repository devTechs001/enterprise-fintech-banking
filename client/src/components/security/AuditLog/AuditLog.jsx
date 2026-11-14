import { useQuery } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import { ScrollText } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Alert } from '@/components/common/Alert';
import { Skeleton } from '@/components/common/Skeleton';
import { securityService } from '@/services/api/securityService';
import { formatDateTime } from '@/utils/formatters';

const AUDIT_KEY = ['security', 'audit'];

const LABELS = {
  USER_LOGIN: 'Signed in',
  MFA_REQUIRED: 'MFA challenge issued',
  MFA_VERIFIED: 'MFA verified',
  MFA_FAILED: 'MFA rejected',
  MFA_ENABLED: 'MFA enabled',
  MFA_DISABLED: 'MFA disabled',
  MFA_SETUP_STARTED: 'MFA enrolment started',
  MFA_ENABLE_FAILED: 'MFA enrolment rejected',
  MFA_DISABLE_FAILED: 'MFA removal rejected',
  USER_LOGOUT: 'Signed out',
  ACCOUNT_LOCKED: 'Account locked',
  PASSWORD_CHANGED: 'Password changed',
  PASSWORD_CHANGE_FAILED: 'Password change rejected',
  PASSWORD_RESET_REQUESTED: 'Password reset requested',
  SESSION_REVOKED: 'Session revoked',
  ALL_SESSIONS_REVOKED: 'All sessions revoked',
  DEVICE_TRUSTED: 'Device trusted',
  DEVICE_UNTRUSTED: 'Device untrusted',
  DEVICE_REMOVED: 'Device removed',
  TRANSFER_COMPLETED: 'Transfer completed',
  TRANSFER_DECLINED: 'Transfer declined',
  CARD_BLOCKED: 'Card blocked',
  CARD_UPDATED: 'Card updated',
  BENEFICIARY_ADDED: 'Beneficiary added',
  CARD_FROZEN: 'Card frozen',
  ACCOUNT_FROZEN: 'Account frozen',
  ACCOUNT_UNFROZEN: 'Account unfrozen',
  USER_REGISTERED: 'Account registered',
};

/**
 * Security audit trail.
 *
 * Banking compliance needs a tamper-evident record of every security-relevant
 * event. The client renders it read-only; entries are appended server-side and
 * are never editable or deletable through the API.
 */
const AuditLog = ({ limit = 12 }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: AUDIT_KEY,
    queryFn: async () => (await securityService.getAuditLog(limit)).data,
  });

  const entries = data?.entries ?? [];

  return (
    <Card>
      <CardHeader className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10">
          <ScrollText className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <CardTitle>Security activity</CardTitle>
          <CardDescription>Append-only log of authentication and account events.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {isError && <Alert variant="danger" title="Could not load the audit trail" />}
        {isLoading && (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
          </div>
        )}
        {!isLoading && entries.length === 0 && (
          <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">No recorded activity yet.</p>
        )}
        <ol className="divide-y divide-gray-100 dark:divide-gray-800">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-center gap-3 py-2.5">
              <Badge variant={entry.outcome === 'success' ? 'success' : 'danger'} size="sm">
                {entry.outcome === 'success' ? 'OK' : 'Denied'}
              </Badge>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {LABELS[entry.action] || entry.action}
                </p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {entry.location} · <span className="font-mono">{entry.ip}</span>
                </p>
              </div>
              <time dateTime={entry.at} className="shrink-0 text-xs tabular-nums text-gray-400">
                {formatDateTime(entry.at)}
              </time>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
};

AuditLog.propTypes = { limit: PropTypes.number };

export { AuditLog };
export default AuditLog;
