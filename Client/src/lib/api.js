import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://student-alumini-web-portal-1.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Multipart helper
const multipartApi = (method, url, formData) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return axios({
    method,
    url: `${API_BASE}${url}`,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
};

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  uploadPhoto: (id, formData) => multipartApi('post', `/users/${id}/photo`, formData),
};

// Jobs API
export const jobsAPI = {
  getAll: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  apply: (id, formData) => api.put(`/jobs/${id}/apply`, formData),
  getApplications: (id) => api.get(`/jobs/${id}/applications`),
  delete: (id) => api.delete(`/jobs/${id}`),
};

// Events API
export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (formData) => multipartApi('post', '/events', formData),
  uploadMedia: (id, formData) => multipartApi('post', `/events/${id}/media`, formData),
  register: (id) => api.put(`/events/${id}/register`),
  delete: (id) => api.delete(`/events/${id}`),
};

// Resumes API
export const resumesAPI = {
  get: (userId) => api.get(`/resumes/${userId}`),
  save: (data) => api.post('/resumes', data),
  download: (userId) => `${API_BASE}/resumes/${userId}/download`,
};

// Notes API
export const notesAPI = {
  getAll: (params) => api.get('/notes', { params }),
  getById: (id) => api.get(`/notes/${id}`),
  getBranches: () => api.get('/notes/branches'),
  create: (formData) => multipartApi('post', '/notes', formData),
  trackDownload: (id) => api.put(`/notes/${id}/download`),
  delete: (id) => api.delete(`/notes/${id}`),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  addUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

export default api;
