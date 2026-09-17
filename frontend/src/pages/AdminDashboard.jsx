import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProfileAvatar from '../components/ProfileAvatar';
import AdminAnalytics from '../components/AdminAnalytics';
import {
  createAdminUser, deleteAdminApplication, deleteAdminJob, deleteAdminResume, deleteAdminUser,
  getAdminApplications, getAdminJobs, getAdminResumes, getAdminStats, getAdminUsers,
  updateAdminApplication, updateAdminJob, updateAdminUser,
} from '../api/adminApi';
import { firstValidationError, validateUserForm } from '../utils/validation';

const tabs = ['overview', 'users', 'jobs', 'resumes', 'applications'];
const emptyUser = { name: '', email: '', password: '', role: 'candidate', company: '' };

function Metric({ label, value, detail }) {
  return <div className="card"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>{detail && <p className="mt-1 text-xs text-slate-500">{detail}</p>}</div>;
}

function RecordTable({ headers, rows }) {
  return <div className="card overflow-x-auto !p-0"><table className="min-w-full text-left text-sm"><thead className="border-b bg-slate-50"><tr>{headers.map((heading) => <th key={heading} className="px-4 py-3 font-semibold text-slate-500">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.length ? rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex} className="max-w-xs px-4 py-3 align-top text-slate-700">{cell}</td>)}</tr>) : <tr><td colSpan={headers.length} className="px-4 py-10 text-center text-slate-500">No records found.</td></tr>}</tbody></table></div>;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [userForm, setUserForm] = useState(emptyUser);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [statsResponse, usersResponse, jobsResponse, resumesResponse, applicationsResponse] = await Promise.all([
        getAdminStats(), getAdminUsers(), getAdminJobs(), getAdminResumes(), getAdminApplications(),
      ]);
      setStats(statsResponse.data.stats); setUsers(usersResponse.data.users); setJobs(jobsResponse.data.jobs);
      setResumes(resumesResponse.data.resumes); setApplications(applicationsResponse.data.applications);
    } catch (err) { setError(err.response?.data?.message || 'Unable to load admin data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const remove = async (action, message) => {
    if (!window.confirm(message)) return;
    try { await action(); await load(); } catch (err) { setError(err.response?.data?.message || 'Action failed'); }
  };

  const submitUser = async (event) => {
    event.preventDefault();
    const validationErrors = validateUserForm(userForm, { passwordRequired: !editingUser });
    if (Object.keys(validationErrors).length) {
      setError(firstValidationError(validationErrors));
      return;
    }
    try {
      if (editingUser) await updateAdminUser(editingUser._id, { ...userForm, password: userForm.password || undefined });
      else await createAdminUser(userForm);
      setUserForm(emptyUser); setEditingUser(null); await load();
    } catch (err) { setError(err.response?.data?.message || 'Could not save user'); }
  };

  if (loading && !stats) return <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-500">Loading admin workspace...</div>;

  return <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Control center</p><div className="mt-1 flex items-center gap-3"><ProfileAvatar user={user} className="h-12 w-12" textClassName="text-lg" /><h1 className="text-3xl font-bold text-slate-900">Welcome, {user.name.split(' ')[0]}</h1></div><p className="mt-1 text-sm text-slate-600">Manage the platform and inspect matching intelligence.</p></div><button onClick={load} className="btn-secondary">Refresh data</button></div>
    {error && <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
    <div className="mb-7 flex gap-2 overflow-x-auto border-b border-slate-200 pb-px">{tabs.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap px-3 py-2 text-sm font-semibold capitalize ${activeTab === tab ? 'border-b-2 border-brand-600 text-brand-700' : 'text-slate-500'}`}>{tab}</button>)}</div>

    {activeTab === 'overview' && stats && <><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><Metric label="Users" value={stats.users} /><Metric label="Jobs" value={stats.jobs} /><Metric label="Resumes" value={stats.resumes} /><Metric label="Applications" value={stats.applications} /><Metric label="Average match" value={`${stats.averageMatchScore}%`} detail={`Top score ${stats.topMatchScore}%`} /></div><div className="mt-6 grid gap-6 lg:grid-cols-2"><div className="card"><h2 className="font-semibold text-slate-900">User distribution</h2>{['candidate', 'recruiter', 'admin'].map((role) => <div key={role} className="mt-4 flex items-center justify-between text-sm"><span className="capitalize text-slate-600">{role}s</span><span className="font-bold text-slate-900">{stats.roles?.[role] || 0}</span></div>)}</div><div className="card"><h2 className="font-semibold text-slate-900">Matching algorithms</h2><p className="mt-3 text-sm leading-6 text-slate-600">Applications use TF-IDF text vectors and cosine similarity, weighted skill matching, skill-gap detection, experience and education scoring, and a persisted 0-100 final score.</p><div className="mt-4 flex flex-wrap gap-2">{['TF-IDF', 'Cosine similarity', 'Weighted skills', 'Skill gap', 'Resume scoring'].map((name) => <span key={name} className="badge bg-brand-50 text-brand-700">{name}</span>)}</div></div></div><AdminAnalytics users={users} jobs={jobs} applications={applications} /></>}

    {activeTab === 'users' && <div className="grid gap-6 lg:grid-cols-[320px_1fr]"><form onSubmit={submitUser} className="card h-fit space-y-3"><h2 className="font-semibold text-slate-900">{editingUser ? 'Edit user' : 'Create user'}</h2>{['name', 'email', 'password', 'company'].map((field) => <input key={field} className="input-field" type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'} required={field !== 'company' && (!editingUser || field !== 'password')} placeholder={field[0].toUpperCase() + field.slice(1)} value={userForm[field] || ''} onChange={(event) => setUserForm({ ...userForm, [field]: event.target.value })} />)}<select className="input-field" value={userForm.role} onChange={(event) => setUserForm({ ...userForm, role: event.target.value })}>{['candidate', 'recruiter', 'admin'].map((role) => <option key={role}>{role}</option>)}</select><button className="btn-primary w-full">{editingUser ? 'Save changes' : 'Create user'}</button>{editingUser && <button type="button" className="btn-secondary w-full" onClick={() => { setEditingUser(null); setUserForm(emptyUser); }}>Cancel edit</button>}</form><div className="card overflow-x-auto !p-0"><table className="min-w-full text-left text-sm"><thead className="border-b bg-slate-50"><tr>{['Name', 'Email', 'Role', 'Status', 'Actions'].map((heading) => <th key={heading} className="px-4 py-3 font-semibold text-slate-500">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{users.map((item) => <tr key={item._id}><td className="px-4 py-3 font-semibold">{item.name}</td><td className="px-4 py-3 text-slate-600">{item.email}</td><td className="px-4 py-3 capitalize">{item.role}</td><td className="px-4 py-3">{item.isActive ? 'Active' : 'Disabled'}</td><td className="space-x-2 px-4 py-3"><button className="text-brand-600" onClick={() => { setEditingUser(item); setUserForm({ name: item.name, email: item.email, password: '', role: item.role, company: item.company || '' }); }}>Edit</button><button className="text-red-600" onClick={() => remove(() => deleteAdminUser(item._id), 'Delete this user?')}>Delete</button></td></tr>)}</tbody></table></div></div>}

    {activeTab === 'jobs' && <RecordTable headers={['Title', 'Recruiter', 'Status', 'Actions']} rows={jobs.map((item) => [item.title, item.recruiter?.email || 'Unknown', item.status, <><button className="mr-3 text-brand-600" onClick={async () => { await updateAdminJob(item._id, { status: item.status === 'open' ? 'closed' : 'open' }); await load(); }}>{item.status === 'open' ? 'Close' : 'Open'}</button><button className="text-red-600" onClick={() => remove(() => deleteAdminJob(item._id), 'Delete this job and applications?')}>Delete</button></>])} />}
    {activeTab === 'resumes' && <RecordTable headers={['File', 'Candidate', 'Status', 'Score', 'Actions']} rows={resumes.map((item) => [item.originalFileName, item.candidate?.email || 'Unknown', item.status, item.analysis?.resumeScore ?? 'N/A', <button className="text-red-600" onClick={() => remove(() => deleteAdminResume(item._id), 'Delete this resume and related applications?')}>Delete</button>])} />}
    {activeTab === 'applications' && <RecordTable headers={['Candidate', 'Job', 'Final score', 'Skill gap', 'Status', 'Actions']} rows={applications.map((item) => [item.candidate?.email || 'Unknown', item.job?.title || 'Unknown', `${item.match?.finalScore ?? 0}%`, item.match?.missingSkills?.join(', ') || 'None', <select className="rounded border border-slate-300 px-2 py-1" value={item.status} onChange={async (event) => { await updateAdminApplication(item._id, { status: event.target.value }); await load(); }}>{['applied', 'reviewing', 'shortlisted', 'rejected', 'withdrawn'].map((status) => <option key={status}>{status}</option>)}</select>, <button className="text-red-600" onClick={() => remove(() => deleteAdminApplication(item._id), 'Delete this application?')}>Delete</button>])} />}
  </div>;
}
