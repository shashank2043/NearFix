import axiosInstance from './axiosInstance';

export const authApi = {
  /**
   * Logs in user against Spring Boot auth service.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{token: string, role: string, id: string}>}
   */
  login: async (email, password) => {
    const response = await axiosInstance.post('/api/auth/login', { email, password });
    return response.data;
  },

  /**
   * Registers a new user.
   * @param {Object} userData - { fullName, email, phone, password, role }
   * @returns {Promise<{id: string, message: string}>}
   */
  register: async (userData) => {
    const response = await axiosInstance.post('/api/auth/register', userData);
    return response.data;
  },

  /**
   * Fetches user profile data by ID. If ID is empty/falsy, fetches all users.
   * @param {string} id
   * @returns {Promise<Object|Array>}
   */
  getUserById: async (id) => {
    if (!id) {
      const response = await axiosInstance.get('/api/auth/users');
      return response.data;
    }
    const response = await axiosInstance.get(`/api/auth/users/${id}`);
    return response.data;
  },

  /**
   * Resolves the profile of the currently logged-in user.
   */
  getProfile: async () => {
    const response = await axiosInstance.get('/api/auth/profile');
    return response.data;
  }
};
