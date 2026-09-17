import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function RecruiterAnalytics({ jobs, applications }) {
  const applicationCounts = applications.reduce((counts, application) => ({ ...counts, [application.status]: (counts[application.status] || 0) + 1 }), {});
  const statusData = [
    { name: 'Active', value: jobs.filter((job) => job.status === 'open').length, color: '#4f46e5' },
    { name: 'Closed', value: jobs.filter((job) => job.status === 'closed').length, color: '#94a3b8' },
    { name: 'Expired', value: jobs.filter((job) => job.status === 'expired').length, color: '#f59e0b' },
  ];
  const employmentData = [...new Set(jobs.map((job) => job.employmentType).filter(Boolean))].map((type) => ({ name: type.replace('-', ' '), jobs: jobs.filter((job) => job.employmentType === type).length }));
  const pipelineData = [
    { name: 'Applications', value: applications.length },
    { name: 'Reviewing', value: applicationCounts.reviewing || 0 },
    { name: 'Shortlisted', value: applicationCounts.shortlisted || 0 },
  ];
  const shortlistedCount = applicationCounts.shortlisted || 0;

  return (
    <section className="mb-10">
      <div className="mb-5"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Recruitment analytics</p><h2 className="mt-1 text-xl font-semibold text-slate-900">Your hiring overview</h2><p className="mt-1 text-sm text-slate-500">Live insights from the jobs and applications you manage.</p></div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[['Total jobs', jobs.length, 'All postings'], ['Active jobs', statusData[0].value, 'Visible to candidates'], ['Applications', applications.length, 'Received so far'], ['Shortlisted', shortlistedCount, 'Candidates to review'], ['Closed jobs', statusData[1].value, 'Manually closed']].map(([label, value, detail]) => <div className="card p-5" key={label}><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-400">{detail}</p></div>)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card min-w-0"><div className="mb-4"><h3 className="font-semibold text-slate-900">Job status distribution</h3><p className="mt-1 text-xs text-slate-500">How your current postings are distributed.</p></div><div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={58} outerRadius={88} paddingAngle={3}>{statusData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip /><Legend verticalAlign="bottom" height={30} /></PieChart></ResponsiveContainer></div></div>
        <div className="card min-w-0"><div className="mb-4"><h3 className="font-semibold text-slate-900">Jobs by employment type</h3><p className="mt-1 text-xs text-slate-500">Compare the roles in your managed job pool.</p></div><div className="h-64">{employmentData.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={employmentData} margin={{ top: 8, right: 8, left: -20, bottom: 8 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} /><Tooltip cursor={{ fill: '#eef2ff' }} /><Bar dataKey="jobs" name="Jobs" fill="#4f46e5" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer> : <div className="grid h-full place-items-center text-sm text-slate-400">Create jobs to see this breakdown.</div>}</div></div>
      </div>
      <div className="card mt-6"><div className="mb-4"><h3 className="font-semibold text-slate-900">Recruitment pipeline</h3><p className="mt-1 text-xs text-slate-500">A snapshot of candidate progress across your applications.</p></div><div className="grid gap-3 sm:grid-cols-3">{pipelineData.map((stage, index) => <div className="relative rounded-xl bg-slate-50 p-4" key={stage.name}><div className="flex items-center justify-between"><span className="text-sm text-slate-500">{stage.name}</span><span className="text-2xl font-bold text-slate-900">{stage.value}</span></div><div className="mt-3 h-2 rounded-full bg-slate-200"><div className={`h-full rounded-full ${index === 0 ? 'bg-brand-600' : index === 1 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${applications.length ? Math.max(8, (stage.value / applications.length) * 100) : 0}%` }} /></div></div>)}</div></div>
    </section>
  );
}
