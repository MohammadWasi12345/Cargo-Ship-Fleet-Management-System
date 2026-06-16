import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5188/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('shipfleet_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('shipfleet_token');
      localStorage.removeItem('shipfleet_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;