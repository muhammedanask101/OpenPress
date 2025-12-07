import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/media/`;

// token helpers
const getUserToken = () => {
  const stored = localStorage.getItem("user");
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    return parsed?.token || null;
  } catch {
    return null;
  }
};

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

const userAuthConfig = () => {
  const token = getUserToken();
  return {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Content-Type": "application/json",
    },
  };
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

// user

// POST /api/media/createmedia
// body: { key, url, mimeType?, size?, storageProvider?, storageRegion? }
const createMedia = async (mediaData) => {
  const response = await axios.post(
    `${API_URL}createmedia`,
    mediaData,
    userAuthConfig()
  );
  // returns created media doc
  return response.data;
};

// GET /api/media/me
// query: { page?, limit? }
const getMyMedia = async (params = {}) => {
  const response = await axios.get(`${API_URL}me`, {
    ...userAuthConfig(),
    params,
  });
  // { page, limit, total, items }
  return response.data;
};

// public

// GET /api/media/item
// query: { kind, itemId }
const getMediaForItem = async ({ kind, itemId }) => {
  const response = await axios.get(`${API_URL}item`, {
    params: { kind, itemId },
  });
  // returns array of media docs
  return response.data;
};

// GET /api/media/:id
const getMediaById = async (id) => {
  const response = await axios.get(`${API_URL}${id}`);
  return response.data;
};

// admin

// GET /api/media/
// query: { uploadedBy?, storageProvider?, storageRegion?, deleted?, kind?, itemId?, page?, limit? }
const adminListMedia = async (params = {}) => {
  const response = await axios.get(API_URL, {
    ...adminAuthConfig(),
    params,
  });
  // { page, limit, total, items }
  return response.data;
};

// GET /api/media/by-key/search
// query: { key, provider? }
const getMediaByKey = async ({ key, provider = "s3" }) => {
  const response = await axios.get(`${API_URL}by-key/search`, {
    ...adminAuthConfig(),
    params: { key, provider },
  });
  return response.data;
};

// DELETE /api/media/:id
const softDeleteMedia = async (id) => {
  const response = await axios.delete(`${API_URL}${id}`, adminAuthConfig());
  // { message, media }
  return { id, ...response.data };
};

// POST /api/media/:id/attach
// body: { kind, itemId }
const attachMediaUsage = async (id, { kind, itemId }) => {
  const response = await axios.post(
    `${API_URL}${id}/attach`,
    { kind, itemId },
    adminAuthConfig()
  );
  // { message, media }
  return { id, ...response.data };
};

// POST /api/media/:id/clear-usage
const clearMediaUsage = async (id) => {
  const response = await axios.post(
    `${API_URL}${id}/clear-usage`,
    {},
    adminAuthConfig()
  );
  // { message, media }
  return { id, ...response.data };
};

const mediaService = {
  createMedia,
  getMyMedia,
  getMediaForItem,
  getMediaById,
  adminListMedia,
  getMediaByKey,
  softDeleteMedia,
  attachMediaUsage,
  clearMediaUsage,
};

export default mediaService;
