import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getJobs } from '../api/jobApi';
import { formatJobDate, getJobDuration, getRemainingJobTime } from '../utils/jobDates';

const scoreClass = (score) => (score >= 75 ? 'text-emerald-700 bg-emerald-50' : score >= 50 ? 'text-amber-700 bg-amber-50' : 'text-slate-600 bg-slate-100');

export default function JobsPage() {
  const [filters, setFilters] = useState({ q: '', location: '', employmentType: '', skill: '' });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadJobs = async (event) => {
    event?.preventDefault();
    setLoading(true);
    try {
      const { data } = await getJobs(filters);
      setJobs(data.jobs);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadJobs(); }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Open roles</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Find work that fits.</h1>
          <p className="mt-2 text-sm text-slate-600">Search jobs and see how your resume lines up before applying.</p>
        </div>
        <span className="text-sm text-slate-500">{jobs.length} roles found</span>
      </div>

      <form onSubmit={loadJobs} className="mb-8 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card md:grid-cols-[2fr_1fr_1fr_1fr_auto]">
        <input className="input-field" placeholder="Search title, company, or description" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
        <input className="input-field" placeholder="Location" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
        <select className="input-field" value={filters.employmentType} onChange={(e) => setFilters({ ...filters, employmentType: e.target.value })}>
          <option value="">Any type</option><option value="full-time">Full-time</option><option value="part-time">Part-time</option><option value="contract">Contract</option><option value="internship">Internship</option>
        </select>
        <input className="input-field" placeholder="Skill" value={filters.skill} onChange={(e) => setFilters({ ...filters, skill: e.target.value })} />
        <button className="btn-primary" type="submit">Search</button>
      </form>

      {error && <p className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {loading ? <p className="text-sm text-slate-500">Loading roles...</p> : jobs.length === 0 ? <div className="card text-center text-sm text-slate-500">No open jobs match those filters.</div> : (
        <div className="grid gap-4 lg:grid-cols-2">
          {jobs.map((job) => (
            <Link key={job._id} to={`/jobs/${job._id}`} className="card group transition hover:-translate-y-0.5 hover:shadow-cardHover">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 group-hover:text-brand-700">{job.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">{job.company || job.recruiter?.company || 'Growing team'} · {job.location || 'Remote'}</p>
                </div>
                {job.compatibility && <span className={`badge whitespace-nowrap ${scoreClass(job.compatibility.finalScore)}`}>{job.compatibility.finalScore}% fit</span>}
              </div>
              <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{job.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500"><div><span className="block uppercase tracking-wide text-slate-400">Posted</span><span className="mt-1 block font-medium text-slate-700">{formatJobDate(job.createdAt)}</span></div><div><span className="block uppercase tracking-wide text-slate-400">Expires</span><span className="mt-1 block font-medium text-slate-700">{formatJobDate(job.expiresAt)}</span></div><div><span className="block uppercase tracking-wide text-slate-400">Duration</span><span className="mt-1 block font-medium text-slate-700">{getJobDuration(job)}</span></div><div><span className="block uppercase tracking-wide text-slate-400">Time left</span><span className="mt-1 block font-semibold text-brand-700">{getRemainingJobTime(job.expiresAt)}</span></div></div>
              <div className="mt-5 flex flex-wrap gap-2">
                {job.requiredSkills.slice(0, 4).map((skill) => <span className="badge bg-brand-50 text-brand-700" key={skill.name}>{skill.name}</span>)}
                <span className="badge bg-slate-100 capitalize text-slate-600">{job.employmentType}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}