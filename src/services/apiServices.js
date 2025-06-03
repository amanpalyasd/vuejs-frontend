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

export async function fetchUsersWithRoles() {
   const token = sessionStorage.getItem("token");
  try {
    const response = await axios.get(`${API_BASE}/admin/getAllUsers`,{
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("API error in fetchUsersWithRoles:", error);
    throw new Error("Failed to fetch users");
  }
}

export async function fetchAllRoles() {
  const token = sessionStorage.getItem("token");
  try {
    const response = await axios.get(`${API_BASE}/admin/all-roles`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching roles:", error);
    throw error;
  }
}

export async function fetchAllPermissions() {
  const token = sessionStorage.getItem('token');
  try {
    const response = await axios.get(`${API_BASE}/admin/permissions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // assuming your backend returns an array of permissions
  } catch (error) {
    console.error('Error fetching permissions:', error);
    throw error;
  }
}

export async function createRoleAPI(payload, token) {
  try {
    const response = await axios.post(`${API_BASE}/admin/createRole`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // assuming your backend returns an array of permissions
  } catch (error) {
    console.error('Error fetching permissions:', error);
    throw error;
  }
}

export async function updateUserRole(userId, roleName) {
  const token = sessionStorage.getItem('token');
  try {
    const response = await axios.put(`${API_BASE}/admin/assign-role/${userId}`,
      { roleName: roleName },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data; // return whatever backend sends back (optional)
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error; // rethrow to be handled by caller
  }
}

export async function deleteUser(userId) {
  const token = sessionStorage.getItem('token');
  try {
    const response = await axios.delete(`${API_BASE}/admin/deleteUser/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data; // return whatever backend sends back (optional)
  } catch (error) {
    console.error('Error Deleting:', error);
    throw error; // rethrow to be handled by caller
  }
}


export default api;