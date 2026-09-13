import api from './axios';

export const setUsername = (username) => api.patch('/users/username', { username });
export const fetchUserProfile = (username) => api.get(`/users/${username}/profile`);
