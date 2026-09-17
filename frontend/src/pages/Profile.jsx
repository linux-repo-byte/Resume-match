import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProfileAvatar from '../components/ProfileAvatar';
import { validateEmail } from '../utils/validation';

export default function Profile() {
  const { user, updateProfile, updateProfilePicture } = useAuth();
  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    company: user.company || '',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pictureUploading, setPictureUploading] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Name is required.';
    const emailError = validateEmail(form.email);
    if (emailError) nextErrors.email = emailError;
    if (user.role === 'recruiter' && !form.company.trim()) nextErrors.company = 'Company name is required.';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setMessage('Please correct the highlighted fields.');
      return;
    }

    setSubmitting(true);
    setErrors({});
    setMessage('');
    try {
      const payload = { name: form.name.trim(), email: form.email.trim() };
      if (user.role === 'recruiter') payload.company = form.company.trim();
      await updateProfile(payload);
      setMessage('Profile updated successfully.');
      setEditing(false);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to update your profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePictureChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPictureUploading(true);
    setMessage('');
    try {
      await updateProfilePicture(file);
      setMessage('Profile picture updated successfully.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to update your profile picture.');
    } finally {
      setPictureUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Account settings</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Your profile</h1>
        <p className="mt-2 text-sm text-slate-600">View your account information and update it when needed.</p>
      </div>

      {!editing ? <section className="card space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-4">
            <ProfileAvatar user={user} className="h-20 w-20" textClassName="text-2xl" />
            <div><h2 className="font-semibold text-slate-900">{user.name}</h2><p className="mt-1 text-sm text-slate-500">{user.email}</p></div>
          </div>
          <button type="button" className="btn-primary" onClick={() => { setEditing(true); setMessage(''); }}>Edit Profile</button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div><p className="label-text">Full name</p><p className="text-sm text-slate-700">{user.name}</p></div>
          <div><p className="label-text">Email address</p><p className="text-sm text-slate-700">{user.email}</p></div>
          {user.role === 'recruiter' && <div><p className="label-text">Company name</p><p className="text-sm text-slate-700">{user.company || 'Not provided'}</p></div>}
          <div><p className="label-text">Account type</p><p className="text-sm capitalize text-slate-700">{user.role}</p></div>
        </div>
        {message && <p className="text-sm text-emerald-700">{message}</p>}
      </section> : <form onSubmit={handleSubmit} className="card space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="font-semibold text-slate-900">Personal information</h2>
          <span className="badge bg-slate-100 capitalize text-slate-600">{user.role}</span>
        </div>

        <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
          <ProfileAvatar user={user} className="h-20 w-20" textClassName="text-2xl" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">Profile picture</p>
            <p className="mt-1 text-xs text-slate-500">JPG, PNG, WEBP, or GIF up to 2 MB.</p>
            <label className="btn-secondary mt-3 cursor-pointer px-3 py-2 text-xs">
              {pictureUploading ? 'Uploading...' : 'Choose image'}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" disabled={pictureUploading} onChange={handlePictureChange} />
            </label>
          </div>
        </div>

        <div>
          <label className="label-text" htmlFor="profile-name">Full name</label>
          <input id="profile-name" name="name" className={`input-field ${errors.name ? 'border-red-500' : ''}`} value={form.name} onChange={handleChange} />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label className="label-text" htmlFor="profile-email">Email address</label>
          <input id="profile-email" name="email" type="email" className={`input-field ${errors.email ? 'border-red-500' : ''}`} value={form.email} onChange={handleChange} />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        {user.role === 'recruiter' && (
          <div>
            <label className="label-text" htmlFor="profile-company">Company name</label>
            <input id="profile-company" name="company" className={`input-field ${errors.company ? 'border-red-500' : ''}`} value={form.company} onChange={handleChange} />
            {errors.company && <p className="mt-1 text-sm text-red-600">{errors.company}</p>}
          </div>
        )}

        {message && <p className={`text-sm ${message.includes('successfully') ? 'text-emerald-700' : 'text-red-600'}`}>{message}</p>}
        <button type="submit" disabled={submitting} className="btn-primary w-full">{submitting ? 'Saving changes...' : 'Save changes'}</button>
        <button type="button" className="btn-secondary w-full" onClick={() => { setEditing(false); setErrors({}); setMessage(''); }}>Cancel</button>
      </form>}
    </div>
  );
}
