import axiosInstance from './axiosInstance';

export const workerApi = {
  
  createProfile: async (workerData) => {
    
    const response = await axiosInstance.post('/api/workers/profile', workerData);
    return response.data;
  },

  
  getProfileById: async (id) => {
    const response = await axiosInstance.get(`/api/workers/profile/${id}`);
    return response.data;
  },

  
  updateProfile: async (id, workerData) => {
    const response = await axiosInstance.put('/api/workers/profile', workerData);
    return response.data;
  },

  
  updateRating: async (id, rating) => {
    const response = await axiosInstance.put(`/api/workers/profile/${id}/rating?rating=${rating}`);
    return response.data;
  },

  
  updateStatus: async (id, status) => {
    const response = await axiosInstance.put('/api/workers/status', { status });
    return response.data;
  },

  
  searchWorkers: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.skill) params.append('skill', filters.skill);
    if (filters.city) params.append('city', filters.city);
    
    const response = await axiosInstance.get(`/api/workers/search?${params.toString()}`);
    return response.data;
  },

  
  getAvailableWorkers: async () => {
    const response = await axiosInstance.get('/api/workers/available');
    return response.data;
  },

  
  getAllWorkers: async () => {
    const response = await axiosInstance.get('/api/workers');
    return response.data;
  },

  
  verifyWorker: async (id, verified) => {
    const response = await axiosInstance.put(`/api/workers/profile/${id}/verify?verified=${verified}`);
    return response.data;
  },

  
  getCities: async () => {
    const response = await axiosInstance.get('/api/workers/cities');
    return response.data;
  },

  
  createCity: async (name) => {
    const response = await axiosInstance.post('/api/workers/cities', { name });
    return response.data;
  },

  
  deleteCity: async (id) => {
    const response = await axiosInstance.delete(`/api/workers/cities/${id}`);
    return response.data;
  }
};
