import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function AdminAnalytics({ users, jobs, applications }) {
  const roleData = ['candidate', 'recruiter', 'admin'].map((role) => ({ name: role, value: users.filter((user) => user.role === role).length }));
  const jobStatusData = ['open', 'closed', 'expired'].map((status) => ({ name: status, jobs: jobs.filter((job) => job.status === status).length }));
  const applicationData = ['applied', 'reviewing', 'shortlisted', 'rejected'].map((status) => ({ name: status, value: applications.filter((application) => application.status === status).length }));
  const colors = ['#4f46e5', '#10b981', '#f59e0b'];

  return (
    <section className="mt-6">
      <div className="mb-5"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Platform analytics</p><h2 className="mt-1 text-xl font-semibold text-slate-900">System activity overview</h2><p className="mt-1 text-sm text-slate-500">Live signals across users, jobs, and applications.</p></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card min-w-0"><div className="mb-4"><h3 className="font-semibold text-slate-900">User distribution</h3><p className="mt-1 text-xs text-slate-500">Accounts by platform role.</p></div><div className="h-60"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={roleData} dataKey="value" nameKey="name" innerRadius={54} outerRadius={82} paddingAngle={3}>{roleData.map((entry, index) => <Cell key={entry.name} fill={colors[index]} />)}</Pie><Tooltip /><Legend verticalAlign="bottom" height={30} /></PieChart></ResponsiveContainer></div></div>
        <div className="card min-w-0"><div className="mb-4"><h3 className="font-semibold text-slate-900">Job status overview</h3><p className="mt-1 text-xs text-slate-500">Current state of all platform jobs.</p></div><div className="h-60"><ResponsiveContainer width="100%" height="100%"><BarChart data={jobStatusData} margin={{ top: 8, right: 8, left: -20, bottom: 8 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} /><Tooltip cursor={{ fill: '#eef2ff' }} /><Bar dataKey="jobs" name="Jobs" fill="#4f46e5" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
      </div>
      <div className="card mt-6"><div className="mb-4"><h3 className="font-semibold text-slate-900">Application workflow</h3><p className="mt-1 text-xs text-slate-500">Candidate movement through the platform.</p></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{applicationData.map((stage, index) => <div className="rounded-xl bg-slate-50 p-4" key={stage.name}><div className="flex items-center justify-between"><span className="text-sm capitalize text-slate-500">{stage.name}</span><span className="text-2xl font-bold text-slate-900">{stage.value}</span></div><div className="mt-3 h-2 rounded-full bg-slate-200"><div className={`h-full rounded-full ${index === 1 ? 'bg-amber-500' : index === 2 ? 'bg-emerald-500' : 'bg-brand-600'}`} style={{ width: `${applications.length ? Math.max(8, (stage.value / applications.length) * 100) : 0}%` }} /></div></div>)}</div></div>
    </section>
  );
}
