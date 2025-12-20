import axios from 'axios';
import store from '../app/store';
import { logoutUser } from '../slices/userSlice';
import { logoutAdmin } from '../slices/adminSlice';

const BACKEND = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:3000';
const API_PATH = '/api/articles';
const API_URL = `${BACKEND}${API_PATH}`;

// central axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // optional
});

// helper to read tokens from localStorage
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

// request interceptor: attach correct token (admin vs user)
api.interceptors.request.use(
  (config) => {
    const adminRaw = localStorage.getItem('admin');
    const userRaw = localStorage.getItem('user');

    let adminToken = null;
    let userToken = null;

    try {
      adminToken = adminRaw ? JSON.parse(adminRaw)?.token : null;
    } catch {}

    try {
      userToken = userRaw ? JSON.parse(userRaw)?.token : null;
    } catch {}

    // Admin routes ONLY
    if (config.url?.includes('/admin') && adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    // User routes (default)
    else if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }

    return config;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || '';

    // Token expired / invalid
    if (
      status === 401 &&
      (message.toLowerCase().includes('expired') ||
       message.toLowerCase().includes('not authorized'))
    ) {
      // Clear storage
      localStorage.removeItem('user');
      localStorage.removeItem('admin');

      // Clear redux
      store.dispatch(logoutUser());
      store.dispatch(logoutAdmin());

      // Optional: toast
      // toast.info('Session expired. Please login again.');

      // Redirect safely
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);


// helper to normalize axios error message
function extractErrorMessage(error) {
  return error?.response?.data?.message || error?.message || error?.toString();
}

// provide optional `opts = { signal }` for abort support (pass AbortController.signal)
const getArticles = async (params = {}, opts = {}) => {
  const config = { params };
  if (opts.signal) config.signal = opts.signal;
  const res = await api.get('/getarticles', config);
  // server returns { data: [...], pagination } — we return the full response here
  return res.data;
};

const getArticleById = async (id, opts = {}) => {
  const safeId = encodeURIComponent(String(id));
  const config = {};
  if (opts.signal) config.signal = opts.signal;
  const res = await api.get(`/getarticles/${safeId}`, config);
  return res.data;
};

const getArticleBySlug = async (slug, opts = {}) => {
  const safe = encodeURIComponent(String(slug));
  const config = {};
  if (opts.signal) config.signal = opts.signal;
  // NOTE: this route should return a single article object (res.json(article))
  const res = await api.get(`/slug/${safe}`, config);
  // If your server returns wrapper `{ data: [...] }` here, you may return res.data.data[0]
  return res.data;
};

// user-only endpoints (create uses the token attached by interceptor)
const createArticle = async (articleData, opts = {}) => {
  const config = {};
  if (opts.signal) config.signal = opts.signal;
  const res = await api.post('/postarticle', articleData, config);
  return res.data;
};

const updateArticle = async (id, articleData, opts = {}) => {
  const safeId = encodeURIComponent(String(id));
  const config = {};
  if (opts.signal) config.signal = opts.signal;
  const res = await api.put(`/updatearticle/${safeId}`, articleData, config);
  return res.data;
};

const deleteArticle = async (id, opts = {}) => {
  const safeId = encodeURIComponent(String(id));
  const config = {};
  if (opts.signal) config.signal = opts.signal;
  const res = await api.delete(`/deletearticles/${safeId}`, config);
  // controller returns { message }, we attach id for reducer convenience
  return { id: safeId, ...(res.data || {}) };
};

const getMyArticles = async (params = {}, opts = {}) => {
  const config = { params };
  if (opts.signal) config.signal = opts.signal;
  const res = await api.get('/getmyarticles', config);
  return res.data;
};

export default {
  getArticles,
  getArticleById,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  getMyArticles,
  _apiInstance: api,
  extractErrorMessage,
};
