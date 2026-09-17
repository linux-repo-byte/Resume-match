import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getResumeById, getResumeAnalysis, downloadResumeFile } from '../api/resumeApi';

const statusStyles = {
  parsed: 'bg-emerald-100 text-emerald-700',
  processing: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-700',
};

export default function ResumeDetail() {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [analysisError, setAnalysisError] = useState('');

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const { data } = await getResumeById(id);
        setResume(data.resume);
        if (data.resume.status === 'parsed') {
          const analysisResponse = await getResumeAnalysis(id);
          setAnalysis(analysisResponse.data.analysis);
        }
      } catch (err) {
        if (err.config?.url?.includes('/analysis')) {
          setAnalysisError(err.response?.data?.message || 'Failed to analyze resume');
        } else {
          setError(err.response?.data?.message || 'Failed to load resume');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [id]);

  if (loading) {
    return <p className="px-6 py-16 text-center text-sm text-slate-500">Loading…</p>;
  }

  if (error || !resume) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <p className="text-sm text-red-600">{error || 'Resume not found'}</p>
        <Link to="/candidate/resumes" className="btn-secondary mt-4 inline-flex">
          Back to resumes
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link to="/candidate/resumes" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
        ← Back to resumes
      </Link>

      <div className="card mt-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{resume.originalFileName}</h1>
            <p className="mt-1 text-sm text-slate-600">
              Uploaded {new Date(resume.createdAt).toLocaleString()}
            </p>
          </div>
          <span className={`badge capitalize ${statusStyles[resume.status] || 'bg-slate-100 text-slate-700'}`}>
            {resume.status}
          </span>
        </div>

        {resume.status === 'parsed' && (
          <div className="mt-6 grid grid-cols-3 gap-4 border-y border-slate-100 py-4">
            <div>
              <p className="text-xs text-slate-500">Words</p>
              <p className="text-lg font-semibold text-slate-900">{resume.textStats?.wordCount ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Lines</p>
              <p className="text-lg font-semibold text-slate-900">{resume.textStats?.lineCount ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Characters</p>
              <p className="text-lg font-semibold text-slate-900">{resume.textStats?.characterCount ?? '—'}</p>
            </div>
          </div>
        )}

        {analysis && (
          <div className="mt-6 border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Resume analysis</h3>
              <span className="badge bg-brand-100 text-brand-700">Score {analysis.resumeScore}/100</span>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Skills</h4>
                <p className="mt-1 text-sm text-slate-700">
                  {analysis.skills.map((skill) => skill.name).join(', ') || 'None detected'}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Education</h4>
                <p className="mt-1 text-sm text-slate-700">
                  {analysis.education.map((item) => [item.degree, item.institution].filter(Boolean).join(' - ')).join('; ') || 'None detected'}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Experience</h4>
                <p className="mt-1 text-sm text-slate-700">{analysis.experience.length} position(s) detected</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Projects</h4>
                <p className="mt-1 text-sm text-slate-700">{analysis.projects.length} project(s) detected</p>
              </div>
            </div>
            {analysisError && <p className="mt-3 text-sm text-red-600">{analysisError}</p>}
          </div>
        )}

        {resume.status === 'failed' && (
          <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            Text extraction failed: {resume.parseError || 'Unknown error'}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => downloadResumeFile(resume._id, resume.originalFileName)}
            className="btn-secondary"
          >
            Download original file
          </button>
        </div>

        {resume.status === 'parsed' && (
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-semibold text-slate-900">Extracted text</h3>
            <pre className="max-h-[28rem] overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
              {resume.extractedText}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
