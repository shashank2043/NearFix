import axiosInstance from './axiosInstance';

export const reviewApi = {
  
  createReview: async (reviewData) => {
    const response = await axiosInstance.post('/api/reviews', reviewData);
    return response.data;
  },

  
  getReviewsByWorker: async (workerId) => {
    const response = await axiosInstance.get(`/api/reviews?workerId=${workerId}`);
    return response.data;
  },

  
  getReviewByBooking: async (bookingId) => {
    const response = await axiosInstance.get(`/api/reviews?bookingId=${bookingId}`);
    return response.data;
  },

  
  getAllReviews: async () => {
    const response = await axiosInstance.get('/api/reviews');
    return response.data;
  }
};
