import api from '../services/api';

/**
 * Service Status Management (Vehicles/Live Status)
 */

export const fetchServices = async () => {
  const response = await api.get(`/api/services`);
  return response.data;
};

export const fetchServicesByRoute = async (routeId) => {
  const response = await api.get(`/api/services?routeId=${routeId}`);
  return response.data;
};

export const fetchServiceById = async (serviceId) => {
  const response = await api.get(`/api/services/${serviceId}`);
  return response.data;
};

export const createServiceStatus = async (payload) => {
  const response = await api.post(`/api/services`, payload);
  return response.data;
};

export const updateServiceStatus = async (serviceId, payload) => {
  const response = await api.put(`/api/services/${serviceId}`, payload);
  return response.data;
};

export const deleteServiceStatus = async (serviceId) => {
  const response = await api.delete(`/api/services/${serviceId}`);
  return response.data;
};

// Aliases for compatibility
export const createService = createServiceStatus;
export const updateService = updateServiceStatus;
export const deleteService = deleteServiceStatus;
