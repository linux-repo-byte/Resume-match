import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function CandidateAnalytics({ applications, recommendedJobs, resumeScore, coverage }) {
  const statusData = ['applied', 'reviewing', 'shortlisted', 'rejected'].map((status) => ({ name: status, value: applications.filter((application) => application.status === status).length }));
  const matchData = recommendedJobs.slice(0, 5).map((job) => ({ name: job.title.length > 14 ? `${job.title.slice(0, 14)}...` : job.title, score: job.compatibility?.finalScore || 0 }));
  const colors = ['#94a3b8', '#f59e0b', '#10b981', '#ef4444'];

  return (
    <section className="mt-6">
      <div className="mb-5"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Profile analytics</p><h2 className="mt-1 text-xl font-semibold text-slate-900">Your progress at a glance</h2><p className="mt-1 text-sm text-slate-500">A visual summary of your profile strength and application activity.</p></div>
      <div className="mb-6 grid gap-4 sm:grid-cols-3"><div className="card p-5"><p className="text-sm text-slate-500">Resume score</p><p className="mt-2 text-3xl font-bold text-slate-900">{resumeScore}%</p><div className="mt-3 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand-600" style={{ width: `${resumeScore}%` }} /></div></div><div className="card p-5"><p className="text-sm text-slate-500">Skill coverage</p><p className="mt-2 text-3xl font-bold text-slate-900">{coverage}%</p><div className="mt-3 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${coverage}%` }} /></div></div><div className="card p-5"><p className="text-sm text-slate-500">Applications sent</p><p className="mt-2 text-3xl font-bold text-slate-900">{applications.length}</p><p className="mt-1 text-xs text-slate-400">Across available roles</p></div></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card min-w-0"><div className="mb-4"><h3 className="font-semibold text-slate-900">Application status</h3><p className="mt-1 text-xs text-slate-500">Where your applications currently stand.</p></div><div className="h-60"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusData} dataKey="value" nameKey="name" innerRadius={54} outerRadius={82} paddingAngle={3}>{statusData.map((entry, index) => <Cell key={entry.name} fill={colors[index]} />)}</Pie><Tooltip /><Legend verticalAlign="bottom" height={30} /></PieChart></ResponsiveContainer></div></div>
        <div className="card min-w-0"><div className="mb-4"><h3 className="font-semibold text-slate-900">Recommended job matches</h3><p className="mt-1 text-xs text-slate-500">Your strongest current role matches.</p></div><div className="h-60">{matchData.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={matchData} margin={{ top: 8, right: 8, left: -20, bottom: 8 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} /><YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} /><Tooltip formatter={(value) => [`${value}%`, 'Match']} /><Bar dataKey="score" name="Match" fill="#10b981" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer> : <div className="grid h-full place-items-center text-sm text-slate-400">Upload a resume to see match trends.</div>}</div></div>
      </div>
    </section>
  );
}
