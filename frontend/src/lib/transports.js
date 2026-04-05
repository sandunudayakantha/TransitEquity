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

export const fetchTransports = async () => {
  const response = await axios.get(`${apiBaseUrl}/api/transports`, getRequestConfig());
  return response.data;
};

export const fetchTransportById = async (transportId) => {
  const response = await axios.get(`${apiBaseUrl}/api/transports/${transportId}`, getRequestConfig());
  return response.data;
};

export const createTransport = async (payload) => {
  const response = await axios.post(`${apiBaseUrl}/api/transports`, payload, getRequestConfig());
  return response.data;
};

export const updateTransport = async (transportId, payload) => {
  const response = await axios.put(`${apiBaseUrl}/api/transports/${transportId}`, payload, getRequestConfig());
  return response.data;
};

export const deleteTransport = async (transportId) => {
  const response = await axios.delete(`${apiBaseUrl}/api/transports/${transportId}`, getRequestConfig());
  return response.data;
};
