import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileAvatar from '../components/ProfileAvatar';
import { createJob, deleteJob, getMyJobs, updateJob, updateJobStatus } from '../api/jobApi';
import { firstValidationError, validateJobForm } from '../utils/validation';

const emptyForm = {
  title: '',
  company: '',
  location: '',
  salary: 'Negotiable',
  employmentType: 'full-time',
  description: '',
  requiredSkills: '',
  preferredSkills: '',
  requiredExperience: 0,
  educationRequirement: '',
  status: 'open',
  expiresAt: '',
};

const dateInputValue = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ ...emptyForm, company: user.company || '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const formRef = useRef(null);
  const [showCreateJob, setShowCreateJob] = useState(false);

  const loadJobs = async () => {
    try {
      const { data } = await getMyJobs();
      setJobs(data.jobs);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load your jobs');
    }
  };

  useEffect(() => { loadJobs(); }, []);

  useEffect(() => {
    if (!editingId) return;
    const editingJob = jobs.find((job) => job._id === editingId);
    if (editingJob) {
      setForm((current) => ({ ...current, expiresAt: dateInputValue(editingJob.expiresAt) }));
    }
  }, [editingId, jobs]);

  useEffect(() => {
    if (editingId) setShowCreateJob(true);
  }, [editingId]);

  useEffect(() => {
    if (showCreateJob) formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [showCreateJob]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateJobForm(form);
    if (Object.keys(validationErrors).length) {
      setError(firstValidationError(validationErrors));
      return;
    }

    const payload = {
      ...form,
      requiredSkills: form.requiredSkills.split(',').map((name) => name.trim()).filter(Boolean),
      preferredSkills: form.preferredSkills.split(',').map((name) => name.trim()).filter(Boolean),
    };

    try {
      const response = editingId ? await updateJob(editingId, payload) : await createJob(payload);
      setJobs((current) => editingId
        ? current.map((job) => job._id === editingId ? response.data.job : job)
        : [response.data.job, ...current]);
      setForm({ ...emptyForm, company: user.company || '' });
      setEditingId(null);
      setShowCreateJob(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save job');
    }
  };

  const startEdit = (job) => {
    setForm({
      ...job,
      expiresAt: dateInputValue(job.expiresAt),
      requiredSkills: job.requiredSkills.map((skill) => skill.name).join(', '),
      preferredSkills: job.preferredSkills.map((skill) => skill.name).join(', '),
    });
    setEditingId(job._id);
  };

  const startCreate = () => {
    navigate('/recruiter/jobs/create');
  };

  const removeJob = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    try {
      await deleteJob(id);
      setJobs((current) => current.filter((job) => job._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete job');
    }
  };

  const toggleJobStatus = async (job) => {
    try {
      const { data } = await updateJobStatus(job._id, job.status === 'open' ? 'closed' : 'open');
      setJobs((current) => current.map((item) => item._id === job._id ? data.job : item));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update job status');
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Recruiter workspace</p>
        <div className="mt-2 flex items-center gap-3">
          <ProfileAvatar user={user} className="h-12 w-12" textClassName="text-lg" />
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Build your next shortlist.</h1>
        </div>
        <p className="mt-2 text-sm text-slate-600">Create structured roles so candidates can see exactly what matters.</p>
      </div>

      {error && <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div ref={formRef} className={`job-management-area grid gap-6 lg:grid-cols-[380px_1fr] ${showCreateJob ? '' : 'create-job-closed'}`}>
        <div className="card lg:col-span-2">
          <label className="label-text" htmlFor="job-expires-at">Expiry date</label>
          <input id="job-expires-at" type="date" min={new Date().toISOString().slice(0, 10)} className="input-field max-w-xs" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
          <p className="mt-1 text-xs text-slate-500">After this date, the job is automatically marked expired and hidden from candidates.</p>
        </div>

        <form onSubmit={handleSubmit} className="card h-fit lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">{editingId ? 'Edit job' : 'Create a job'}</h2>
            {editingId && (
              <button type="button" className="text-xs font-semibold text-slate-500" onClick={() => { setEditingId(null); setForm({ ...emptyForm, company: user.company || '' }); }}>
                Cancel
              </button>
            )}
          </div>

          <label className="label-text mt-5">Job title</label>
          <input required className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Senior Product Designer" />

          <label className="label-text mt-4">Company</label>
          <input className="input-field" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="label-text">Location</label>
              <input className="input-field" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Remote" />
            </div>
            <div>
              <label className="label-text">Type</label>
              <select className="input-field" value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })}>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
          </div>

          <label className="label-text mt-4">Description</label>
          <textarea required className="input-field min-h-32" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the role, team, and impact." />

          <label className="label-text mt-4">Required skills <span className="font-normal text-slate-400">comma separated</span></label>
          <input className="input-field" value={form.requiredSkills} onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })} placeholder="React, JavaScript, CSS" />

          <label className="label-text mt-4">Preferred skills <span className="font-normal text-slate-400">comma separated</span></label>
          <input className="input-field" value={form.preferredSkills} onChange={(e) => setForm({ ...form, preferredSkills: e.target.value })} placeholder="Leadership, SQL" />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="label-text">Required experience</label>
              <input type="number" min="0" className="input-field" value={form.requiredExperience} onChange={(e) => setForm({ ...form, requiredExperience: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label-text">Salary</label>
              <input className="input-field" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="Negotiable" />
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button type="submit" className="btn-primary flex-1">{editingId ? 'Update job' : 'Publish job'}</button>
          </div>
        </form>

        <section className="space-y-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Your jobs</h2>
              <p className="mt-1 text-sm text-slate-500">{jobs.length} posting{jobs.length === 1 ? '' : 's'} managed by you.</p>
            </div>
            <button type="button" className="btn-primary whitespace-nowrap" onClick={startCreate}>Add Job</button>
          </div>

          {jobs.length ? (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div className="card" key={job._id}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{job.title}</h3>
                        <span className={`badge ${job.status === 'open' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{job.status}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{job.company || user.company || 'Your company'} � {job.location || 'Remote'} � {job.requiredExperience} years experience</p>
                    </div>

                    <div className="flex gap-3 text-sm">
                      <Link className="font-semibold text-brand-600" to={`/jobs/${job._id}`}>View</Link>
                      <button type="button" className="font-semibold text-slate-600" onClick={() => startEdit(job)}>Edit</button>
                      <button type="button" className="font-semibold text-red-600" onClick={() => removeJob(job._id)}>Delete</button>
                    </div>
                  </div>

                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{job.description}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.requiredSkills?.map((skill) => (
                      <span className="badge bg-brand-50 text-brand-700" key={skill.name}>{skill.name}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-sm text-slate-500">Your published jobs will appear here.</div>
          )}
        </section>
      </div>

      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Job availability</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">Open or close postings</h2>
            <p className="mt-1 text-sm text-slate-500">Closed jobs are hidden from candidates without deleting their history.</p>
          </div>
          <div className="flex gap-3 text-sm">
            <Link className="font-semibold text-brand-600" to="/recruiter/jobs/active">Open jobs</Link>
            <Link className="font-semibold text-slate-600" to="/recruiter/jobs/expired">Expired jobs</Link>
            <Link className="font-semibold text-slate-600" to="/recruiter/pipeline">Pipeline</Link>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {jobs.map((job) => (
            <div className="card flex items-center justify-between gap-4 p-4" key={job._id}>
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">{job.title}</p>
                <p className="mt-1 text-xs text-slate-500">{job.status === 'expired' ? 'Expired' : job.status === 'open' ? 'Visible to candidates' : 'Hidden from candidates'}</p>
              </div>

              {job.status !== 'expired' && (
                <button
                  type="button"
                  className={job.status === 'open' ? 'btn-secondary' : 'btn-primary'}
                  onClick={() => toggleJobStatus(job)}
                >
                  {job.status === 'open' ? 'Close job' : 'Open job'}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
