import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateUserForm } from '../utils/validation';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'candidate',
    company: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateUserForm(form);
    if (Object.keys(validationErrors).length) {
      setFieldErrors(validationErrors);
      setError('Please correct the highlighted fields.');
      return;
    }
    setError('');
    setFieldErrors({});
    setSubmitting(true);
    try {
      const user = await register(form);
      navigate(`/${user.role}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to register. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-600">Join as a candidate or a recruiter</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>
          )}

          <div>
            <label className="label-text">I am a</label>
            <div className="grid grid-cols-2 gap-3">
              {['candidate', 'recruiter'].map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setForm({ ...form, role: r })}
                  className={`rounded-lg border px-4 py-2.5 text-sm font-semibold capitalize transition ${
                    form.role === r
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label-text" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className={`input-field ${fieldErrors.name ? 'border-red-500' : ''}`}
              placeholder="Aayush Sharma"
            />
            {fieldErrors.name && <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>}
          </div>

          <div>
            <label className="label-text" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              className={`input-field ${fieldErrors.email ? 'border-red-500' : ''}`}
              placeholder="you@example.com"
            />
            {fieldErrors.email && <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>}
          </div>

          {form.role === 'recruiter' && (
            <div>
              <label className="label-text" htmlFor="company">
                Company name
              </label>
              <input
                id="company"
                name="company"
                value={form.company}
                onChange={handleChange}
                className={`input-field ${fieldErrors.company ? 'border-red-500' : ''}`}
                placeholder="Acme Inc."
              />
              {fieldErrors.company && <p className="mt-1 text-sm text-red-600">{fieldErrors.company}</p>}
            </div>
          )}

          <div>
            <label className="label-text" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={handleChange}
              className={`input-field ${fieldErrors.password ? 'border-red-500' : ''}`}
              placeholder="At least 6 characters"
            />
            {fieldErrors.password && <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>}
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Creating account…' : 'Create account'}
          </button>

          <p className="text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
