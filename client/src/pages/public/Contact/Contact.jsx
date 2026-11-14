import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, ShieldAlert } from 'lucide-react';

import axiosInstance from '@/api/axiosInstance';
import { Alert } from '@/components/common/Alert';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { PublicLayout } from '@/components/layout/PublicLayout';

/**
 * Contact — its own page with a form that actually submits.
 *
 * The old landing nav's `#contact` anchor did not exist, and there was no way to reach
 * anyone. This posts to the public `/help/contact` endpoint — public because the
 * customer who cannot sign in is exactly the one who needs support — and shows the
 * returned ticket id, so "we got your message" is something the customer can quote.
 *
 * The fraud warning sits above the form on purpose: the most common reason someone
 * lands on a bank's contact page is that they have just been phished.
 */
const TOPICS = [
  { value: '', label: 'Choose a topic…' },
  { value: 'access', label: 'I cannot sign in' },
  { value: 'fraud', label: 'I think I have been defrauded' },
  { value: 'payments', label: 'A payment looks wrong' },
  { value: 'general', label: 'Something else' },
];

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', topic: '', message: '' });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState(null); // { kind: 'pending' | 'success' | 'error', ... }

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Tell us your name.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) next.email = 'Enter a valid email address.';
    if (!form.topic) next.topic = 'Choose a topic so it reaches the right team.';
    if (form.message.trim().length < 10) next.message = 'Give us at least a sentence to work with.';
    return next;
  };

  const submit = async (event) => {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setState({ kind: 'pending' });
    try {
      const response = await axiosInstance.post('/help/contact', {
        name: form.name.trim(),
        email: form.email.trim(),
        topic: form.topic,
        message: form.message.trim(),
      });
      setState({ kind: 'success', ticket: response.data?.ticket });
    } catch (error) {
      setState({ kind: 'error', message: error?.apiMessage || 'We could not send that. Please try again.' });
    }
  };

  return (
    <PublicLayout>
      <div className="py-16">
        <header className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight">Contact us</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Reach the team directly. You do not need to be signed in.
          </p>
        </header>

        <Alert variant="warning" icon={ShieldAlert} className="mt-8 max-w-2xl">
          SecureBank will never ask for your password, one-time code or recovery codes by
          phone, SMS or email. If someone has asked you for one, choose "I think I have
          been defrauded" below and we will treat it as urgent.
        </Alert>

        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          <form onSubmit={submit} noValidate className="space-y-4 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Input label="Your name" name="name" value={form.name} onChange={(e) => set('name')(e.target.value)} error={errors.name} autoComplete="name" />
              </div>
              <div>
                <Input label="Email address" name="email" type="email" value={form.email} onChange={(e) => set('email')(e.target.value)} error={errors.email} autoComplete="email" />
              </div>
            </div>

            <div>
              <Select label="Topic" name="topic" value={form.topic} options={TOPICS} onChange={set('topic')} error={errors.topic} />
            </div>

            <div>
              <label htmlFor="contact-message" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Message
              </label>
              <textarea
                id="contact-message"
                rows={5}
                value={form.message}
                onChange={(e) => set('message')(e.target.value)}
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={errors.message ? 'contact-message-error' : undefined}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900"
                placeholder="What happened, and when? Do not include passwords or one-time codes."
              />
              {errors.message && <p id="contact-message-error" className="mt-1 text-xs text-danger-500">{errors.message}</p>}
            </div>

            {state?.kind === 'success' ? (
              <Alert variant="success" title={`Received — ticket ${state.ticket}`}>
                Keep that reference. We reply to {form.email || 'your email'}. If this is
                fraud, also freeze your cards under Cards once you can sign in.
              </Alert>
            ) : (
              <Button type="submit" loading={state?.kind === 'pending'}>Send message</Button>
            )}

            {state?.kind === 'error' && <Alert variant="danger">{state.message}</Alert>}
          </form>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
              <h2 className="flex items-center gap-2 font-semibold"><Mail className="h-4 w-4" aria-hidden="true" /> Email</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">support@securebank.test</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Replies within one business day.</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
              <h2 className="flex items-center gap-2 font-semibold"><Phone className="h-4 w-4" aria-hidden="true" /> Phone</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">+254 700 000 000</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                We will never ask for your password or a one-time code on this line.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
              <h2 className="font-semibold">Locked out?</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                The <Link to="/help" className="font-semibold underline">help centre</Link> covers
                recovery without needing to sign in.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
};

export { Contact };
export default Contact;
