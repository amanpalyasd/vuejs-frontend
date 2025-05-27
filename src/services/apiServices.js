// src/services/apiService.js
import axios from 'axios';

const API_BASE = 'http://localhost:9091/api';

const api = axios.create({
  baseURL: API_BASE
});

api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export const register = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE}/auth/register`, {
      username,
      password
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Registration failed!';
  }
};

export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      username,
      password
    });
    return response.data; // Expected to return { token, role }
  } catch (error) {
    throw error.response?.data?.message || 'Login failed!';
  }
};

export async function deleteFoodById(id) {
  return await api.delete(`/foods/delete/${id}`);
}

export async function addFood(foodData) {
  return await api.post(`/foods/create`, foodData);
}

export async function updateFoodById(id, foodData) {
  return await api.put(`/foods/update/${id}`, foodData);
}

export default api;