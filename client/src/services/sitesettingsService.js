import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/sitesettings/`;

// admin token helpers
const getAdminToken = () => {
  const stored = localStorage.getItem("admin");
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    return parsed?.token || null;
  } catch {
    return null;
  }
};

const adminAuthConfig = () => {
  const token = getAdminToken();
  return {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Content-Type": "application/json",
    },
  };
};

// public settings 
// GET /api/sitesettings/publicsettings
const getPublicSettings = async () => {
  const response = await axios.get(`${API_URL}publicsettings`);
  return response.data;
};

// admin settings 
// GET /api/sitesettings/getsettings
const getAdminSettings = async () => {
  const response = await axios.get(
    `${API_URL}getsettings`,
    adminAuthConfig()
  );
  return response.data;
};

// PATCH /api/sitesettings/updatesettings
// body = partial settings update, validated by Joi on backend
const updateSiteSettings = async (updates) => {
  const response = await axios.patch(
    `${API_URL}updatesettings`,
    updates,
    adminAuthConfig()
  );
  return response.data;
};

const sitesettingsService = {
  getPublicSettings,
  getAdminSettings,
  updateSiteSettings,
};

export default sitesettingsService;
