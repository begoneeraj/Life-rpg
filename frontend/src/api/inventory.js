import api from './axios';

export const fetchInventory = () => api.get('/inventory');
export const equipItem = (itemId) => api.post(`/inventory/${itemId}/equip`);
export const unequipItem = (itemId) => api.post(`/inventory/${itemId}/unequip`);
