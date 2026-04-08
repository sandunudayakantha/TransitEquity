import api from './api';

export const getReports = async (filters = {}) => {
  try {
    const response = await api.get('/api/gap/reports', { params: filters });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch gap analysis reports. Please try again.');
  }
};

export const getReportById = async (id) => {
  try {
    const response = await api.get(`/api/gap/reports/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch the gap analysis report. Please try again.');
  }
};

export const analyzeGap = async (areaId) => {
  try {
    const response = await api.post('/api/gap/analyze', { areaId });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to perform gap analysis for the given area. Please try again.');
  }
};

export const deleteReport = async (id) => {
  try {
    const response = await api.delete(`/api/gap/reports/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete the gap analysis report. Please try again.');
  }
};
