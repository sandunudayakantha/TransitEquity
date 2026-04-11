import api from '../services/api';

/**
 * Handle all Feedback API interactions
 */

export const getFeedbacks = async (filters = {}) => {
  try {
    const response = await api.get('/api/feedback', { params: filters });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch feedbacks');
  }
};

export const getFeedbackById = async (id) => {
  try {
    const response = await api.get(`/api/feedback/${id}`);
    return response.data?.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch feedback details');
  }
};

export const createFeedback = async (feedbackData) => {
  try {
    const response = await api.post('/api/feedback', feedbackData);
    return response.data?.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to submit feedback');
  }
};

export const voteFeedback = async (id) => {
  try {
    const response = await api.put(`/api/feedback/${id}/vote`);
    return response.data?.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to record vote');
  }
};

export const updateFeedbackStatus = async (id, statusData) => {
  try {
    const response = await api.put(`/api/feedback/${id}`, statusData);
    return response.data?.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update feedback status');
  }
};

export const deleteFeedback = async (id) => {
  try {
    const response = await api.delete(`/api/feedback/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete feedback');
  }
};
