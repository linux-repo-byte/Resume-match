import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyResumes, uploadResume, deleteResume, downloadResumeFile } from '../api/resumeApi';

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

const statusStyles = {
  parsed: 'bg-emerald-100 text-emerald-700',
  processing: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-700',
};

const formatBytes = (bytes) => {
  if (!bytes) return '0 KB';
  const kb = bytes / 1024;
  return kb < 1024 ? `${kb.toFixed(0)} KB` : `${(kb / 1024).toFixed(1)} MB`;
};

export default function ResumesPage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const fetchResumes = async () => {
    try {
      const { data } = await getMyResumes();
      setResumes(data.resumes);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your resumes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const validateFile = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Only PDF and DOCX files are supported';
    }
    if (file.size > MAX_SIZE_BYTES) {
      return 'File must be 5 MB or smaller';
    }
    return null;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      e.target.value = '';
      return;
    }

    setUploadError('');
    setUploading(true);
    setProgress(0);

    try {
      const { data } = await uploadResume(file, (evt) => {
        if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100));
      });
      setResumes((prev) => [data.resume, ...prev]);
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setProgress(0);
      e.target.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resume? This cannot be undone.')) return;
    try {
      await deleteResume(id);
      setResumes((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete resume');
    }
  };

  const handleDownload = async (resume) => {
    try {
      await downloadResumeFile(resume._id, resume.originalFileName);
    } catch (err) {
      setError('Failed to download file');
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Your Resumes</h1>
        <p className="mt-1 text-sm text-slate-600">
          Upload a PDF or DOCX resume. Text is extracted automatically so it's ready for matching.
        </p>
      </div>

      <div className="card mb-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">Upload a new resume</h3>
            <p className="mt-1 text-sm text-slate-600">PDF or DOCX, up to 5 MB.</p>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <button
              type="button"
              className="btn-primary"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? `Uploading… ${progress}%` : 'Choose file'}
            </button>
          </div>
        </div>
        {uploadError && (
          <div className="mt-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {uploadError}
          </div>
        )}
      </div>

      <div className="card overflow-hidden !p-0">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="font-semibold text-slate-900">Upload history</h3>
        </div>

        {loading ? (
          <p className="px-6 py-8 text-sm text-slate-500">Loading…</p>
        ) : error ? (
          <p className="px-6 py-8 text-sm text-red-600">{error}</p>
        ) : resumes.length === 0 ? (
          <p className="px-6 py-8 text-sm text-slate-500">
            You haven't uploaded any resumes yet. Use the button above to add one.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-slate-500">File</th>
                  <th className="px-6 py-3 text-left font-medium text-slate-500">Type</th>
                  <th className="px-6 py-3 text-left font-medium text-slate-500">Size</th>
                  <th className="px-6 py-3 text-left font-medium text-slate-500">Status</th>
                  <th className="px-6 py-3 text-left font-medium text-slate-500">Uploaded</th>
                  <th className="px-6 py-3 text-right font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resumes.map((r) => (
                  <tr key={r._id}>
                    <td className="max-w-[200px] truncate px-6 py-3 font-medium text-slate-900">
                      {r.originalFileName}
                    </td>
                    <td className="px-6 py-3 uppercase text-slate-600">{r.fileType}</td>
                    <td className="px-6 py-3 text-slate-600">{formatBytes(r.fileSize)}</td>
                    <td className="px-6 py-3">
                      <span className={`badge capitalize ${statusStyles[r.status] || 'bg-slate-100 text-slate-700'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex justify-end gap-3">
                        <Link
                          to={`/candidate/resumes/${r._id}`}
                          className="font-semibold text-brand-600 hover:text-brand-700"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDownload(r)}
                          className="font-semibold text-slate-600 hover:text-slate-800"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => handleDelete(r._id)}
                          className="font-semibold text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
