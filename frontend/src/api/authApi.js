import axiosInstance from './axiosInstance';

export const authApi = {
  
  login: async (email, password) => {
    const response = await axiosInstance.post('/api/auth/login', { email, password });
    return response.data;
  },

  
  register: async (userData) => {
    const response = await axiosInstance.post('/api/auth/register', userData);
    return response.data;
  },

  
  getUserById: async (id) => {
    if (!id) {
      const response = await axiosInstance.get('/api/auth/users');
      return response.data;
    }
    const response = await axiosInstance.get(`/api/auth/users/${id}`);
    return response.data;
  },

  
  getProfile: async () => {
    const response = await axiosInstance.get('/api/auth/profile');
    return response.data;
  }
};
