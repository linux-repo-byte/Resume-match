import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyApplications } from '../api/applicationApi';

const statusDetails = {
  applied: {
    label: 'Submitted — awaiting review',
    description: 'Your application was submitted and is waiting for the recruiter to review it.',
    styles: 'bg-slate-100 text-slate-700',
    group: 'inProgress',
  },
  reviewing: {
    label: 'Under review',
    description: 'The recruiter is currently reviewing your application.',
    styles: 'bg-amber-50 text-amber-700',
    group: 'inProgress',
  },
  shortlisted: {
    label: 'Shortlisted',
    description: 'You have been selected to move forward for this role.',
    styles: 'bg-emerald-50 text-emerald-700',
    group: 'shortlisted',
  },
  rejected: {
    label: 'Not shortlisted',
    description: 'You were not selected to move forward for this role.',
    styles: 'bg-red-50 text-red-700',
    group: 'notSelected',
  },
  withdrawn: {
    label: 'Withdrawn',
    description: 'This application has been withdrawn.',
    styles: 'bg-slate-100 text-slate-500',
    group: 'withdrawn',
  },
};

const filters = [
  { value: 'all', label: 'All applications' },
  { value: 'inProgress', label: 'Awaiting a decision' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'notSelected', label: 'Not shortlisted' },
  { value: 'withdrawn', label: 'Withdrawn' },
];


export default function CandidateApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadApplications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getMyApplications();
      setApplications(data.applications);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load your applications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const counts = useMemo(() => applications.reduce((result, application) => {
    const group = statusDetails[application.status]?.group;
    if (group) result[group] = (result[group] || 0) + 1;
    return result;
  }, { inProgress: 0, shortlisted: 0, notSelected: 0, withdrawn: 0 }), [applications]);

  const filteredApplications = filter === 'all'
    ? applications
    : applications.filter((application) => statusDetails[application.status]?.group === filter);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Candidate portal</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">My applications</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">Check each application and see whether you have been shortlisted. Applications still being considered are marked as awaiting a decision.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/candidate" className="btn-secondary">Dashboard</Link>
          <Link to="/jobs" className="btn-primary">Find a job</Link>
        </div>
      </div>

      {error && <div role="alert" className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {!loading && !error && <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="card p-4"><p className="text-xs text-slate-500">Total applications</p><p className="mt-1 text-2xl font-bold text-slate-900">{applications.length}</p></div>
        <div className="card p-4"><p className="text-xs text-slate-500">Awaiting a decision</p><p className="mt-1 text-2xl font-bold text-amber-700">{counts.inProgress}</p></div>
        <div className="card p-4"><p className="text-xs text-slate-500">Shortlisted</p><p className="mt-1 text-2xl font-bold text-emerald-700">{counts.shortlisted}</p></div>
        <div className="card p-4"><p className="text-xs text-slate-500">Not shortlisted</p><p className="mt-1 text-2xl font-bold text-red-700">{counts.notSelected}</p></div>
      </div>}

      <section className="card overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">Application status</h2>
            <p className="mt-1 text-xs text-slate-500">Status updates are shared by the employer.</p>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <span className="sr-only">Filter applications</span>
            <select className="input-field py-2" value={filter} onChange={(event) => setFilter(event.target.value)}>
              {filters.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-sm text-slate-500" role="status">Loading your applications...</div>
        ) : error ? (
          <div className="px-6 py-10 text-center">
            <p role="alert" className="text-sm text-red-700">{error}</p>
            <button type="button" className="btn-secondary mt-4" onClick={loadApplications}>Try again</button>
          </div>
        ) : applications.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <h3 className="font-semibold text-slate-900">No applications yet</h3>
            <p className="mt-2 text-sm text-slate-500">When you apply for a role, you can follow its shortlist status here.</p>
            <Link to="/jobs" className="btn-primary mt-5">Browse open jobs</Link>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">There are no applications in this category.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredApplications.map((application) => {
              const status = statusDetails[application.status] || statusDetails.applied;
              return (
                <article className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between" key={application._id}>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-slate-900">{application.job?.title || 'Role unavailable'}</h3>
                    <p className="mt-1 text-sm text-slate-600">{application.job?.company || 'Company unavailable'}{application.job?.location ? ` · ${application.job.location}` : ''}</p>
                    <p className="mt-2 text-xs text-slate-500">Applied {new Date(application.createdAt).toLocaleDateString()} · Resume match {application.match?.finalScore ?? 0}%</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                    <span className={`badge ${status.styles}`} aria-label={`Application status: ${status.label}`}>{status.label}</span>
                    <p className="max-w-sm text-xs text-slate-500 sm:text-right">{status.description}</p>
                    {application.job?._id && <Link className="text-xs font-semibold text-brand-600 hover:text-brand-700" to={`/jobs/${application.job._id}`}>View job</Link>}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
