import api from './axios';

export const fetchQuests = () => api.get('/quests');
export const createQuest = (title, category, difficulty, estimatedMinutes) =>
  api.post('/quests', { title, category, difficulty, estimatedMinutes });
export const completeQuest = (id) => api.patch(`/quests/${id}/complete`);
export const deleteQuest = (id) => api.delete(`/quests/${id}`);
