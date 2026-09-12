import api from './axios';

export const fetchCharacter = () => api.get('/character');
export const createCharacter = (payload) => api.post('/character/create', payload);
export const updateGarmentColors = (slot, primaryColor, accentColor) =>
  api.patch('/character/colors', { slot, primaryColor, accentColor });
