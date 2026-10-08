import axios from 'axios';

// Resolve base API URL from environment variable or default to relative '/api'
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return '/api';
  return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Intercept 401 Unauthorized errors if needed
    if (error.response?.status === 401 && window.location.pathname !== '/login' && window.location.pathname !== '/' && window.location.pathname !== '/register') {
      // User session might have expired
    }
    return Promise.reject(error);
  }
);

export default api;
