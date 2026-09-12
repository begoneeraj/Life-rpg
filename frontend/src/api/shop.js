import api from './axios';

export const fetchShopItems = () => api.get('/shop');
export const buyShopItem = (itemId) => api.post(`/shop/${itemId}/buy`);
