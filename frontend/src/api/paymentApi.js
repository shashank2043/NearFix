import axiosInstance from './axiosInstance';

export const paymentApi = {
  
  createPayment: async (paymentData) => {
    const response = await axiosInstance.post('/api/payments', paymentData);
    return response.data;
  },

  
  getPaymentById: async (id) => {
    const response = await axiosInstance.get(`/api/payments/${id}`);
    return response.data;
  },

  
  getPaymentByBookingId: async (bookingId) => {
    const response = await axiosInstance.get(`/api/payments?bookingId=${bookingId}`);
    return response.data;
  },

  
  getAllPayments: async () => {
    const response = await axiosInstance.get('/api/payments');
    return response.data;
  },

  
  verifyPayment: async (verificationData) => {
    const response = await axiosInstance.post('/api/payments/verify', verificationData);
    return response.data;
  }
};
