import axiosInstance from './axiosInstance';

export const workerApi = {
  /**
   * Creates a worker profile.
   * @param {Object} workerData - { id, skill, experience, city }
   * @returns {Promise<Object>}
   */
  createProfile: async (workerData) => {
    const payload = {
      ...workerData,
      rating: 5.0,
      verified: false,
      status: 'UNAVAILABLE' // Default status when profile is created
    };
    const response = await axiosInstance.post('/workers', payload);
    return response.data;
  },

  /**
   * Fetches a worker's profile by their user ID.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  getProfileById: async (id) => {
    const response = await axiosInstance.get(`/workers/${id}`);
    return response.data;
  },

  /**
   * Updates worker profile details.
   * @param {string} id
   * @param {Object} workerData - { skill, experience, city }
   * @returns {Promise<Object>}
   */
  updateProfile: async (id, workerData) => {
    const response = await axiosInstance.patch(`/workers/${id}`, workerData);
    return response.data;
  },

  /**
   * Updates worker's real-time availability status.
   * @param {string} id
   * @param {string} status - AVAILABLE, BUSY, UNAVAILABLE
   * @returns {Promise<Object>}
   */
  updateStatus: async (id, status) => {
    const response = await axiosInstance.patch(`/workers/${id}`, { status });
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
    
    const response = await axiosInstance.get(`/workers?${params.toString()}`);
    return response.data;
  },

  /**
   * Retrieves all workers that are currently AVAILABLE.
   * @returns {Promise<Array>}
   */
  getAvailableWorkers: async () => {
    const response = await axiosInstance.get('/workers?status=AVAILABLE');
    return response.data;
  },

  /**
   * Retrieves all worker profiles (Admin access).
   * @returns {Promise<Array>}
   */
  getAllWorkers: async () => {
    const response = await axiosInstance.get('/workers');
    return response.data;
  },

  /**
   * Updates the admin verification status of a worker.
   * @param {string} id
   * @param {boolean} verified
   * @returns {Promise<Object>}
   */
  verifyWorker: async (id, verified) => {
    const response = await axiosInstance.patch(`/workers/${id}`, { verified });
    return response.data;
  }
};
