import api from './axios';

export const fetchWeeklyTasks = () => api.get('/weekly-tasks');
export const createWeeklyTask = (title, dayOfWeek) => api.post('/weekly-tasks', { title, dayOfWeek });
export const updateWeeklyTask = (id, updates) => api.patch(`/weekly-tasks/${id}`, updates);
export const deleteWeeklyTask = (id) => api.delete(`/weekly-tasks/${id}`);
export const toggleWeeklyTaskToday = (id) => api.post(`/weekly-tasks/${id}/toggle`);
