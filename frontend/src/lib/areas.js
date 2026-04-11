import api from '../services/api';

export const fetchAreas = async (page = 1, limit = 10) => {
  const response = await api.get(`/api/areas?page=${page}&limit=${limit}`);
  return response.data;
};

export const fetchAreaById = async (areaId) => {
  const response = await api.get(`/api/areas/${areaId}`);
  return response.data.data || response.data;
};

export const createArea = async (payload) => {
  const response = await api.post(`/api/areas`, payload);
  return response.data.data || response.data;
};

export const updateArea = async (areaId, payload) => {
  const response = await api.put(`/api/areas/${areaId}`, payload);
  return response.data.data || response.data;
};

export const deleteArea = async (areaId) => {
  const response = await api.delete(`/api/areas/${areaId}`);
  return response.data;
};
