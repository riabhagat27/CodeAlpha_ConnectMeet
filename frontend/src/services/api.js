import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach Authorization Bearer token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('connectmeet_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthenticated 401s gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token might be invalid or expired
      const isAuthRoute = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isAuthRoute) {
        localStorage.removeItem('connectmeet_token');
        localStorage.removeItem('connectmeet_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

export const meetingService = {
  createMeeting: async (title) => {
    const response = await api.post('/meetings', { title });
    return response.data;
  },

  getMeetings: async () => {
    const response = await api.get('/meetings');
    return response.data;
  },

  getMeetingByCode: async (code) => {
    const response = await api.get(`/meetings/${code}`);
    return response.data;
  },

  deleteMeeting: async (code) => {
    const response = await api.delete(`/meetings/${code}`);
    return response.data;
  }
};

export const fileService = {
  uploadFile: async (formData) => {
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getMeetingFiles: async (meetingId) => {
    const response = await api.get(`/files/${meetingId}`);
    return response.data;
  },

  getDownloadUrl: (fileId) => {
    const token = localStorage.getItem('connectmeet_token');
    return `${API_BASE_URL}/files/download/${fileId}?token=${token}`;
  }
};

export default api;
