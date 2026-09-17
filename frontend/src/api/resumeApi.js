import api from './axios';

/**
 * Uploads a resume file (PDF or DOCX).
 *
 * Note: we explicitly unset the Content-Type header here. The shared
 * `api` instance defaults to 'application/json' for every request, but
 * multipart/form-data requests need the browser to set the header itself
 * (including the multipart boundary) — if we leave the JSON header in
 * place, the server will fail to parse the form data.
 */
export const uploadResume = (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('resume', file);
  return api.post('/resumes/upload', formData, {
    headers: { 'Content-Type': undefined },
    onUploadProgress,
  });
};

export const getMyResumes = () => api.get('/resumes/my');

export const getResumeById = (id) => api.get(`/resumes/${id}`);

export const getResumeAnalysis = (id) => api.get(`/resumes/${id}/analysis`);

export const deleteResume = (id) => api.delete(`/resumes/${id}`);

/**
 * Downloads the original resume file and triggers a browser save-as.
 *
 * A plain `<a href="/api/resumes/:id/download">` won't work here because
 * the download route requires the Authorization header — browsers don't
 * attach custom headers to normal link navigations. So instead we fetch
 * the file as a blob (the shared axios instance attaches the JWT for us),
 * then create a temporary object URL to trigger the save dialog.
 */
export const downloadResumeFile = async (id, fileName) => {
  try {
    const response = await api.get(`/resumes/${id}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'resume';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  } catch (error) {
    if (error.response?.data instanceof Blob) {
      try {
        const payload = JSON.parse(await error.response.data.text());
        error.message = payload.message || error.message;
      } catch {
        // Keep the original request error when the response is not JSON.
      }
    }
    throw error;
  }
};
