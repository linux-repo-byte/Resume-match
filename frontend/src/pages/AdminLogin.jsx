import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateLoginForm } from '../utils/validation';

export default function AdminLogin() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setFieldErrors({ ...fieldErrors, [event.target.name]: '' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateLoginForm(form);
    if (Object.keys(validationErrors).length) {
      setFieldErrors(validationErrors);
      setError('Please correct the highlighted fields.');
      return;
    }

    setError('');
    setFieldErrors({});
    setSubmitting(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role !== 'admin') {
        logout();
        throw new Error('This portal is restricted to administrators.');
      }
      navigate(location.state?.from?.pathname || '/admin', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to log in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">A</div>
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Private portal</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Administrator sign in</h1>
          <p className="mt-1 text-sm text-slate-600">Use your existing admin credentials to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
          {error && <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>}
          <div>
            <label className="label-text" htmlFor="admin-email">Email address</label>
            <input id="admin-email" name="email" type="email" required value={form.email} onChange={handleChange} className={`input-field ${fieldErrors.email ? 'border-red-500' : ''}`} placeholder="admin@example.com" />
            {fieldErrors.email && <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>}
          </div>
          <div>
            <label className="label-text" htmlFor="admin-password">Password</label>
            <input id="admin-password" name="password" type="password" required value={form.password} onChange={handleChange} className={`input-field ${fieldErrors.password ? 'border-red-500' : ''}`} placeholder="Enter your password" />
            {fieldErrors.password && <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>}
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">{submitting ? 'Signing in...' : 'Enter admin portal'}</button>
          <p className="text-center text-sm text-slate-600"><Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">Back to standard login</Link></p>
        </form>
      </div>
    </div>
  );
}
