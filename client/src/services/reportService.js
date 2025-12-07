import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/reports/`;

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

// POST /api/reports/createreport
// body: { itemType, itemId, reason, details? }
const createReport = async (reportData) => {
  const response = await axios.post(
    `${API_URL}createreport`,
    reportData,
    userAuthConfig()
  );
  // returns created report
  return response.data;
};

// admin

// GET /api/reports/getreports
// query: { status, itemType, reporter, handledBy, itemId, page, limit }
const getReports = async (params = {}) => {
  const response = await axios.get(`${API_URL}getreports`, {
    ...adminAuthConfig(),
    params,
  });
  // returns { page, limit, total, reports }
  return response.data;
};

// GET /api/reports/itemreport
// query: { itemType, itemId, onlyOpen=true|false }
const getReportsForItem = async (params = {}) => {
  const response = await axios.get(`${API_URL}itemreport`, {
    ...adminAuthConfig(),
    params,
  });
  // returns array of reports
  return response.data;
};

// GET /api/reports/getreport/:id
const getReportById = async (id) => {
  const response = await axios.get(
    `${API_URL}getreport/${id}`,
    adminAuthConfig()
  );
  return response.data;
};

// PATCH /api/reports/updatereport/:id
// body: { status?, notes? }  (status only 'open' or 'reviewing')
const updateReport = async (id, data) => {
  const response = await axios.patch(
    `${API_URL}updatereport/${id}`,
    data,
    adminAuthConfig()
  );
  // returns updated report
  return response.data;
};

// POST /api/reports/:id/resolvereport
// body: { actionTaken?, notes? }
const resolveReport = async (id, data = {}) => {
  const response = await axios.post(
    `${API_URL}${id}/resolvereport`,
    data,
    adminAuthConfig()
  );
  // returns updated report
  return response.data;
};

// POST /api/reports/:id/rejectreport
// body: { notes? }
const rejectReport = async (id, data = {}) => {
  const response = await axios.post(
    `${API_URL}${id}/rejectreport`,
    data,
    adminAuthConfig()
  );
  // returns updated report
  return response.data;
};

// DELETE /api/reports/deletereport/:id
const deleteReport = async (id) => {
  const response = await axios.delete(
    `${API_URL}deletereport/${id}`,
    adminAuthConfig()
  );
  // controller: { message: 'Report soft-deleted', report }
  return { id, ...response.data };
};

const reportService = {
  createReport,
  getReports,
  getReportsForItem,
  getReportById,
  updateReport,
  resolveReport,
  rejectReport,
  deleteReport,
};

export default reportService;
