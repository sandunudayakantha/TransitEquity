import axios from 'axios';

const API_URL = 'http://localhost:5000/api/facilities'; // Adjust port if needed

// Professional way to handle Auth Headers
const getHeaders = () => ({
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}` 
  }
});

export const getAllFacilities = async () => {
  const response = await axios.get(API_URL, getHeaders());
  return response.data;
};

export const createFacility = async (data) => {
  const response = await axios.post(API_URL, data, getHeaders());
  return response.data;
};

export const updateFacility = async (id, data) => {
  const response = await axios.put(`${API_URL}/${id}`, data, getHeaders());
  return response.data;
};

export const deleteFacility = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getHeaders());
  return response.data;
};