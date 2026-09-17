import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createJob } from '../api/jobApi';
import { firstValidationError, validateJobForm } from '../utils/validation';

const emptyForm = { title: '', company: '', location: '', salary: 'Negotiable', employmentType: 'full-time', description: '', requiredSkills: '', preferredSkills: '', requiredExperience: 0, educationRequirement: '', status: 'open', expiresAt: '' };

export default function RecruiterCreateJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...emptyForm, company: user.company || '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateJobForm(form);
    if (Object.keys(validationErrors).length) {
      setError(firstValidationError(validationErrors));
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await createJob({ ...form, requiredSkills: form.requiredSkills.split(',').map((name) => name.trim()).filter(Boolean), preferredSkills: form.preferredSkills.split(',').map((name) => name.trim()).filter(Boolean) });
      navigate('/recruiter');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create job');
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Recruiter workspace</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Create a job</h1><p className="mt-2 text-sm text-slate-600">Add a structured role for candidates to discover and apply to.</p></div>
        <Link to="/recruiter" className="btn-secondary">Back to Manage Jobs</Link>
      </div>

      {error && <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <form onSubmit={handleSubmit} className="card space-y-5">
        <div><label className="label-text" htmlFor="create-job-expires-at">Expiry date</label><input id="create-job-expires-at" type="date" min={new Date().toISOString().slice(0, 10)} className="input-field max-w-xs" value={form.expiresAt} onChange={(event) => setForm({ ...form, expiresAt: event.target.value })} /><p className="mt-1 text-xs text-slate-500">After this date, the job is automatically marked expired and hidden from candidates.</p></div>
        <div><label className="label-text" htmlFor="create-job-title">Job title</label><input id="create-job-title" required className="input-field" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Senior Product Designer" /></div>
        <div><label className="label-text" htmlFor="create-job-company">Company</label><input id="create-job-company" className="input-field" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} /></div>
        <div className="grid gap-4 sm:grid-cols-3"><div><label className="label-text" htmlFor="create-job-location">Location</label><input id="create-job-location" className="input-field" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="Remote" /></div><div><label className="label-text" htmlFor="create-job-salary">Salary</label><input id="create-job-salary" className="input-field" value={form.salary} onChange={(event) => setForm({ ...form, salary: event.target.value })} placeholder="Negotiable" /></div><div><label className="label-text" htmlFor="create-job-type">Type</label><select id="create-job-type" className="input-field" value={form.employmentType} onChange={(event) => setForm({ ...form, employmentType: event.target.value })}><option value="full-time">Full-time</option><option value="part-time">Part-time</option><option value="contract">Contract</option><option value="internship">Internship</option></select></div></div>
        <div><label className="label-text" htmlFor="create-job-description">Description</label><textarea id="create-job-description" required className="input-field min-h-32" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Describe the role, team, and impact." /></div>
        <div><label className="label-text" htmlFor="create-job-required-skills">Required skills <span className="font-normal text-slate-400">comma separated</span></label><input id="create-job-required-skills" className="input-field" value={form.requiredSkills} onChange={(event) => setForm({ ...form, requiredSkills: event.target.value })} placeholder="React, JavaScript, CSS" /></div>
        <div><label className="label-text" htmlFor="create-job-preferred-skills">Preferred skills <span className="font-normal text-slate-400">comma separated</span></label><input id="create-job-preferred-skills" className="input-field" value={form.preferredSkills} onChange={(event) => setForm({ ...form, preferredSkills: event.target.value })} placeholder="Figma, testing, analytics" /></div>
        <div className="grid gap-4 sm:grid-cols-2"><div><label className="label-text" htmlFor="create-job-experience">Required experience</label><input id="create-job-experience" type="number" min="0" className="input-field" value={form.requiredExperience} onChange={(event) => setForm({ ...form, requiredExperience: event.target.value })} /></div><div><label className="label-text" htmlFor="create-job-education">Education requirement</label><input id="create-job-education" className="input-field" value={form.educationRequirement} onChange={(event) => setForm({ ...form, educationRequirement: event.target.value })} placeholder="Bachelor's degree" /></div></div>
        <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5"><button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Creating job...' : 'Create job'}</button><Link to="/recruiter" className="btn-secondary">Cancel</Link></div>
      </form>
    </div>
  );
}
