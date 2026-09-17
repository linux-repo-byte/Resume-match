import api from './axios';

export const getCandidateDashboard = () => api.get('/applications/dashboard');
export const getMyApplications = () => api.get('/applications/mine');
export const applyToJob = (jobId, application) => api.post(`/applications/job/${jobId}`, application);
export const getJobApplications = (jobId) => api.get(`/applications/job/${jobId}`);
export const updateApplicationStatus = (id, status) => api.patch(`/applications/${id}/status`, { status });

export const downloadCoverLetterFile = async (id, fileName) => {
	const response = await api.get(`/applications/${id}/cover-letter`, { responseType: 'blob' });
	const url = window.URL.createObjectURL(response.data);
	const link = document.createElement('a');
	link.href = url;
	link.download = fileName || 'cover-letter.pdf';
	document.body.appendChild(link);
	link.click();
	link.remove();
	window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
};

export const downloadApplicationResumeFile = async (id, fileName) => {
	const response = await api.get(`/applications/${id}/resume`, { responseType: 'blob' });
	const url = window.URL.createObjectURL(response.data);
	const link = document.createElement('a');
	link.href = url;
	link.download = fileName || 'resume';
	document.body.appendChild(link);
	link.click();
	link.remove();
	window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
};