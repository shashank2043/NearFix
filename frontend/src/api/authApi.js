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

  
  getUserById: async (id, token = null) => {
    // console.log('Fetching user by ID:', id);
    const config = {};
    if (token) {
      config.headers = { Authorization: `Bearer ${token}` };
    }
    if (!id) {
      const response = await axiosInstance.get('/api/auth/users', config);
      return response.data;
    }
    const response = await axiosInstance.get(`/api/auth/users/${id}`, config);
    return response.data;
  },

  
  getProfile: async () => {
    const response = await axiosInstance.get('/api/auth/profile');
    return response.data;
  }
};
