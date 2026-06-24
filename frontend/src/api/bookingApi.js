import axiosInstance from './axiosInstance';

export const bookingApi = {
  
  createBooking: async (bookingData) => {
    const response = await axiosInstance.post('/api/bookings', bookingData);
    return response.data;
  },

  
  getBookingById: async (id) => {
    const response = await axiosInstance.get(`/api/bookings/${id}`);
    return response.data;
  },

  
  getBookingsByCustomer: async (customerId) => {
    const response = await axiosInstance.get('/api/bookings/customer');
    return response.data;
  },

  
  getBookingsByWorker: async (workerId) => {
    const response = await axiosInstance.get('/api/bookings/worker');
    return response.data;
  },

  
  getAllBookings: async () => {
    const response = await axiosInstance.get('/api/bookings');
    return response.data;
  },

  
  updateBookingStatus: async (id, status, extraData = {}) => {
    const response = await axiosInstance.put(`/api/bookings/${id}/status`, { status, ...extraData });
    return response.data;
  },

  updateWorkerLocation: async (bookingId, lat, lng) => {
    const response = await axiosInstance.put(`/api/bookings/${bookingId}/worker-location`, {
      workerLatitude: lat,
      workerLongitude: lng
    });
    return response.data;
  },

  
  assignWorker: async (bookingId, workerId) => {
    const response = await axiosInstance.put(`/api/bookings/${bookingId}/assign-worker/${workerId}`);
    return response.data;
  },

  
  rejectBooking: async (bookingId) => {
    const response = await axiosInstance.put(`/api/bookings/${bookingId}/reject`);
    return response.data;
  },

  
  getAvailableBookings: async (skill, city) => {
    const response = await axiosInstance.get(`/api/bookings/available?skill=${encodeURIComponent(skill)}&city=${encodeURIComponent(city)}`);
    return response.data;
  }
};
