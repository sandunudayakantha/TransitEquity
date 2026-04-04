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

export const fetchAreas = async () => {
  const response = await axios.get(`${apiBaseUrl}/api/areas`, getRequestConfig());
  return response.data;
};

export const fetchAreaById = async (areaId) => {
  const response = await axios.get(`${apiBaseUrl}/api/areas/${areaId}`, getRequestConfig());
  return response.data;
};

export const createArea = async (payload) => {
  const response = await axios.post(`${apiBaseUrl}/api/areas`, payload, getRequestConfig());
  return response.data;
};

export const updateArea = async (areaId, payload) => {
  const response = await axios.put(`${apiBaseUrl}/api/areas/${areaId}`, payload, getRequestConfig());
  return response.data;
};

export const deleteArea = async (areaId) => {
  const response = await axios.delete(`${apiBaseUrl}/api/areas/${areaId}`, getRequestConfig());
  return response.data;
};
