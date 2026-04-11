import api from '../services/api';

export const fetchFacilities = async (page = 1, limit = 10) => {
  const response = await api.get(`/api/facilities?page=${page}&limit=${limit}`);
  return response.data;
};

export const fetchFacilityById = async (facilityId) => {
  const response = await api.get(`/api/facilities/${facilityId}`);
  return response.data.data || response.data;
};

export const createFacility = async (payload) => {
  const response = await api.post(`/api/facilities`, payload);
  return response.data.data || response.data;
};

export const updateFacility = async (facilityId, payload) => {
  const response = await api.put(`/api/facilities/${facilityId}`, payload);
  return response.data.data || response.data;
};

export const deleteFacility = async (facilityId) => {
  const response = await api.delete(`/api/facilities/${facilityId}`);
  return response.data;
};
