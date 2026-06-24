import axiosInstance from './axiosInstance';

export const paymentApi = {
  /**
   * Creates a transaction payment record in the backend.
   * @param {Object} paymentData - { bookingId, amount }
   * @returns {Promise<Object>}
   */
  createPayment: async (paymentData) => {
    const response = await axiosInstance.post('/api/payments', paymentData);
    return response.data;
  },

  /**
   * Fetches the details of a single transaction by ID.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  getPaymentById: async (id) => {
    const response = await axiosInstance.get(`/api/payments/${id}`);
    return response.data;
  },

  /**
   * Retrieves the payment transactions associated with a booking.
   * @param {string} bookingId
   * @returns {Promise<Array>}
   */
  getPaymentByBookingId: async (bookingId) => {
    const response = await axiosInstance.get(`/api/payments?bookingId=${bookingId}`);
    return response.data;
  },

  /**
   * Retrieves all payment transactions (Admin access).
   * @returns {Promise<Array>}
   */
  getAllPayments: async () => {
    const response = await axiosInstance.get('/api/payments');
    return response.data;
  }
};
