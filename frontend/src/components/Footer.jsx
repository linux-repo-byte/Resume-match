import { Link } from 'react-router-dom';

const navigationLinks = [
  { label: 'Home', to: '/' },
  { label: 'Browse jobs', to: '/jobs' },
  { label: 'Sign in', to: '/login' },
  { label: 'Create account', to: '/register' },
];

const productLinks = [
  { label: 'For candidates', to: '/jobs' },
  { label: 'For recruiters', to: '/recruiter' },
  { label: 'Profile', to: '/profile' },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
          <div className="max-w-xs">
            <Link to="/" className="inline-flex items-center gap-2 text-white" aria-label="ResumeMatch home">
              <img src="/logo-mark.svg" alt="ResumeMatch logo" className="h-9 w-9 rounded-lg object-cover" />
              <span className="text-lg font-bold tracking-tight">Resume<span className="text-brand-400">Match</span></span>
            </Link>
            <p className="mt-4 text-sm leading-6 text-slate-400">A clearer way for candidates and recruiters to find the right fit.</p>
            <div className="mt-5 flex items-center gap-3">
              <a className="footer-social" href="https://github.com/" target="_blank" rel="noreferrer" aria-label="ResumeMatch on GitHub">GH</a>
              <a className="footer-social" href="https://www.linkedin.com/" target="_blank" rel="noreferrer" aria-label="ResumeMatch on LinkedIn">in</a>
              <a className="footer-social" href="mailto:hello@resumematch.app" aria-label="Email ResumeMatch">@</a>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">Explore</h2>
            <nav className="mt-4 flex flex-col items-start gap-3" aria-label="Explore links">
              {navigationLinks.map((link) => <Link key={link.to} className="footer-link" to={link.to}>{link.label}</Link>)}
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">Platform</h2>
            <nav className="mt-4 flex flex-col items-start gap-3" aria-label="Platform links">
              {productLinks.map((link) => <Link key={link.to} className="footer-link" to={link.to}>{link.label}</Link>)}
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">Get in touch</h2>
            <p className="mt-4 text-sm leading-6 text-slate-400">Questions about ResumeMatch or your next opportunity?</p>
            <a className="mt-3 inline-flex text-sm font-semibold text-brand-300 transition hover:text-white" href="mailto:hello@resumematch.app">hello@resumematch.app</a>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-700 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ResumeMatch. All rights reserved.</p>
          <p>Built for better matches.</p>
        </div>
      </div>
    </footer>
  );
}
