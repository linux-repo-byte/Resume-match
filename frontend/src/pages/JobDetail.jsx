import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getJobById } from '../api/jobApi';
import { applyToJob } from '../api/applicationApi';
import { getMyResumes } from '../api/resumeApi';
import { formatJobDate, getJobDuration, getRemainingJobTime } from '../utils/jobDates';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [applicationError, setApplicationError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: jobData }, resumeData] = await Promise.all([getJobById(id), user?.role === 'candidate' ? getMyResumes() : Promise.resolve(null)]);
        setJob(jobData.job);
        if (resumeData) {
          const parsed = resumeData.data.resumes.filter((resume) => resume.status === 'parsed');
          setResumes(parsed);
          setResumeId(parsed[0]?._id || '');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load this job');
      } finally { setLoading(false); }
    };
    load();
  }, [id, user?.role]);

  const submitApplication = async (event) => {
    event.preventDefault();
    if (!resumeId) {
      setApplicationError('Please select a parsed resume before applying.');
      return;
    }
    if (coverLetter.length > 5000) {
      setApplicationError('Cover letter must be 5,000 characters or fewer.');
      return;
    }
    setApplicationError('');
    setApplying(true);
    try {
      await applyToJob(id, { resumeId, coverLetter: coverLetter.trim() });
      setMessage('Application submitted. Your compatibility score has been saved.');
      setError('');
    } catch (err) { setError(err.response?.data?.message || 'Unable to submit application'); }
    finally { setApplying(false); }
  };

  if (loading) return <p className="px-6 py-16 text-center text-sm text-slate-500">Loading job...</p>;
  if (error && !job) return <div className="mx-auto max-w-4xl px-4 py-16"><p className="text-sm text-red-600">{error}</p></div>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <button onClick={() => navigate(-1)} className="text-sm font-semibold text-brand-600">← Back</button>
      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_360px]">
        <article className="card">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-6">
            <div><p className="text-sm font-semibold text-brand-600">{job.company || job.recruiter?.company || 'Open role'}</p><h1 className="mt-2 text-3xl font-bold text-slate-900">{job.title}</h1><p className="mt-2 text-sm text-slate-600">{job.location || 'Remote'} · <span className="capitalize">{job.employmentType}</span></p><div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-slate-500"><span>Posted: <strong className="font-semibold text-slate-700">{formatJobDate(job.createdAt)}</strong></span><span>Expires: <strong className="font-semibold text-slate-700">{formatJobDate(job.expiresAt)}</strong></span><span>Duration: <strong className="font-semibold text-slate-700">{getJobDuration(job)}</strong></span><span className="font-semibold text-brand-700">{getRemainingJobTime(job.expiresAt)}</span></div></div>
            {job.compatibility && <div className="rounded-xl bg-emerald-50 px-4 py-3 text-center"><p className="text-2xl font-bold text-emerald-700">{job.compatibility.finalScore}%</p><p className="text-xs text-emerald-700">compatibility</p></div>}
          </div>
          <section className="mt-7"><h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">About the role</h2><p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">{job.description}</p></section>
          <section className="mt-7"><h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Requirements</h2><div className="mt-3 grid gap-5 sm:grid-cols-2"><div><h3 className="text-sm font-semibold text-slate-900">Required skills</h3><div className="mt-2 flex flex-wrap gap-2">{job.requiredSkills.map((skill) => <span className="badge bg-brand-50 text-brand-700" key={skill.name}>{skill.name}</span>)}</div></div><div><h3 className="text-sm font-semibold text-slate-900">Preferred skills</h3><div className="mt-2 flex flex-wrap gap-2">{job.preferredSkills.map((skill) => <span className="badge bg-slate-100 text-slate-700" key={skill.name}>{skill.name}</span>)}</div></div></div><p className="mt-5 text-sm text-slate-700"><strong>{job.requiredExperience} years</strong> experience · <strong>{job.educationRequirement || 'Relevant education'}</strong></p></section>
          {job.compatibility && <section className="mt-7 border-t border-slate-100 pt-6"><h2 className="text-sm font-semibold text-slate-900">Your match</h2><div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">{[['Skills', job.compatibility.skillScore], ['Text', job.compatibility.similarityScore], ['Experience', job.compatibility.experienceScore], ['Education', job.compatibility.educationScore]].map(([label, value]) => <div className="rounded-lg bg-slate-50 p-3" key={label}><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-lg font-bold text-slate-900">{value}%</p></div>)}</div><p className="mt-4 text-sm text-slate-600">Missing required skills: {job.compatibility.missingSkills.join(', ') || 'None'}</p></section>}
        </article>
        {user?.role === 'candidate' && <form onSubmit={submitApplication} className="card h-fit lg:sticky lg:top-24"><h2 className="text-lg font-semibold text-slate-900">Apply for this role</h2><p className="mt-2 text-sm leading-6 text-slate-600">Choose the parsed resume you want recruiters to review.</p><label className="label-text mt-6">Resume</label><select className={`input-field ${applicationError && !resumeId ? 'border-red-500' : ''}`} required value={resumeId} onChange={(event) => { setResumeId(event.target.value); setApplicationError(''); }}><option value="">Select a resume</option>{resumes.map((resume) => <option value={resume._id} key={resume._id}>{resume.originalFileName}</option>)}</select><label className="label-text mt-4">Cover letter <span className="font-normal text-slate-400">(optional)</span></label><textarea className={`input-field min-h-32 ${applicationError && coverLetter.length > 5000 ? 'border-red-500' : ''}`} maxLength={5000} value={coverLetter} onChange={(event) => { setCoverLetter(event.target.value); setApplicationError(''); }} placeholder="Tell the team why this role fits you." />{applicationError && <p className="mt-1 text-sm text-red-600">{applicationError}</p>}<button className="btn-primary mt-5 w-full" disabled={applying || !resumeId}>{applying ? 'Submitting...' : 'Submit application'}</button>{message && <p className="mt-4 text-sm text-emerald-700">{message}</p>}{error && <p className="mt-4 text-sm text-red-600">{error}</p>}{!resumes.length && <Link to="/candidate/resumes" className="mt-4 block text-sm font-semibold text-brand-600">Upload a resume first</Link>}</form>}
      </div>
    </div>
  );
}