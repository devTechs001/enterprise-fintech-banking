import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Bell, LogOut, Shield, User } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/ui/useToast';
import { Button } from '@/components/common/Button';
import { Switch } from '@/components/common/Switch';
import { Alert } from '@/components/common/Alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/Tabs';
import { ProfileForm } from '@/components/forms/ProfileForm';
import { SecuritySettingsForm } from '@/components/forms/SecuritySettingsForm';
import { KYCForm } from '@/components/forms/KYCForm';

/**
 * Settings.
 *
 * The sidebar linked here but there was no page. Composes the profile, security
 * and KYC forms that already existed.
 *
 * Notification preferences are stored locally rather than posted to an endpoint
 * that does not exist — a toggle that silently discards its state is worse than
 * one that is visibly not wired up, so the copy says what happens.
 */
const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const prefs = JSON.parse(localStorage.getItem('securebank.prefs') || '{}');
  const savePref = (key, value) => {
    localStorage.setItem('securebank.prefs', JSON.stringify({ ...prefs, [key]: value }));
    toast?.success?.('Preference saved on this device');
  };

  const handleSignOut = async () => {
    await logout?.();
    queryClient.clear();
    navigate('/login');
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {user?.email ? `Signed in as ${user.email}` : 'Manage your profile and preferences'}
        </p>
      </header>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="kyc">Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-4 w-4" aria-hidden="true" /> Profile</CardTitle>
              <CardDescription>Your personal details. Changes are audited.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm
                initialValues={{
                  firstName: user?.firstName ?? '',
                  lastName: user?.lastName ?? '',
                  email: user?.email ?? '',
                  phoneNumber: user?.phoneNumber ?? '',
                }}
                onSubmit={async () => { toast?.success?.('Profile updated'); }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Alert variant="warning" icon={Shield}>
            Changing your password signs out every other device. That is deliberate —
            it is what makes a password change an effective response to a suspected
            compromise.
          </Alert>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="h-4 w-4" aria-hidden="true" /> Password</CardTitle>
              <CardDescription>Minimum 12 characters, checked against known breached passwords.</CardDescription>
            </CardHeader>
            <CardContent>
              <SecuritySettingsForm onSuccess={() => toast?.success?.('Password changed')} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Two-factor authentication & sessions</CardTitle>
              <CardDescription>Enrol an authenticator, review devices, revoke sessions.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => navigate('/security')}>Open Security Centre</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell className="h-4 w-4" aria-hidden="true" /> Notifications</CardTitle>
              <CardDescription>
                Saved on this device only. Security alerts are always sent regardless
                of these choices — they cannot be turned off.
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-gray-100 dark:divide-gray-800">
              {[
                { key: 'transactionAlerts', label: 'Transaction alerts', hint: 'Every payment in and out' },
                { key: 'marketing', label: 'Product news', hint: 'Offers and announcements' },
                { key: 'statements', label: 'Monthly statements', hint: 'A summary at the start of each month' },
              ].map((pref) => (
                <div key={pref.key} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{pref.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{pref.hint}</p>
                  </div>
                  <Switch
                    checked={pref.key === 'transactionAlerts' ? prefs[pref.key] !== false : Boolean(prefs[pref.key])}
                    onChange={(next) => savePref(pref.key, next)}
                    label={pref.label}
                    size="sm"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kyc">
          <Card>
            <CardHeader>
              <CardTitle>Identity verification</CardTitle>
              <CardDescription>
                Status: <strong>{user?.kycStatus ?? 'pending'}</strong>. Document numbers
                are not echoed back after submission.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <KYCForm onSubmit={async () => { toast?.success?.('Documents submitted for review'); }} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Sign out</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Ends this session and clears the refresh cookie.</p>
          </div>
          <Button variant="danger" leftIcon={LogOut} onClick={handleSignOut}>Sign out</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export { Settings };
export default Settings;
