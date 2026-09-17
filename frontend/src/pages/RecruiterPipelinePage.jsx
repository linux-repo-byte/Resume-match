import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyJobs } from '../api/jobApi';
import { downloadApplicationResumeFile, downloadCoverLetterFile, getJobApplications, updateApplicationStatus } from '../api/applicationApi';

export default function RecruiterPipelinePage() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');

  const loadApplications = async () => {
    try {
      const { data } = await getMyJobs();
      setJobs(data.jobs);

      const applicationResults = await Promise.all(
        data.jobs.map(async (job) => {
          const response = await getJobApplications(job._id);
          return response.data.applications.map((application) => ({ ...application, job }));
        })
      );

      setApplications(applicationResults.flat());
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load submissions');
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const applicationCounts = useMemo(
    () => applications.reduce((counts, application) => ({
      ...counts,
      [application.status]: (counts[application.status] || 0) + 1,
    }), {}),
    [applications]
  );

  const changeApplicationStatus = async (applicationId, status) => {
    try {
      const { data } = await updateApplicationStatus(applicationId, status);
      setApplications((current) => current.map((application) =>
        application._id === applicationId ? { ...application, status: data.application.status } : application
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update application');
    }
  };

  const downloadApplicationResume = async (application) => {
    try {
      await downloadApplicationResumeFile(application._id, application.resume.originalFileName);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to download resume');
    }
  };

  const downloadApplicationCoverLetter = async (application) => {
    try {
      await downloadCoverLetterFile(application._id, `${application.candidate?.name || 'candidate'}-cover-letter.pdf`);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to download cover letter');
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Recruiter section</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Candidate pipeline</h1>
          <p className="mt-2 text-sm text-slate-600">Review recent submissions across your current job postings.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/recruiter" className="btn-secondary">Back to dashboard</Link>
        </div>
      </div>

      {error && <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="card">
          <p className="text-sm font-medium text-slate-500">Total submissions</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{applications.length}</p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-slate-500">Reviewing</p>
          <p className="mt-3 text-3xl font-bold text-amber-600">{applicationCounts.reviewing || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-slate-500">Shortlisted</p>
          <p className="mt-3 text-3xl font-bold text-emerald-600">{applicationCounts.shortlisted || 0}</p>
        </div>
      </section>

      <section className="card overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Recent submissions</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">Pipeline overview</h2>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="badge bg-slate-100 text-slate-700">{jobs.length} jobs</span>
            <span className="badge bg-amber-50 text-amber-700">{applicationCounts.reviewing || 0} reviewing</span>
            <span className="badge bg-emerald-50 text-emerald-700">{applicationCounts.shortlisted || 0} shortlisted</span>
          </div>
        </div>

        {applications.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-6 py-3">Candidate</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Match</th>
                  <th className="px-6 py-3">Resume</th>
                  <th className="px-6 py-3">Cover Letter</th>
                  <th className="px-6 py-3">Download Resume</th>
                  <th className="px-6 py-3">Download Cover Letter</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((application) => (
                  <tr key={application._id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <p className="font-semibold text-slate-900">{application.candidate?.name || 'Unknown candidate'}</p>
                      <p className="mt-1 text-xs text-slate-500">{application.candidate?.email || 'No email provided'}</p>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-700">{application.job?.title}</td>
                    <td className="whitespace-nowrap px-6 py-4 font-semibold text-emerald-700">{application.match?.finalScore || 0}%</td>
                    <td className="max-w-52 px-6 py-4 text-slate-600">{application.resume?.originalFileName || 'Resume uploaded'}</td>
                    <td className="max-w-64 px-6 py-4">
                      <p className="line-clamp-2 text-xs leading-5 text-slate-600">{application.coverLetter || 'No cover letter submitted'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        className="whitespace-nowrap rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                        disabled={!application.resume?._id}
                        onClick={() => downloadApplicationResume(application)}
                      >
                        Download Resume
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        className="whitespace-nowrap text-xs font-semibold text-brand-600 hover:text-brand-700 disabled:cursor-not-allowed disabled:text-slate-400"
                        disabled={!application.coverLetter}
                        onClick={() => downloadApplicationCoverLetter(application)}
                      >
                        Download Cover Letter
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-medium text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none"
                        value={application.status}
                        onChange={(event) => changeApplicationStatus(application._id, event.target.value)}
                      >
                        <option value="applied">Applied</option>
                        <option value="reviewing">Reviewing</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="interview">Interview</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                      {new Date(application.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-10 text-sm text-slate-500">No recent submissions yet. New applications will appear here.</div>
        )}
      </section>
    </div>
  );
}
