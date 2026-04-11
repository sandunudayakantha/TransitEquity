import api from '../services/api';

export const fetchTransports = async (page = 1, limit = 10) => {
  const response = await api.get(`/api/transports?page=${page}&limit=${limit}`);
  return response.data;
};

export const fetchTransportById = async (transportId) => {
  const response = await api.get(`/api/transports/${transportId}`);
  return response.data;
};

export const createTransport = async (payload) => {
  const response = await api.post(`/api/transports`, payload);
  return response.data;
};

export const updateTransport = async (transportId, payload) => {
  const response = await api.put(`/api/transports/${transportId}`, payload);
  return response.data;
};

export const deleteTransport = async (transportId) => {
  const response = await api.delete(`/api/transports/${transportId}`);
  return response.data;
};
