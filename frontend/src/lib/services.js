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

export const fetchServices = async () => {
    const response = await axios.get(`${apiBaseUrl}/api/services`, getRequestConfig());
    return response.data;
};

export const fetchServicesByRoute = async (routeId) => {
    const response = await axios.get(`${apiBaseUrl}/api/services`, getRequestConfig());
    // Filter locally if there's no specific routeId endpoint
    return response.data.filter(s => s.routeId?._id === routeId || s.routeId === routeId);
};

export const createServiceStatus = async (payload) => {
    const response = await axios.post(`${apiBaseUrl}/api/services`, payload, getRequestConfig());
    return response.data;
};

export const updateServiceStatus = async (serviceId, payload) => {
    const response = await axios.put(`${apiBaseUrl}/api/services/${serviceId}`, payload, getRequestConfig());
    return response.data;
};

export const deleteServiceStatus = async (serviceId) => {
    const response = await axios.delete(`${apiBaseUrl}/api/services/${serviceId}`, getRequestConfig());
    return response.data;
};
