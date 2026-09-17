import api from './axios';

export const getJobs = (params = {}) => api.get('/jobs', { params });
export const getJobById = (id) => api.get(`/jobs/${id}`);
export const getMyJobs = () => api.get('/jobs/mine');
export const createJob = (job) => api.post('/jobs', job);
export const updateJob = (id, job) => api.put(`/jobs/${id}`, job);
export const updateJobStatus = (id, status) => api.patch(`/jobs/${id}/status`, { status });
export const deleteJob = (id) => api.delete(`/jobs/${id}`);