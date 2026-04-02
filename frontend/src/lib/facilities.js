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

export const fetchFacilities = async () => {
  const response = await axios.get(`${apiBaseUrl}/api/facilities`, getRequestConfig());
  return response.data;
};

export const fetchFacilityById = async (facilityId) => {
  const response = await axios.get(`${apiBaseUrl}/api/facilities/${facilityId}`, getRequestConfig());
  return response.data;
};

export const createFacility = async (payload) => {
  const response = await axios.post(`${apiBaseUrl}/api/facilities`, payload, getRequestConfig());
  return response.data;
};

export const updateFacility = async (facilityId, payload) => {
  const response = await axios.put(`${apiBaseUrl}/api/facilities/${facilityId}`, payload, getRequestConfig());
  return response.data;
};

export const deleteFacility = async (facilityId) => {
  const response = await axios.delete(`${apiBaseUrl}/api/facilities/${facilityId}`, getRequestConfig());
  return response.data;
};
