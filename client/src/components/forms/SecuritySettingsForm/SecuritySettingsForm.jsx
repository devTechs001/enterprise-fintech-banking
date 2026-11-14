import { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { KeyRound } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Alert } from '@/components/common/Alert';
import { changePassword } from '@/store/slices/authSlice';
import { useToast } from '@/hooks/ui/useToast';

/**
 * Password change.
 *
 * Requires the current password, enforces the same 12-character policy as
 * registration, and warns that the API signs out every other session on success.
 */
const SecuritySettingsForm = ({ onPasswordChanged }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    if (form.newPassword.length < 12) return setError('Use at least 12 characters.');
    if (form.newPassword !== form.confirmPassword) return setError('The new passwords do not match.');
    if (form.newPassword === form.currentPassword) return setError('Choose a password you have not used before.');

    setBusy(true);
    try {
      const result = await dispatch(changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword }));
      if (changePassword.rejected.match(result)) {
        setError(result.payload?.message || 'Could not change your password.');
      } else {
        toast.success('Password changed', 'All other sessions were signed out.');
        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        onPasswordChanged?.();
      }
    } finally {
      setBusy(false);
    }
    return undefined;
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <Alert variant="danger" title="Could not change password" description={error} />}
      <Alert variant="info" title="This signs out your other devices" description="Every other session is revoked when a password change succeeds." />
      <Input label="Current password" type="password" autoComplete="current-password" value={form.currentPassword} onChange={update('currentPassword')} required />
      <Input label="New password" type="password" autoComplete="new-password" value={form.newPassword} onChange={update('newPassword')} helperText="At least 12 characters." required />
      <Input label="Confirm new password" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={update('confirmPassword')} error={form.confirmPassword && form.confirmPassword !== form.newPassword ? 'Passwords do not match' : undefined} required />
      <Button type="submit" loading={busy} leftIcon={KeyRound}>Change password</Button>
    </form>
  );
};

SecuritySettingsForm.propTypes = { onPasswordChanged: PropTypes.func };

export { SecuritySettingsForm };
export default SecuritySettingsForm;
