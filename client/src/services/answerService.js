import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/answers/`;

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

const userAuthConfig = () => {
  const token = getUserToken();
  return {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Content-Type": "application/json",
    },
  };
};

// public
// GET /api/answers/question/:questionId/answers
export const getAnswersByQuestion = async (questionId, params = {}) => {
  const response = await axios.get(
    `${API_URL}question/${questionId}/answers`,
    { params }
  );
  return response.data; // { data, pagination }
};

// GET /api/answers/question/:questionId/answers/top
export const getTopAnswersByQuestion = async (questionId, params = {}) => {
  const response = await axios.get(
    `${API_URL}question/${questionId}/answers/top`,
    { params }
  );
  return response.data;
};

// GET /api/answers/answer/:id
export const getAnswerById = async (id) => {
  const response = await axios.get(`${API_URL}answer/${id}`);
  return response.data;
};

// users

// POST /api/answers/postanswer
export const postAnswer = async (answerData) => {
  const response = await axios.post(
    `${API_URL}postanswer`,
    answerData,
    userAuthConfig()
  );
  return response.data;
};

// PUT /api/answers/updateanswer/:id
export const updateAnswer = async (id, body) => {
  const response = await axios.put(
    `${API_URL}updateanswer/${id}`,
    { body },
    userAuthConfig()
  );
  return response.data;
};

// DELETE /api/answers/answers/:id
export const deleteAnswer = async (id) => {
  const response = await axios.delete(`${API_URL}answers/${id}`, userAuthConfig());
  return { id, ...response.data };
};

// GET /api/answers/myanswers
export const getMyAnswers = async (params = {}) => {
  const response = await axios.get(`${API_URL}myanswers`, {
    ...userAuthConfig(),
    params,
  });
  return response.data; // { data, pagination }
};

const answerService = {
  getAnswersByQuestion,
  getTopAnswersByQuestion,
  getAnswerById,
  postAnswer,
  updateAnswer,
  deleteAnswer,
  getMyAnswers,
};

export default answerService;
