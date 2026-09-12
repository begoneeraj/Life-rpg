import api from './axios';

export const fetchShopItems = (category) => api.get('/shop', { params: category ? { category } : {} });
export const buyShopItem = (itemId) => api.post(`/shop/${itemId}/buy`);
