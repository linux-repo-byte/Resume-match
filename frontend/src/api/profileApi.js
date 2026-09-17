import api from './axios';

export const uploadProfilePicture = (file) => {
  const formData = new FormData();
  formData.append('profilePicture', file);
  return api.post('/auth/profile-picture', formData, {
    headers: { 'Content-Type': undefined },
  });
};

export const getProfilePicture = () => api.get('/auth/profile-picture', { responseType: 'blob' });
