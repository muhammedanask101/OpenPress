import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/badges/`;

// token helper 
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

// public

// GET /api/badges/getbadges?includeDeleted=true|false
const getBadges = async (params = {}) => {
  const response = await axios.get(`${API_URL}getbadges`, { params });
  // returns array of Badge docs
  return response.data;
};

// GET /api/badges/badge/:id?includeDeleted=true|false
const getBadgeById = async (id, params = {}) => {
  const response = await axios.get(`${API_URL}badge/${id}`, { params });
  return response.data;
};

// GET /api/badges/userbadges/:userId
const getUserBadges = async (userId) => {
  const response = await axios.get(`${API_URL}userbadges/${userId}`);
  // returns array of BadgeOf docs (usually populated with badge)
  return response.data;
};

// admins

// POST /api/badges/createbadge
const createBadge = async (badgeData) => {
  const response = await axios.post(
    `${API_URL}createbadge`,
    badgeData,
    adminAuthConfig()
  );
  return response.data;
};

// PATCH /api/badges/updatebadge/:id
const updateBadge = async (id, badgeData) => {
  const response = await axios.patch(
    `${API_URL}updatebadge/${id}`,
    badgeData,
    adminAuthConfig()
  );
  return response.data;
};

// DELETE /api/badges/deletebadge/:id
const deleteBadge = async (id) => {
  const response = await axios.delete(
    `${API_URL}deletebadge/${id}`,
    adminAuthConfig()
  );
  // controller returns { message, badge }
  return { id, ...response.data };
};

// POST /api/badges/:id/restorebadge
const restoreBadge = async (id) => {
  const response = await axios.post(
    `${API_URL}${id}/restorebadge`,
    {},
    adminAuthConfig()
  );
  // { message, badge }
  return { id, ...response.data };
};

// POST /api/badges/:id/autoaward
const setAutoAward = async (id, autoAwardData) => {
  // autoAwardData: { enabled, rule }
  const response = await axios.post(
    `${API_URL}${id}/autoaward`,
    autoAwardData,
    adminAuthConfig()
  );
  // { message, badge }
  return { id, ...response.data };
};

// POST /api/badges/awardbadge
// body: { user: userId, badge: badgeId, reason? }
const awardBadgeToUser = async (awardData) => {
  const response = await axios.post(
    `${API_URL}awardbadge`,
    awardData,
    adminAuthConfig()
  );
  // returns BadgeOf doc
  return response.data;
};

// DELETE /api/badges/revokebadge/:id
// id is BadgeOf document id
const revokeBadgeAward = async (id) => {
  const response = await axios.delete(
    `${API_URL}revokebadge/${id}`,
    adminAuthConfig()
  );
  // { message: 'Badge revoked' }
  return { id, ...response.data };
};

const badgeService = {
  getBadges,
  getBadgeById,
  getUserBadges,
  createBadge,
  updateBadge,
  deleteBadge,
  restoreBadge,
  setAutoAward,
  awardBadgeToUser,
  revokeBadgeAward,
};

export default badgeService;
