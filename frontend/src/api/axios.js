import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true, // send/receive httpOnly auth cookies
});

// --- Silent refresh -------------------------------------------------------
// If a request 401s because the short-lived access token expired, try one
// silent POST /auth/refresh (which rotates the refresh cookie too) and
// replay the original request. Only one refresh call runs at a time; any
// requests that fail while a refresh is in flight queue behind it.
let isRefreshing = false;
let pendingQueue = [];

function flushQueue(error) {
  pendingQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()));
  pendingQueue = [];
}

// Callback the app can register to be notified when a silent refresh fails,
// so it can redirect to login without losing whatever the user was typing.
let onAuthExpired = () => {};
export function setOnAuthExpired(cb) {
  onAuthExpired = cb;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const isAuthRoute =
      config?.url?.includes('/auth/login') ||
      config?.url?.includes('/auth/signup') ||
      config?.url?.includes('/auth/refresh') ||
      config?.url?.includes('/admin/'); // separate admin session - never triggers the user-session silent refresh

    if (response?.status !== 401 || isAuthRoute || config._retried) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then(() => {
        config._retried = true;
        return api(config);
      });
    }

    isRefreshing = true;
    try {
      await api.post('/auth/refresh');
      isRefreshing = false;
      flushQueue(null);
      config._retried = true;
      return api(config);
    } catch (refreshError) {
      isRefreshing = false;
      flushQueue(refreshError);
      onAuthExpired();
      return Promise.reject(error);
    }
  }
);

export default api;
