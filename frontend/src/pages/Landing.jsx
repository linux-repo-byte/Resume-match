import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuth } from '../context/AuthContext';
import RecruiterAnalytics from '../components/RecruiterAnalytics';
import AdminAnalytics from '../components/AdminAnalytics';
import CandidateAnalytics from '../components/CandidateAnalytics';
import { getMyJobs } from '../api/jobApi';
import { getCandidateDashboard, getJobApplications, getMyApplications } from '../api/applicationApi';
import { getAdminApplications, getAdminJobs, getAdminUsers } from '../api/adminApi';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    title: 'Smart Resume Parsing',
    desc: 'Upload a resume and let the platform extract skills, experience, and education automatically. (Coming soon)',
  },
  {
    title: 'AI Job Matching',
    desc: 'Get ranked job recommendations based on how well your profile fits each posting. (Coming soon)',
  },
  {
    title: 'Recruiter Dashboard',
    desc: 'Post openings and instantly see a ranked shortlist of matching candidates.',
  },
];

export default function Landing() {
  const { isAuthenticated, user } = useAuth();
  const pageRef = useRef(null);
  const [recruiterJobs, setRecruiterJobs] = useState([]);
  const [recruiterApplications, setRecruiterApplications] = useState([]);
  const [adminData, setAdminData] = useState({ users: [], jobs: [], applications: [] });
  const [candidateData, setCandidateData] = useState({ dashboard: null, applications: [] });

  useEffect(() => {
    if (!['recruiter', 'candidate', 'admin'].includes(user?.role)) return undefined;
    const loadAnalytics = async () => {
      try {
        if (user.role === 'recruiter') {
          const { data } = await getMyJobs();
          setRecruiterJobs(data.jobs);
          const results = await Promise.all(data.jobs.map((job) => getJobApplications(job._id)));
          setRecruiterApplications(results.flatMap((result) => result.data.applications));
        } else if (user.role === 'candidate') {
          const [{ data: dashboardResponse }, { data: applicationsResponse }] = await Promise.all([getCandidateDashboard(), getMyApplications()]);
          setCandidateData({ dashboard: dashboardResponse.dashboard, applications: applicationsResponse.applications });
        } else {
          const [usersResponse, jobsResponse, applicationsResponse] = await Promise.all([getAdminUsers(), getAdminJobs(), getAdminApplications()]);
          setAdminData({ users: usersResponse.data.users, jobs: jobsResponse.data.jobs, applications: applicationsResponse.data.applications });
        }
      } catch {
        setRecruiterJobs([]);
        setRecruiterApplications([]);
        setAdminData({ users: [], jobs: [], applications: [] });
        setCandidateData({ dashboard: null, applications: [] });
      }
    };
    loadAnalytics();
    return undefined;
  }, [user?.role]);

  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return undefined;

    const hoverCleanups = [];
    const animationContext = gsap.context(() => {
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
      intro
        .from('.landing-hero-item', { opacity: 0, y: 24, duration: 0.7, stagger: 0.1 })
        .from('.landing-hero-actions a', { opacity: 0, y: 10, duration: 0.45, stagger: 0.08 }, '-=0.35');

      gsap.from('.landing-feature-card', {
        opacity: 0,
        y: 36,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: {
          trigger: '.landing-feature-grid',
          start: 'top 82%',
          once: true,
        },
      });

      gsap.from('.landing-feature-icon', {
        scale: 0.7,
        rotation: -8,
        duration: 0.55,
        stagger: 0.12,
        ease: 'back.out(1.7)',
        immediateRender: false,
        scrollTrigger: {
          trigger: '.landing-feature-grid',
          start: 'top 78%',
          once: true,
        },
      });

      gsap.utils.toArray('.landing-feature-card').forEach((card) => {
        const icon = card.querySelector('.landing-feature-icon');
        const handleEnter = () => {
          gsap.to(card, { y: -8, duration: 0.3, ease: 'power2.out', overwrite: true });
          gsap.to(icon, { scale: 1.08, rotate: 4, duration: 0.3, ease: 'power2.out', overwrite: true });
        };
        const handleLeave = () => {
          gsap.to(card, { y: 0, duration: 0.4, ease: 'power2.out', overwrite: true });
          gsap.to(icon, { scale: 1, rotate: 0, duration: 0.4, ease: 'power2.out', overwrite: true });
        };
        card.addEventListener('mouseenter', handleEnter);
        card.addEventListener('mouseleave', handleLeave);
        hoverCleanups.push(() => {
          card.removeEventListener('mouseenter', handleEnter);
          card.removeEventListener('mouseleave', handleLeave);
        });
      });
    }, pageRef);

    return () => {
      hoverCleanups.forEach((cleanup) => cleanup());
      animationContext.revert();
    };
  }, []);

  return (
    <div ref={pageRef}>
      {!['recruiter', 'candidate', 'admin'].includes(user?.role) && <section className="landing-hero mx-auto max-w-6xl px-4 pb-14 pt-12 sm:px-6 sm:pt-16">
        <div className={`grid items-center gap-12 lg:gap-16 ${user?.role === 'recruiter' ? 'lg:grid-cols-1' : 'lg:grid-cols-[1.05fr_.95fr]'}`}>
          <div className="max-w-2xl">
          <span className="landing-hero-item badge bg-brand-100 text-brand-700">Final Year BCA Project</span>
          <h1 className="landing-hero-item mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-6xl">
            Match talent to opportunity, <span className="text-brand-600">intelligently</span>.
          </h1>
          <p className="landing-hero-item mt-5 max-w-xl text-lg leading-8 text-slate-600">
            A platform where candidates, recruiters, and admins collaborate — with resume
            analysis and AI-driven job matching built in.
          </p>
          <div className="landing-hero-item landing-hero-actions mt-8 flex flex-wrap items-center gap-3">
            {isAuthenticated ? (
              <Link to={`/${user.role}`} className="btn-primary">
                Go to your dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary">
                  Create an account
                </Link>
                <Link to="/login" className="btn-secondary">
                  Log in
                </Link>
              </>
            )}
          </div>
          </div>
          {user?.role !== 'recruiter' && <div className="landing-hero-item landing-preview relative mx-auto w-full max-w-md">
            <div className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-card">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Candidate match</p><p className="mt-1 font-semibold text-slate-900">Product designer</p></div><span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-lg font-bold text-emerald-700">94%</span></div>
              <div className="mt-5 space-y-4"><div><div className="mb-2 flex justify-between text-xs text-slate-500"><span>Skills alignment</span><span className="font-semibold text-slate-700">96%</span></div><div className="h-2 rounded-full bg-slate-100"><div className="h-full w-[96%] rounded-full bg-brand-600" /></div></div><div><div className="mb-2 flex justify-between text-xs text-slate-500"><span>Experience</span><span className="font-semibold text-slate-700">88%</span></div><div className="h-2 rounded-full bg-slate-100"><div className="h-full w-[88%] rounded-full bg-emerald-500" /></div></div><div className="flex flex-wrap gap-2 pt-1"><span className="badge bg-brand-50 text-brand-700">Figma</span><span className="badge bg-brand-50 text-brand-700">Research</span><span className="badge bg-emerald-50 text-emerald-700">Strong fit</span></div></div>
            </div>
          </div>}
        </div>
      </section>}

      {user?.role === 'recruiter' && <div className="mx-auto max-w-6xl px-4 sm:px-6"><RecruiterAnalytics jobs={recruiterJobs} applications={recruiterApplications} /></div>}
      {user?.role === 'admin' && <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><div className="landing-analytics-header mb-8"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Admin overview</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Platform analytics</h1><p className="mt-2 text-sm text-slate-600">Live visibility into users, jobs, and application activity.</p></div><div className="landing-analytics-content"><AdminAnalytics users={adminData.users} jobs={adminData.jobs} applications={adminData.applications} /></div></div>}
      {user?.role === 'candidate' && candidateData.dashboard && <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><div className="landing-analytics-header mb-8"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Candidate overview</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Your profile analytics</h1><p className="mt-2 text-sm text-slate-600">Live insights into your resume strength, applications, and job matches.</p></div><div className="landing-analytics-content"><CandidateAnalytics applications={candidateData.applications} recommendedJobs={candidateData.dashboard.recommendedJobs} resumeScore={candidateData.dashboard.resumeScore || 0} coverage={candidateData.dashboard.skillCoverage || 0} /></div></div>}

      {!['admin', 'candidate'].includes(user?.role) && <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="landing-feature-grid grid gap-5 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="landing-feature-card card transition hover:-translate-y-1 hover:shadow-cardHover">
              <div className="landing-feature-icon mb-3 h-10 w-10 rounded-lg bg-brand-50 text-brand-600" />
              <h3 className="text-base font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>}
    </div>
  );
}
