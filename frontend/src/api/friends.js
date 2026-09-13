import api from './axios';

export const sendFriendRequest = (username) => api.post('/friends/request', { username });
export const respondToFriendRequest = (requestId, action) =>
  api.post('/friends/respond', { request_id: requestId, action });
export const fetchFriends = () => api.get('/friends/list');
export const fetchIncomingFriendRequests = () => api.get('/friends/requests/incoming');
export const fetchFriendLeaderboard = () => api.get('/friends/leaderboard');
