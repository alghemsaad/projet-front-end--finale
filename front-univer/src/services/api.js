import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  },
);

// ====== AUTH ======
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// ====== EVENTS ======
export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }),
  getPublic: (params) => api.get('/events/public', { params }),
  getByOrganizer: (params) => api.get('/events/organizer', { params }),
  getOrganizerStats: () => api.get('/events/organizer/stats'),
  getOne: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
};

// ====== REGISTRATIONS ======
export const registrationsAPI = {
  register: (data) => api.post('/registrations', data),
  getMy: () => api.get('/registrations/my'),
  getByEvent: (eventId) => api.get(`/registrations/event/${eventId}`),
  getOne: (id) => api.get(`/registrations/${id}`),
  cancel: (id) => api.delete(`/registrations/${id}`),
  checkIn: (id) => api.post(`/registrations/${id}/checkin`),
};

// ====== PARTICIPANTS ======
export const participantsAPI = {
  getByEvent: (eventId, params) => api.get(`/participants/event/${eventId}`, { params }),
  getEventStats: (eventId) => api.get(`/participants/event/${eventId}/stats`),
  checkIn: (id) => api.post(`/participants/${id}/checkin`),
  exportCSV: (eventId) => api.get(`/participants/event/${eventId}/export`, { responseType: 'blob' }),
};

export default api;
