import api from './axios';

export const getAdminStats = () => api.get('/admin/stats');
export const getAdminUsers = () => api.get('/admin/users');
export const createAdminUser = (payload) => api.post('/admin/users', payload);
export const updateAdminUser = (id, payload) => api.patch(`/admin/users/${id}`, payload);
export const deleteAdminUser = (id) => api.delete(`/admin/users/${id}`);
export const getAdminJobs = () => api.get('/admin/jobs');
export const updateAdminJob = (id, payload) => api.patch(`/admin/jobs/${id}`, payload);
export const deleteAdminJob = (id) => api.delete(`/admin/jobs/${id}`);
export const getAdminResumes = () => api.get('/admin/resumes');
export const deleteAdminResume = (id) => api.delete(`/admin/resumes/${id}`);
export const getAdminApplications = () => api.get('/admin/applications');
export const updateAdminApplication = (id, payload) => api.patch(`/admin/applications/${id}`, payload);
export const deleteAdminApplication = (id) => api.delete(`/admin/applications/${id}`);
