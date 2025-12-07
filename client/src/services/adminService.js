import axios from 'axios';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/admin/`;

// get admin token from localStorage
const getToken = () => {
  const stored = localStorage.getItem('admin');
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


const login = async (adminData) => {
  const response = await axios.post(`${API_URL}login`, adminData);

  if (response.data) {
    localStorage.setItem('admin', JSON.stringify(response.data));
  }

  return response.data;
};


const logout = () => {
  localStorage.removeItem('admin');
};


const register = async (adminData) => {
  const response = await axios.post(`${API_URL}register`, adminData, authConfig());

  if (response.data) {
    localStorage.setItem('admin', JSON.stringify(response.data));
  }

  return response.data;
};


const getCurrentAdmin = async () => {
  const response = await axios.get(`${API_URL}currentadmin`, authConfig());
  return response.data;
};


const updateCurrentAdmin = async (updateData) => {
  const response = await axios.put(
    `${API_URL}updatecurrentadmin`,
    updateData,
    authConfig()
  );

  // backend returns _id, name, email, token
  if (response.data) {
    localStorage.setItem('admin', JSON.stringify(response.data));
  }

  return response.data;
};


const softDeleteCurrentAdmin = async () => {
  const response = await axios.delete(`${API_URL}currentadmin`, authConfig());
  // After deactivation, clear client-side admin
  logout();
  return response.data;
};

const adminService = {
  login,
  logout,
  register,
  getCurrentAdmin,
  updateCurrentAdmin,
  softDeleteCurrentAdmin,
};

export default adminService;
