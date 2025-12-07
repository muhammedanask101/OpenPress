import axios from 'axios';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/contact/`;

// Helpers to get tokens from localStorage
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

const adminAuthConfig = () => {
  const token = getAdminToken();
  return {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    },
  };
};

// user


const createContact = async (contactData) => {
  const response = await axios.post(
    `${API_URL}contact`,
    contactData,
    userAuthConfig()
  );
  // response: { contact, metadata }
  return response.data;
};

//  Public contact if ever reenabling this route:
// const createPublicContact = async (contactData) => {
//   const response = await axios.post(
//     `${API_URL}public`,
//     contactData
//   );
//   return response.data;
// };

// admin

// /api/contact/getcontacts?handled=true/false&page=&limit=
const getContacts = async (params = {}) => {
  const response = await axios.get(`${API_URL}getcontacts`, {
    ...adminAuthConfig(),
    params, // { page, limit, handled }
  });
  // response: { items, pagination, metadata }
  return response.data;
};

// /api/contact/unhandledcontacts?page=&limit=
const getUnhandledContacts = async (params = {}) => {
  const response = await axios.get(`${API_URL}unhandledcontacts`, {
    ...adminAuthConfig(),
    params, // { page, limit }
  });
  return response.data;
};

///api/contact/:id/getcontact
const getContactById = async (id) => {
  const response = await axios.get(`${API_URL}${id}/getcontact`, adminAuthConfig());
  // response: { contact, metadata }
  return response.data;
};

// /api/contact/:id/contacthandled
const markContactHandled = async (id) => {
  const response = await axios.patch(
    `${API_URL}${id}/contacthandled`,
    {},
    adminAuthConfig()
  );
  // response: { contact: updated, metadata }
  return response.data;
};

// /api/contact/:id/deletecontact
const deleteContact = async (id) => {
  const response = await axios.delete(
    `${API_URL}${id}/deletecontact`,
    adminAuthConfig()
  );
  // response: { id, deleted, metadata }
  return response.data;
};

const contactService = {
  createContact,
  // createPublicContact, // if you enable it later
  getContacts,
  getUnhandledContacts,
  getContactById,
  markContactHandled,
  deleteContact,
};

export default contactService;
