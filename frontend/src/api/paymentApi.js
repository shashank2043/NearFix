import axiosInstance from './axiosInstance';

export const paymentApi = {
  /**
   * Creates a mock transaction payment record.
   * @param {Object} paymentData - { bookingId, amount }
   * @returns {Promise<Object>}
   */
  createPayment: async (paymentData) => {
    const payload = {
      ...paymentData,
      status: 'COMPLETED', // Instantly completed in the mock backend flow
      transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      paymentDate: new Date().toISOString()
    };
    const response = await axiosInstance.post('/payments', payload);
    return response.data;
  },

  /**
   * Fetches the details of a single transaction by ID.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  getPaymentById: async (id) => {
    const response = await axiosInstance.get(`/payments/${id}`);
    return response.data;
  },

  /**
   * Retrieves the payment transactions associated with a booking.
   * @param {string} bookingId
   * @returns {Promise<Array>}
   */
  getPaymentByBookingId: async (bookingId) => {
    const response = await axiosInstance.get(`/payments?bookingId=${bookingId}`);
    return response.data;
  },

  /**
   * Retrieves all payment transactions (Admin access).
   * @returns {Promise<Array>}
   */
  getAllPayments: async () => {
    const response = await axiosInstance.get('/payments');
    return response.data;
  }
};
