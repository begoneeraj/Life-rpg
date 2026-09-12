import api from './axios';

export const adminLogin = (username, password) => api.post('/admin/login', { username, password });
export const adminLogout = () => api.post('/admin/logout');
export const fetchAdminMe = () => api.get('/admin/me');
