import axios from 'axios';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/users/`;

// get token from local storage
const getToken = () => {
  const stored = localStorage.getItem('user');
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    return parsed?.token || null;
  } catch {
    return null;
  }
};

const authConfig = () => {
  const token = getToken();
  return {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    },
  };
};


const register = async (userData) => {
  const response = await axios.post(`${API_URL}registeruser`, userData);

  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }

  return response.data;
};


const login = async (userData) => {
  const response = await axios.post(`${API_URL}loginuser`, userData);

  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }

  return response.data;
};

const logout = () => {
  localStorage.removeItem('user');
};


const getCurrentUser = async () => {
  const response = await axios.get(`${API_URL}currentuser`, authConfig());
  return response.data;
};


const updateUser = async (updateData) => {
  const response = await axios.put(`${API_URL}updateuser`, updateData, authConfig());

  // response contains new token + updated user
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }

  return response.data;
};


const softDeleteSelf = async () => {
  const response = await axios.delete(`${API_URL}softdelete`, authConfig());
  logout();
  return response.data;
};

// admin operations

const getUserById = async (id) => {
  const response = await axios.get(`${API_URL}getuser/${id}`, authConfig());
  return response.data;
};


const banUser = async (id) => {
  const response = await axios.patch(`${API_URL}${id}/ban`, {}, authConfig());
  return response.data;
};


const unbanUser = async (id) => {
  const response = await axios.patch(`${API_URL}${id}/unban`, {}, authConfig());
  return response.data;
};


const resetUserSecurity = async (id) => {
  const response = await axios.patch(`${API_URL}${id}/resetsecurity`, {}, authConfig());
  return response.data;
};

const userService = {
  register,
  login,
  logout,
  getCurrentUser,
  updateUser,
  softDeleteSelf,
  getUserById,
  banUser,
  unbanUser,
  resetUserSecurity,
};

export default userService;
