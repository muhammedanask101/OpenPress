import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/engagement/`;

// --------- token helper (userprotect) ---------
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

const userAuthConfig = () => {
  const token = getUserToken();
  return {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Content-Type": "application/json",
    },
  };
};

// bookmarks

// POST /api/engagement/bookmarks/toggle
// body: { itemType, itemId }
const toggleBookmark = async ({ itemType, itemId }) => {
  const response = await axios.post(
    `${API_URL}bookmarks/toggle`,
    { itemType, itemId },
    userAuthConfig()
  );
  // { bookmarked, bookmark }
  return response.data;
};

// GET /api/engagement/getbookmarks
// query: { itemType?, page?, limit? }
const getUserBookmarks = async (params = {}) => {
  const response = await axios.get(`${API_URL}getbookmarks`, {
    ...userAuthConfig(),
    params,
  });
  // { page, limit, count, bookmarks }
  return response.data;
};

// GET /api/engagement/bookmarks/status
// query: { itemType, itemId }
const getBookmarkStatus = async ({ itemType, itemId }) => {
  const response = await axios.get(`${API_URL}bookmarks/status`, {
    ...userAuthConfig(),
    params: { itemType, itemId },
  });
  // { bookmarked: boolean }
  return response.data;
};

// stars

// POST /api/engagement/stars/toggle
// body: { itemType, itemId }
const toggleStar = async ({ itemType, itemId }) => {
  const response = await axios.post(
    `${API_URL}stars/toggle`,
    { itemType, itemId },
    userAuthConfig()
  );
  // { starred, star }
  return response.data;
};

// GET /api/engagement/stars/status
// query: { itemType, itemId }
const getStarStatus = async ({ itemType, itemId }) => {
  const response = await axios.get(`${API_URL}stars/status`, {
    ...userAuthConfig(),
    params: { itemType, itemId },
  });
  // { starred: boolean }
  return response.data;
};

// GET /api/engagement/stars/count
// PUBLIC – query: { itemType, itemId }
const getStarCount = async ({ itemType, itemId }) => {
  const response = await axios.get(`${API_URL}stars/count`, {
    params: { itemType, itemId },
  });
  // { itemType, itemId, count }
  return response.data;
};

const engagementService = {
  toggleBookmark,
  getUserBookmarks,
  getBookmarkStatus,
  toggleStar,
  getStarStatus,
  getStarCount,
};

export default engagementService;
