import axiosInstance from './axiosInstance';

export const workerApi = {
  /**
   * Creates a worker profile in the backend.
   * @param {Object} workerData - { skill, experience, city }
   * @returns {Promise<Object>}
   */
  createProfile: async (workerData) => {
    // Backend API takes CreateWorkerProfileRequest
    const response = await axiosInstance.post('/api/workers/profile', workerData);
    return response.data;
  },

  /**
   * Fetches a worker's profile by their user ID.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  getProfileById: async (id) => {
    const response = await axiosInstance.get(`/api/workers/profile/${id}`);
    return response.data;
  },

  /**
   * Updates worker profile details for currently logged-in worker.
   * @param {string} id
   * @param {Object} workerData - { skill, experience, city }
   * @returns {Promise<Object>}
   */
  updateProfile: async (id, workerData) => {
    const response = await axiosInstance.put('/api/workers/profile', workerData);
    return response.data;
  },

  /**
   * Updates worker's average rating.
   * @param {string} id
   * @param {number} rating
   * @returns {Promise<Object>}
   */
  updateRating: async (id, rating) => {
    const response = await axiosInstance.put(`/api/workers/profile/${id}/rating?rating=${rating}`);
    return response.data;
  },

  /**
   * Updates worker's real-time availability status.
   * @param {string} id
   * @param {string} status - AVAILABLE, BUSY, OFFLINE
   * @returns {Promise<Object>}
   */
  updateStatus: async (id, status) => {
    const response = await axiosInstance.put('/api/workers/status', { status });
    return response.data;
  },

  /**
   * Searches for workers with optional filter parameters.
   * @param {Object} filters - { skill, city }
   * @returns {Promise<Array>}
   */
  searchWorkers: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.skill) params.append('skill', filters.skill);
    if (filters.city) params.append('city', filters.city);
    
    const response = await axiosInstance.get(`/api/workers/search?${params.toString()}`);
    return response.data;
  },

  /**
   * Retrieves all workers that are currently AVAILABLE.
   * @returns {Promise<Array>}
   */
  getAvailableWorkers: async () => {
    const response = await axiosInstance.get('/api/workers/available');
    return response.data;
  },

  /**
   * Retrieves all worker profiles (Admin access).
   * @returns {Promise<Array>}
   */
  getAllWorkers: async () => {
    const response = await axiosInstance.get('/api/workers');
    return response.data;
  },

  /**
   * Updates the admin verification status of a worker.
   * @param {string} id
   * @param {boolean} verified
   * @returns {Promise<Object>}
   */
  verifyWorker: async (id, verified) => {
    const response = await axiosInstance.put(`/api/workers/profile/${id}/verify?verified=${verified}`);
    return response.data;
  },

  /**
   * Retrieves all operating cities.
   * @returns {Promise<Array>}
   */
  getCities: async () => {
    const response = await axiosInstance.get('/api/workers/cities');
    return response.data;
  },

  /**
   * Creates a new operating city (Admin access).
   * @param {string} name
   * @returns {Promise<Object>}
   */
  createCity: async (name) => {
    const response = await axiosInstance.post('/api/workers/cities', { name });
    return response.data;
  },

  /**
   * Deletes an operating city (Admin access).
   * @param {string} id
   * @returns {Promise<Object>}
   */
  deleteCity: async (id) => {
    const response = await axiosInstance.delete(`/api/workers/cities/${id}`);
    return response.data;
  }
};
