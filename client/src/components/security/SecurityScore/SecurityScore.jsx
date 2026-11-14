import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

import { Card, CardContent } from '@/components/common/Card';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Skeleton } from '@/components/common/Skeleton';
import { securityService } from '@/services/api/securityService';
import { cn } from '@/utils/helpers';

const OVERVIEW_KEY = ['security', 'overview'];

const band = (score) => {
  if (score >= 85) return { label: 'Strong', variant: 'success', text: 'text-success-600' };
  if (score >= 60) return { label: 'Fair', variant: 'warning', text: 'text-warning-600' };
  return { label: 'At risk', variant: 'danger', text: 'text-danger-600' };
};

/**
 * Posture summary for the Security Centre.
 *
 * Derived server-side from real controls (MFA enrolled, email/phone verified,
 * untrusted devices, recent denied attempts) rather than a hard-coded number.
 */
const SecurityScore = () => {
  const { data, isLoading } = useQuery({
    queryKey: OVERVIEW_KEY,
    queryFn: async () => (await securityService.getSecurityOverview()).data,
  });

  if (isLoading) return <Skeleton className="h-44 w-full rounded-2xl" />;
  if (!data) return null;

  const { label, variant, text } = band(data.score);

  const checks = [
    { label: 'Two-factor authentication', ok: data.mfaEnabled },
    { label: 'Email verified', ok: data.emailVerified },
    { label: 'Phone verified', ok: data.phoneVerified },
    { label: 'No untrusted devices', ok: data.untrustedDevices === 0 },
    { label: 'No recent denied sign-ins', ok: data.recentFailures === 0 },
  ];

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-5 p-6">
        <div className="flex items-center gap-5">
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
            <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90" aria-hidden="true">
              <circle cx="50" cy="50" r="42" className="fill-none stroke-gray-100 dark:stroke-gray-800" strokeWidth="10" />
              <circle
                cx="50" cy="50" r="42"
                className={cn('fill-none transition-all duration-700', variant === 'success' && 'stroke-success-500', variant === 'warning' && 'stroke-warning-500', variant === 'danger' && 'stroke-danger-500')}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(data.score / 100) * 264} 264`}
              />
            </svg>
            <span className={cn('absolute text-2xl font-bold tabular-nums', text)}>{data.score}</span>
          </div>
          <div className="min-w-0">
            <p className={cn('text-sm font-semibold uppercase tracking-wide', text)}>{label}</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {data.activeSessions} active session{data.activeSessions === 1 ? '' : 's'} ·{' '}
              {data.trustedDevices} trusted device{data.trustedDevices === 1 ? '' : 's'}
            </p>
            {data.lockout && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-danger-600">
                <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                Sign-in locked until {new Date(data.lockout.until).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        <ul className="space-y-2.5">
          {checks.map((check) => (
            <li key={check.label} className="flex items-center gap-3">
              {check.ok ? (
                <ShieldCheck className="h-4 w-4 shrink-0 text-success-600" aria-hidden="true" />
              ) : (
                <ShieldAlert className="h-4 w-4 shrink-0 text-danger-600" aria-hidden="true" />
              )}
              <span className={cn('flex-1 text-sm', check.ok ? 'text-gray-700 dark:text-gray-300' : 'font-medium text-gray-900 dark:text-white')}>
                {check.label}
              </span>
              <span className={cn('text-xs font-medium', check.ok ? 'text-success-600' : 'text-danger-600')}>
                {check.ok ? 'Pass' : 'Action'}
              </span>
            </li>
          ))}
        </ul>

        <ProgressBar value={data.score} variant={variant} size="sm" />
      </CardContent>
    </Card>
  );
};

export { SecurityScore };
export default SecurityScore;
