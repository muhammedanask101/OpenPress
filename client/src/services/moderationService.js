import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/modlogs/`;

// admin token helper
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

// list or filter logs
// GET /api/modlogs/getmodlogs
// query: { itemType?, itemId?, actor?, action?, from?, to?, page?, limit? }
const getModLogs = async (params = {}) => {
  const response = await axios.get(`${API_URL}getmodlogs`, {
    ...adminAuthConfig(),
    params,
  });
  // { page, limit, total, logs }
  return response.data;
};

// item log
// GET /api/modlogs/itemlog
// query: { itemType, itemId, limit? }
const getLogsForItem = async ({ itemType, itemId, limit }) => {
  const response = await axios.get(`${API_URL}itemlog`, {
    ...adminAuthConfig(),
    params: { itemType, itemId, limit },
  });
  // { itemType, itemId, count, logs }
  return response.data;
};

// actor log
// GET /api/modlogs/actorlog/:actorId
// query: { itemType?, limit? }
const getLogsForActor = async ({ actorId, itemType, limit }) => {
  const response = await axios.get(`${API_URL}actorlog/${actorId}`, {
    ...adminAuthConfig(),
    params: { itemType, limit },
  });
  // { actor, count, logs }
  return response.data;
};

// single log
// GET /api/modlogs/modlog/:id
const getModLogById = async (id) => {
  const response = await axios.get(`${API_URL}modlog/${id}`, adminAuthConfig());
  return response.data;
};

const moderationService = {
  getModLogs,
  getLogsForItem,
  getLogsForActor,
  getModLogById,
};

export default moderationService;
