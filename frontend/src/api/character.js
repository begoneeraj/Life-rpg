import api from './axios';

export const fetchCharacter = () => api.get('/character');
