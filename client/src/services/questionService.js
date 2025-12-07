import axios from 'axios';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/questions/`;

// token helpers 
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

const userAuthConfig = () => {
  const token = getUserToken();
  return {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    },
  };
};

// for routes protected by `protect` (can be admin or user)
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

// public

// GET /api/questions/getquestions
// query params: { page, limit, q, tag, author }
const getQuestions = async (params = {}) => {
  const response = await axios.get(`${API_URL}getquestions`, {
    params,
  });
  // { data, pagination }
  return response.data;
};

// GET /api/questions/getquestions/:id
const getQuestionById = async (id) => {
  const response = await axios.get(`${API_URL}getquestions/${id}`);
  return response.data;
};

// user or admin

// POST /api/questions/postquestions  (userprotect)
const createQuestion = async (questionData) => {
  const response = await axios.post(
    `${API_URL}postquestions`,
    questionData,
    userAuthConfig()
  );
  return response.data;
};

// PUT /api/questions/updatequestion/:id  (protect)
const updateQuestion = async (id, questionData) => {
  const response = await axios.put(
    `${API_URL}updatequestion/${id}`,
    questionData,
    authConfig()
  );
  return response.data;
};

// DELETE /api/questions/updatequestion/:id  (protect)
// NOTE: your route uses '/updatequestion/:id' for delete as well.
const deleteQuestion = async (id) => {
  const response = await axios.delete(
    `${API_URL}updatequestion/${id}`,
    authConfig()
  );
  // controller returns { message: 'Question deleted successfully' }
  // we add id for easier reducer updates
  return { id, ...response.data };
};

// GET /api/questions/getmyquestions  (userprotect)
const getMyQuestions = async (params = {}) => {
  const response = await axios.get(`${API_URL}getmyquestions`, {
    ...userAuthConfig(),
    params,
  });
  // { data, pagination }
  return response.data;
};

const questionService = {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getMyQuestions,
};

export default questionService;
