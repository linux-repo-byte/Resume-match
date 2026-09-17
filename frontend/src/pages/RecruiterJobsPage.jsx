import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyJobs, updateJobStatus } from '../api/jobApi';
import { formatJobDate, getRemainingJobTime } from '../utils/jobDates';

const isExpired = (job) => job.expiresAt && new Date(job.expiresAt).getTime() <= Date.now();

export default function RecruiterJobsPage({ expired = false }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadJobs = async () => {
    try {
      const { data } = await getMyJobs();
      setJobs(data.jobs.filter((job) => expired ? (isExpired(job) || job.status === 'closed') : job.status === 'open' && !isExpired(job)));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadJobs(); }, [expired]);

  const toggleStatus = async (job) => {
    try {
      const { data } = await updateJobStatus(job._id, job.status === 'open' ? 'closed' : 'open');
      setJobs((current) => current.map((item) => item._id === job._id ? data.job : item).filter((item) => expired ? (isExpired(item) || item.status === 'closed') : item.status === 'open' && !isExpired(item)));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update job status');
    }
  };

  const title = expired ? 'Expired jobs' : 'Open / active jobs';
  const description = expired ? 'Review roles that have passed their expiration date.' : 'Roles currently visible to candidates and accepting applications.';

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Recruiter jobs</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-2 text-sm text-slate-600">{description}</p>
        </div>
        <Link className="btn-secondary" to="/recruiter">Back to dashboard</Link>
      </div>

      {error && <p className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {loading ? <p className="text-sm text-slate-500">Loading jobs...</p> : jobs.length === 0 ? <div className="card text-center text-sm text-slate-500">{expired ? 'No jobs have expired.' : 'No open, active jobs right now.'}</div> : (
        <div className="grid gap-4 lg:grid-cols-2">
          {jobs.map((job) => (
            <article className="card" key={job._id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{job.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">{job.company || 'Your company'} · {job.location || 'Remote'}</p>
                </div>
                <span className={`badge ${expired ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{expired ? 'expired' : 'open'}</span>
              </div>
              <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{job.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <div><span className="block uppercase tracking-wide text-slate-400">Posted</span><span className="mt-1 block font-medium text-slate-700">{formatJobDate(job.createdAt)}</span></div>
                <div><span className="block uppercase tracking-wide text-slate-400">Expires</span><span className="mt-1 block font-medium text-slate-700">{formatJobDate(job.expiresAt)}</span></div>
                <div className="col-span-2"><span className="block uppercase tracking-wide text-slate-400">Time left</span><span className="mt-1 block font-semibold text-brand-700">{getRemainingJobTime(job.expiresAt)}</span></div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link className="btn-secondary" to={`/jobs/${job._id}`}>View job</Link>
                {!expired && <button type="button" className="btn-primary" onClick={() => toggleStatus(job)}>Close job</button>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
