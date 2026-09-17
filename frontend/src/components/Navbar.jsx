import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileAvatar from './ProfileAvatar';

const roleBadgeStyles = {
  candidate: 'bg-emerald-100 text-emerald-700',
  recruiter: 'bg-brand-100 text-brand-700',
  admin: 'bg-amber-100 text-amber-700',
};

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo-mark.svg" alt="ResumeMatch logo" className="h-9 w-9 rounded-lg object-cover" />
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Resume<span className="text-brand-600">Match</span>
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to={user.role === 'admin' ? '/admin' : user.role === 'recruiter' ? '/recruiter' : '/jobs'} className="hidden text-sm font-semibold text-slate-600 hover:text-brand-600 sm:inline">
                {user.role === 'admin' ? 'Admin panel' : user.role === 'recruiter' ? 'Manage jobs' : 'Browse jobs'}
              </Link>
              {user.role === 'recruiter' && <>
                <Link to="/recruiter/jobs/active" className="hidden text-sm font-semibold text-slate-600 hover:text-brand-600 lg:inline">Open jobs</Link>
                <Link to="/recruiter/jobs/expired" className="hidden text-sm font-semibold text-slate-600 hover:text-brand-600 lg:inline">Expired jobs</Link>
                <Link to="/recruiter/pipeline" className="hidden text-sm font-semibold text-slate-600 hover:text-brand-600 lg:inline">Pipeline</Link>
              </>}
              <span
                className={`badge hidden sm:inline-flex ${roleBadgeStyles[user.role] || 'bg-slate-100 text-slate-700'}`}
              >
                {user.role}
              </span>
              <div className="relative">
                <button type="button" className="flex items-center gap-2 rounded-lg p-1 text-sm text-slate-600 hover:bg-slate-50" onClick={() => setProfileOpen((current) => !current)} aria-expanded={profileOpen} aria-haspopup="menu" aria-label="Open profile menu">
                  <ProfileAvatar user={user} className="h-8 w-8" textClassName="text-xs" />
                  <span className="hidden sm:inline">Hi, {user.name.split(' ')[0]}</span>
                </button>
                {profileOpen && <div className="absolute right-0 top-12 z-20 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg" role="menu">
                  <Link to="/profile" className="block rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={() => setProfileOpen(false)} role="menuitem">Profile</Link>
                  <Link to="/profile/password" className="block rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={() => setProfileOpen(false)} role="menuitem">Change Password</Link>
                  <button type="button" className="block w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50" onClick={() => { setProfileOpen(false); handleLogout(); }} role="menuitem">Log out</button>
                </div>}
              </div>
              <button type="button" className="btn-secondary h-10 w-10 p-0 text-lg" onClick={() => setDarkMode((current) => !current)} aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`} title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}>
                {darkMode ? '☀' : '☾'}
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn-secondary h-10 w-10 p-0 text-lg" onClick={() => setDarkMode((current) => !current)} aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`} title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}>
                {darkMode ? '☀' : '☾'}
              </button>
              <Link to="/login" className="btn-secondary">
                Log in
              </Link>
              <Link to="/register" className="btn-primary">
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
