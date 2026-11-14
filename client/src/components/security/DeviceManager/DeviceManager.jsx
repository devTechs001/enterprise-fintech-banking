import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import { Laptop, ShieldCheck, ShieldQuestion, Trash2 } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Switch } from '@/components/common/Switch';
import { Skeleton } from '@/components/common/Skeleton';
import { securityService } from '@/services/api/securityService';
import { useToast } from '@/hooks/ui/useToast';
import { formatRelativeTime } from '@/utils/formatters';

const DEVICES_KEY = ['security', 'devices'];

/**
 * Trusted-device management.
 *
 * A trusted device can skip step-up prompts for low-risk actions. Trust is
 * always an explicit user decision and is revocable; untrusted devices still
 * require full MFA.
 */
const DeviceManager = ({ onChanged }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: DEVICES_KEY,
    queryFn: async () => (await securityService.getDevices()).data,
  });

  const setTrusted = useMutation({
    mutationFn: ({ id, trusted }) => securityService.setDeviceTrusted(id, trusted),
    onSuccess: (response) => {
      queryClient.setQueryData(DEVICES_KEY, (old) => ({
        ...old,
        devices: (old?.devices ?? []).map((d) => (d.id === response.data.device.id ? response.data.device : d)),
      }));
      onChanged?.();
    },
    onError: () => toast.error('Could not update device'),
  });

  const remove = useMutation({
    mutationFn: (id) => securityService.removeDevice(id),
    onSuccess: (response) => {
      queryClient.setQueryData(DEVICES_KEY, response.data);
      toast.success('Device removed');
      onChanged?.();
    },
    onError: () => toast.error('Could not remove device'),
  });

  const devices = data?.devices ?? [];

  return (
    <Card>
      <CardHeader className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10">
          <Laptop className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <CardTitle>Trusted devices</CardTitle>
          <CardDescription>
            Trusted devices skip step-up prompts for low-risk actions. Everything else requires full MFA.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading && [0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        {!isLoading && devices.length === 0 && (
          <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">No devices enrolled.</p>
        )}
        {devices.map((device) => (
          <div key={device.id} className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-700">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{device.name}</p>
                <Badge variant={device.trusted ? 'success' : 'warning'} size="sm">
                  {device.trusted ? 'Trusted' : 'Not trusted'}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {device.platform} · {device.browser} · Last used {formatRelativeTime(device.lastUsedAt)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="sr-only" htmlFor={`trust-${device.id}`}>
                Trust {device.name}
              </label>
              <Switch
                id={`trust-${device.id}`}
                checked={device.trusted}
                size="sm"
                disabled={setTrusted.isPending}
                onChange={() => setTrusted.mutate({ id: device.id, trusted: !device.trusted })}
              />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => remove.mutate(device.id)}
                disabled={remove.isPending}
                aria-label={`Remove ${device.name}`}
                title="Remove device"
              >
                <Trash2 className="h-4 w-4 text-danger-600" />
              </Button>
            </div>
          </div>
        ))}
        <p className="flex items-start gap-2 pt-1 text-xs text-gray-500 dark:text-gray-400">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success-600" aria-hidden="true" />
          Only mark a device as trusted if nobody else uses it.
          <ShieldQuestion className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning-600" aria-hidden="true" />
        </p>
      </CardContent>
    </Card>
  );
};

DeviceManager.propTypes = { onChanged: PropTypes.func };

export { DeviceManager };
export default DeviceManager;
