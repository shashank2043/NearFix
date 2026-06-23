import axiosInstance from './axiosInstance';

export const authApi = {
  /**
   * Simulates user login against json-server.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{token: string, role: string, id: string, fullName: string}>}
   */
  login: async (email, password) => {
    const response = await axiosInstance.get(`/users?email=${encodeURIComponent(email)}`);
    const users = response.data;
    
    if (users.length > 0) {
      const user = users[0];
      if (user.password === password) {
        if (!user.active) {
          throw new Error('Account is deactivated. Please contact support.');
        }
        return {
          token: `mock-jwt-token-${user.id}`,
          role: user.role, // CUSTOMER, WORKER, ADMIN
          id: user.id,
          fullName: user.fullName
        };
      }
    }
    throw new Error('Invalid email or password');
  },

  /**
   * Simulates user registration.
   * @param {Object} userData - { fullName, email, phone, password, role }
   * @returns {Promise<{id: string, message: string}>}
   */
  register: async (userData) => {
    // Check if email already exists
    const emailCheck = await axiosInstance.get(`/users?email=${encodeURIComponent(userData.email)}`);
    if (emailCheck.data.length > 0) {
      throw new Error('Email is already in use');
    }

    // Check if phone already exists
    const phoneCheck = await axiosInstance.get(`/users?phone=${encodeURIComponent(userData.phone)}`);
    if (phoneCheck.data.length > 0) {
      throw new Error('Phone number is already in use');
    }

    const newUser = {
      ...userData,
      active: true,
      createdAt: new Date().toISOString()
    };

    const response = await axiosInstance.post('/users', newUser);
    return {
      id: response.data.id,
      message: 'Registration successful'
    };
  },

  /**
   * Fetches user profile data by ID.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  getUserById: async (id) => {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Resolves the profile of the currently logged-in user.
   */
  getProfile: async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authorization token found');
    const id = token.replace('mock-jwt-token-', '');
    return authApi.getUserById(id);
  }
};
