import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCandidateDashboard, getMyApplications } from '../api/applicationApi';
import ProfileAvatar from '../components/ProfileAvatar';
import CandidateAnalytics from '../components/CandidateAnalytics';
import { formatJobDate, getRemainingJobTime } from '../utils/jobDates';

const scoreTone = (score) => (score >= 75 ? 'text-emerald-700' : score >= 50 ? 'text-amber-700' : 'text-slate-700');
const statusStyles = {
  applied: 'bg-slate-100 text-slate-700',
  reviewing: 'bg-amber-50 text-amber-700',
  shortlisted: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-700',
  withdrawn: 'bg-slate-100 text-slate-500',
};

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [{ data: dashboardData }, { data: applicationData }] = await Promise.all([getCandidateDashboard(), getMyApplications()]);
        setDashboard(dashboardData.dashboard);
        setApplications(applicationData.applications);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load your dashboard');
      }
    };
    loadDashboard();
  }, []);

  const resumeScore = dashboard?.resumeScore || 0;
  const coverage = dashboard?.skillCoverage || 0;
  const applicationCounts = applications.reduce((counts, application) => ({ ...counts, [application.status]: (counts[application.status] || 0) + 1 }), {});

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Candidate workspace</p>
        <div className="mt-2 flex items-center gap-3"><ProfileAvatar user={user} className="h-12 w-12" textClassName="text-lg" /><h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back, {user.name.split(' ')[0]}.</h1></div>
        <p className="mt-2 text-sm text-slate-600">A clear view of your profile strength and the roles that fit it.</p>
      </div>

      {error && <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {!dashboard ? <div className="card text-sm text-slate-500">Loading your profile signal...</div> : <>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card flex items-center gap-5">
            <div className="relative grid h-24 w-24 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#4f46e5 ${resumeScore * 3.6}deg, #e2e8f0 0deg)` }}><div className="grid h-16 w-16 place-items-center rounded-full bg-white"><span className={`text-xl font-bold ${scoreTone(resumeScore)}`}>{resumeScore}</span></div></div>
            <div><p className="text-sm font-semibold text-slate-900">Resume score</p><p className="mt-1 text-xs leading-5 text-slate-500">Completeness across skills, experience, education, and projects.</p><Link className="mt-2 inline-block text-xs font-semibold text-brand-600" to="/candidate/resumes">Improve resume →</Link></div>
          </div>
          <div className="card"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-900">Skill coverage</p><span className="text-2xl font-bold text-slate-900">{coverage}%</span></div><div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${coverage}%` }} /></div><p className="mt-3 text-xs text-slate-500">Average required-skill coverage across recommended roles.</p></div>
          <div className="card"><p className="text-sm font-semibold text-slate-900">Skill gap</p><p className="mt-2 text-4xl font-bold text-slate-900">{dashboard.skillGap}</p><p className="mt-1 text-xs text-slate-500">required skills missing from your recommended roles</p><Link className="mt-3 inline-block text-xs font-semibold text-brand-600" to="/jobs">Explore roles →</Link></div>
        </div>

        <CandidateAnalytics applications={applications} recommendedJobs={dashboard.recommendedJobs} resumeScore={resumeScore} coverage={coverage} />

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.5fr]">
          <section className="card"><div className="flex items-center justify-between"><h2 className="font-semibold text-slate-900">Detected skills</h2><Link to="/candidate/resumes" className="text-xs font-semibold text-brand-600">View resume</Link></div><div className="mt-4 flex flex-wrap gap-2">{dashboard.detectedSkills.length ? dashboard.detectedSkills.map((skill) => <span className="badge bg-brand-50 text-brand-700" key={skill.name}>{skill.name}</span>) : <p className="text-sm text-slate-500">Upload a parsed resume to detect skills.</p>}</div><h3 className="mt-7 text-sm font-semibold text-slate-900">Missing skills</h3><div className="mt-3 flex flex-wrap gap-2">{dashboard.missingSkills.length ? dashboard.missingSkills.map((skill) => <span className="badge bg-amber-50 text-amber-700" key={skill}>{skill}</span>) : <p className="text-sm text-slate-500">No skill gaps detected yet.</p>}</div></section>
          <section className="card"><div className="flex items-center justify-between"><div><h2 className="font-semibold text-slate-900">Recommended jobs</h2><p className="mt-1 text-xs text-slate-500">Only roles matched to your resume are shown.</p></div><Link to="/jobs" className="text-xs font-semibold text-brand-600">Browse all</Link></div><div className="mt-4 divide-y divide-slate-100">{dashboard.recommendedJobs.length ? dashboard.recommendedJobs.map((job) => <Link to={`/jobs/${job._id}`} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0" key={job._id}><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{job.title}</p><p className="mt-1 text-xs text-slate-500">{job.company || 'Open role'} · {job.location || 'Remote'}</p><p className="mt-2 text-[11px] text-slate-400">Posted {formatJobDate(job.createdAt)} · Expires {formatJobDate(job.expiresAt)}</p><p className="mt-1 text-[11px] font-medium text-brand-700">{getRemainingJobTime(job.expiresAt)}</p></div><span className="shrink-0 text-right"><strong className="block text-sm font-bold text-emerald-700">{job.compatibility.finalScore}%</strong><small className="text-[10px] text-slate-400">match probability</small></span></Link>) : <p className="py-5 text-sm text-slate-500">No matched jobs yet. Upload a resume or check back after jobs are posted.</p>}</div></section>
        </div>

        <section className="card mt-6"><div className="flex items-center justify-between"><h2 className="font-semibold text-slate-900">Recent applications</h2><Link to="/jobs" className="text-xs font-semibold text-brand-600">Find another role</Link></div>{dashboard.recentApplications.length ? <div className="mt-4 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400"><tr><th className="py-3 pr-4">Role</th><th className="py-3 pr-4">Match</th><th className="py-3 pr-4">Status</th><th className="py-3">Applied</th></tr></thead><tbody className="divide-y divide-slate-100">{dashboard.recentApplications.map((application) => <tr key={application._id}><td className="py-3 pr-4 font-medium text-slate-900">{application.job?.title}</td><td className="py-3 pr-4 font-semibold text-emerald-700">{application.match?.finalScore || 0}%</td><td className="py-3 pr-4 capitalize text-slate-600">{application.status}</td><td className="py-3 text-slate-500">{new Date(application.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div> : <p className="mt-4 text-sm text-slate-500">Your applications will appear here.</p>}</section>

        <section className="mt-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Application tracker</p><h2 className="mt-1 text-xl font-semibold text-slate-900">Your submission status</h2><p className="mt-1 text-sm text-slate-500">Follow every application from submission through review.</p></div><Link className="text-xs font-semibold text-brand-600" to="/jobs">Apply to another role</Link></div>
          <div className="mb-4 grid gap-3 grid-cols-2 sm:grid-cols-4"><div className="card p-4"><p className="text-xs text-slate-500">Submitted</p><p className="mt-1 text-2xl font-bold text-slate-900">{applications.length}</p></div><div className="card p-4"><p className="text-xs text-slate-500">Reviewing</p><p className="mt-1 text-2xl font-bold text-amber-700">{applicationCounts.reviewing || 0}</p></div><div className="card p-4"><p className="text-xs text-slate-500">Shortlisted</p><p className="mt-1 text-2xl font-bold text-emerald-700">{applicationCounts.shortlisted || 0}</p></div><div className="card p-4"><p className="text-xs text-slate-500">Rejected</p><p className="mt-1 text-2xl font-bold text-red-700">{applicationCounts.rejected || 0}</p></div></div>
          <div className="card overflow-hidden p-0">{applications.length ? <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-400"><tr><th className="px-6 py-3">Role</th><th className="px-6 py-3">Company</th><th className="px-6 py-3">Match</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Submitted</th></tr></thead><tbody className="divide-y divide-slate-100">{applications.map((application) => <tr key={application._id}><td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-900">{application.job?.title || 'Role unavailable'}</td><td className="whitespace-nowrap px-6 py-4 text-slate-600">{application.job?.company || 'Company unavailable'}</td><td className="whitespace-nowrap px-6 py-4 font-semibold text-emerald-700">{application.match?.finalScore || 0}%</td><td className="px-6 py-4"><span className={`badge capitalize ${statusStyles[application.status] || statusStyles.applied}`}>{application.status}</span></td><td className="whitespace-nowrap px-6 py-4 text-slate-500">{new Date(application.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div> : <div className="px-6 py-8 text-sm text-slate-500">Your submitted applications will appear here.</div>}</div>
        </section>
      </>}
    </div>
  );
}
