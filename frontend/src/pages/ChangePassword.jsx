import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validatePassword } from '../utils/validation';

export default function ChangePassword() {
  const { updateProfile } = useAuth();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    const passwordError = validatePassword(form.password);
    if (passwordError) nextErrors.password = passwordError;
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setMessage('Please correct the highlighted fields.');
      return;
    }

    setSubmitting(true);
    setErrors({});
    setMessage('');
    try {
      await updateProfile({ password: form.password });
      setForm({ password: '', confirmPassword: '' });
      setMessage('Password changed successfully.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to change your password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Account security</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Change password</h1>
        <p className="mt-2 text-sm text-slate-600">Choose a new password for your account.</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="label-text" htmlFor="change-password">New password</label>
          <input id="change-password" name="password" type="password" minLength={6} required className={`input-field ${errors.password ? 'border-red-500' : ''}`} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="At least 6 characters" />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </div>

        <div>
          <label className="label-text" htmlFor="change-password-confirm">Confirm new password</label>
          <input id="change-password-confirm" name="confirmPassword" type="password" required className={`input-field ${errors.confirmPassword ? 'border-red-500' : ''}`} value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} />
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
        </div>

        {message && <p className={`text-sm ${message.includes('successfully') ? 'text-emerald-700' : 'text-red-600'}`}>{message}</p>}
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Changing password...' : 'Change password'}</button>
          <Link to="/profile" className="btn-secondary">Back to profile</Link>
        </div>
      </form>
    </div>
  );
}
