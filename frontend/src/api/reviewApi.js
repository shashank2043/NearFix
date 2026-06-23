import axiosInstance from './axiosInstance';

export const reviewApi = {
  /**
   * Submits a customer review for a service booking.
   * @param {Object} reviewData - { bookingId, customerId, workerId, rating, comment }
   * @returns {Promise<Object>}
   */
  createReview: async (reviewData) => {
    const response = await axiosInstance.post('/reviews', reviewData);
    return response.data;
  },

  /**
   * Fetches all reviews left for a particular worker.
   * @param {string} workerId
   * @returns {Promise<Array>}
   */
  getReviewsByWorker: async (workerId) => {
    const response = await axiosInstance.get(`/reviews?workerId=${workerId}`);
    return response.data;
  },

  /**
   * Fetches reviews linked to a specific booking.
   * @param {string} bookingId
   * @returns {Promise<Array>}
   */
  getReviewByBooking: async (bookingId) => {
    const response = await axiosInstance.get(`/reviews?bookingId=${bookingId}`);
    return response.data;
  },

  /**
   * Retrieves all reviews in the system (Admin access).
   * @returns {Promise<Array>}
   */
  getAllReviews: async () => {
    const response = await axiosInstance.get('/reviews');
    return response.data;
  }
};
