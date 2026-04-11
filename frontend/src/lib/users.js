import api from '../services/api';

export const fetchUsers = async (page = 1, limit = 10) => {
  const response = await api.get(`/api/users?page=${page}&limit=${limit}`);
  return response.data;
};

export const fetchPendingUsers = async () => {
  const response = await api.get(`/api/users/pending`);
  return response.data;
};

export const toggleUserApproval = async (userId) => {
  const response = await api.put(`/api/users/${userId}/approve`);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/api/users/${userId}`);
  return response.data;
};
