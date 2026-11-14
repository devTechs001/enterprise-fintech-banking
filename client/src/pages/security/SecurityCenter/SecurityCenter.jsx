import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/Tabs';
import { SecurityScore } from '@/components/security/SecurityScore';
import { TwoFactorAuth } from '@/components/security/TwoFactorAuth';
import { BiometricAuth } from '@/components/security/BiometricAuth';
import { SessionManager } from '@/components/security/SessionManager';
import { DeviceManager } from '@/components/security/DeviceManager';
import { AuditLog } from '@/components/security/AuditLog';
import { SecurityQuestions } from '@/components/security/SecurityQuestions';
import { SecuritySettingsForm } from '@/components/forms/SecuritySettingsForm';
import { useSelector } from 'react-redux';
import { selectUser } from '@/store/slices/authSlice';

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'authentication', label: 'Authentication' },
  { value: 'sessions', label: 'Sessions & devices' },
  { value: 'activity', label: 'Activity log' },
];

/**
 * Security Centre.
 *
 * This page did not exist before — the scaffold shipped a `components/security/`
 * barrel pointing at five components that were never written, and no route to
 * reach them. It now exposes the real controls: TOTP enrolment, passkeys,
 * session and device management, the password policy, and the audit trail.
 */
const SecurityCenter = () => {
  const user = useSelector(selectUser);
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('overview');
  const [mfaEnabled, setMfaEnabled] = useState(Boolean(user?.mfaEnabled));

  const refreshSecurity = () => {
    queryClient.invalidateQueries({ queryKey: ['security'] });
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-600 text-white">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security Centre</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Authentication, sessions, devices and your account activity trail.
            </p>
          </div>
        </div>
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {TABS.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-3">
            <SecurityScore />
            <div className="space-y-6 lg:col-span-2">
              <SessionManager />
              <AuditLog limit={6} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="authentication">
          <div className="grid gap-6 lg:grid-cols-2">
            <TwoFactorAuth
              enabled={mfaEnabled}
              method={user?.mfaMethod || 'authenticator'}
              onChanged={(next) => { setMfaEnabled(next); refreshSecurity(); }}
            />
            <BiometricAuth enrolled={false} />
            <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Password</h2>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                Minimum 12 characters. Changing it revokes every other session.
              </p>
              <SecuritySettingsForm onPasswordChanged={refreshSecurity} />
            </div>
            <div className="lg:col-span-2">
              <SecurityQuestions />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sessions">
          <div className="grid gap-6 lg:grid-cols-2">
            <SessionManager />
            <DeviceManager onChanged={refreshSecurity} />
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <AuditLog limit={50} />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export { SecurityCenter };
export default SecurityCenter;
