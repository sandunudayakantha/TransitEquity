import axios from 'axios';
import { loadAuthSession } from './auth';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const getRequestConfig = () => {
  const session = loadAuthSession();

  return {
    headers: session?.token
      ? {
          Authorization: `Bearer ${session.token}`,
        }
      : {},
    withCredentials: true,
  };
};

export const fetchUsers = async () => {
  const response = await axios.get(`${apiBaseUrl}/api/users`, getRequestConfig());
  return response.data;
};

export const fetchPendingUsers = async () => {
  const response = await axios.get(`${apiBaseUrl}/api/users/pending`, getRequestConfig());
  return response.data;
};

export const toggleUserApproval = async (userId) => {
  const response = await axios.put(`${apiBaseUrl}/api/users/${userId}/approve`, {}, getRequestConfig());
  return response.data;
};
