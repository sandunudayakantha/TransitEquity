import axios from 'axios';
import { loadAuthSession } from '../lib/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'
});

api.interceptors.request.use((config) => {
  const session = loadAuthSession();
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export default api;
