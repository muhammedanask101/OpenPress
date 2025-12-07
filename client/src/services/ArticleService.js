import axios from 'axios';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/articles/`;

// token helpers (from localStorage, same pattern as other services)
const getUserToken = () => {
  const stored = localStorage.getItem('user');
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    return parsed?.token || null;
  } catch {
    return null;
  }
};

const getAdminToken = () => {
  const stored = localStorage.getItem('admin');
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    return parsed?.token || null;
  } catch {
    return null;
  }
};

// For endpoints that accept both user or admin
const authConfig = () => {
  const adminToken = getAdminToken();
  const userToken = getUserToken();
  const token = adminToken || userToken;

  return {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    },
  };
};

// User-only endpoints
const userAuthConfig = () => {
  const token = getUserToken();
  return {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    },
  };
};

// public

// /api/articles/getarticles
// query: { page, limit, q, tag, author, status? (will be ignored unless protect is added) }
const getArticles = async (params = {}) => {
  const response = await axios.get(`${API_URL}getarticles`, {
    params,
  });
  // { data, pagination }
  return response.data;
};

// /api/articles/getarticles/:id
const getArticleById = async (id) => {
  const response = await axios.get(`${API_URL}getarticles/${id}`);
  return response.data;
};

// /api/articles/getarticles/slug/:slug
const getArticleBySlug = async (slug) => {
  const response = await axios.get(`${API_URL}getarticles/slug/${slug}`);
  return response.data;
};

// user / admin

// POST /api/articles/postarticle  (userprotect)
const createArticle = async (articleData) => {
  const response = await axios.post(
    `${API_URL}postarticle`,
    articleData,
    userAuthConfig()
  );
  // returns created article
  return response.data;
};

// PUT /api/articles/updatearticle/:id  (protect: user owner or admin)
const updateArticle = async (id, articleData) => {
  const response = await axios.put(
    `${API_URL}updatearticle/${id}`,
    articleData,
    authConfig()
  );
  // returns updated article
  return response.data;
};

// DELETE /api/articles/deletearticles/:id  (protect: user owner or admin)
const deleteArticle = async (id) => {
  const response = await axios.delete(
    `${API_URL}deletearticles/${id}`,
    authConfig()
  );
  // controller returns { message: 'Article deleted successfully' }
  // we add id to make reducer updates easier
  return { id, ...response.data };
};

// GET /api/articles/getmyarticles  (userprotect)
const getMyArticles = async (params = {}) => {
  const response = await axios.get(`${API_URL}getmyarticles`, {
    ...userAuthConfig(),
    params,
  });
  // { data, pagination }
  return response.data;
};

const articleService = {
  getArticles,
  getArticleById,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  getMyArticles,
};

export default articleService;
