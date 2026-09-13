import api from './axios';

// rounds = [ [round1Tasks...], [round2Tasks...], [round3Tasks...] ] - exactly 3 rounds
export const challengeFriend = (opponentUsername, rounds, timeLimitMinutes) =>
  api.post('/battle/challenge', {
    opponent_username: opponentUsername,
    rounds,
    time_limit_minutes: timeLimitMinutes,
  });
export const respondToBattle = (battleId, action) =>
  api.post('/battle/respond', { battle_id: battleId, action });
export const completeBattleTask = (battleId, taskId) =>
  api.post('/battle/task/complete', { battle_id: battleId, task_id: taskId });
export const fetchBattleStatus = (battleId) => api.get(`/battle/${battleId}/status`);
export const endBattle = (battleId) => api.post('/battle/end', { battle_id: battleId });
export const fetchIncomingBattles = () => api.get('/battle/incoming');
export const fetchMyBattles = () => api.get('/battle/mine');
