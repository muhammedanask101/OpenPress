import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/comments/`;

// token helper 
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

// GET /api/comments/article/:articleId/comments
export const getCommentsForArticle = async (articleId, params = {}) => {
  const response = await axios.get(
    `${API_URL}article/${articleId}/comments`,
    { params }
  );
  // { data, pagination }
  return response.data;
};

// GET /api/comments/comment/:id/replies
export const getRepliesForComment = async (commentId, params = {}) => {
  const response = await axios.get(
    `${API_URL}comment/${commentId}/replies`,
    { params }
  );
  return response.data; // { data, pagination }
};

// GET /api/comments/comment/:id
export const getCommentById = async (id) => {
  const response = await axios.get(`${API_URL}comment/${id}`);
  return response.data;
};

// users

// POST /api/comments/createcomment
export const createComment = async (commentData) => {
  const response = await axios.post(
    `${API_URL}createcomment`,
    commentData,
    userAuthConfig()
  );
  return response.data;
};

// PUT /api/comments/updatecomment/:id
export const updateComment = async (id, body) => {
  const response = await axios.put(
    `${API_URL}updatecomment/${id}`,
    { body },
    userAuthConfig()
  );
  return response.data;
};

// DELETE /api/comments/deletecomment/:id
export const deleteComment = async (id) => {
  const response = await axios.delete(
    `${API_URL}deletecomment/${id}`,
    userAuthConfig()
  );
  // controller returns { message: 'Comment deleted successfully' }
  return { id, ...response.data };
};

// GET /api/comments/mycomments
export const getMyComments = async (params = {}) => {
  const response = await axios.get(`${API_URL}mycomments`, {
    ...userAuthConfig(),
    params,
  });
  return response.data; // { data, pagination }
};

const commentService = {
  getCommentsForArticle,
  getRepliesForComment,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  getMyComments,
};

export default commentService;
