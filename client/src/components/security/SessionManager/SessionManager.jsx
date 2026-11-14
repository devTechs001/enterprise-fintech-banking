import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Monitor, ShieldAlert, Trash2, MapPin } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Alert } from '@/components/common/Alert';
import { Skeleton } from '@/components/common/Skeleton';
import { securityService } from '@/services/api/securityService';
import { useToast } from '@/hooks/ui/useToast';
import { formatRelativeTime } from '@/utils/formatters';

const SESSIONS_KEY = ['security', 'sessions'];

/**
 * Active-session management.
 *
 * Lists every live refresh-token session with its device, IP and approximate
 * location, and lets the user revoke one or all of them. The current session is
 * protected from self-revocation so nobody can lock themselves out by accident.
 */
const SessionManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: SESSIONS_KEY,
    queryFn: async () => (await securityService.getSessions()).data,
  });

  const revoke = useMutation({
    mutationFn: (id) => securityService.revokeSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
      toast.success('Session revoked', 'That device has been signed out.');
    },
    onError: (error) => toast.error('Could not revoke session', error?.apiMessage || 'Please try again.'),
  });

  const revokeAll = useMutation({
    mutationFn: () => securityService.revokeAllSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
      toast.success('All other sessions revoked');
    },
    onError: () => toast.error('Could not revoke sessions'),
  });

  const sessions = data?.sessions ?? [];
  const remote = sessions.filter((s) => !s.current);

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10">
            <Monitor className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <CardTitle>Active sessions</CardTitle>
            <CardDescription>
              {isLoading ? 'Loading…' : `${sessions.length} signed-in session${sessions.length === 1 ? '' : 's'}`}
            </CardDescription>
          </div>
        </div>
        {remote.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => revokeAll.mutate()} loading={revokeAll.isPending}>
            Revoke all others
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {isError && (
          <Alert variant="danger" title="Could not load sessions" description="Check your connection and retry." />
        )}
        {isLoading && (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
          </div>
        )}
        {!isLoading && sessions.length === 0 && (
          <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">No active sessions.</p>
        )}
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-700"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{session.device}</p>
                {session.current && <Badge variant="success" size="sm">This device</Badge>}
              </div>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" aria-hidden="true" />
                  {session.location}
                </span>
                <span className="font-mono">{session.ip}</span>
                <span>Active {formatRelativeTime(session.lastActiveAt)}</span>
              </p>
            </div>
            {!session.current && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => revoke.mutate(session.id)}
                disabled={revoke.isPending}
                aria-label={`Revoke session on ${session.device}`}
                title="Revoke session"
              >
                <Trash2 className="h-4 w-4 text-danger-600" />
              </Button>
            )}
          </div>
        ))}
        {remote.length > 0 && (
          <p className="flex items-start gap-2 pt-1 text-xs text-gray-500 dark:text-gray-400">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Do not recognise a session? Revoke it, then change your password — a password change signs
            out every other session automatically.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export { SessionManager };
export default SessionManager;
