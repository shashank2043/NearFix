import axiosInstance from './axiosInstance';

export const bookingApi = {
  /**
   * Creates a new service booking request.
   * @param {Object} bookingData - { customerId, serviceType, issueDescription, address }
   * @returns {Promise<Object>}
   */
  createBooking: async (bookingData) => {
    const payload = {
      ...bookingData,
      workerId: null,
      status: 'REQUESTED',
      createdAt: new Date().toISOString()
    };
    const response = await axiosInstance.post('/bookings', payload);
    return response.data;
  },

  /**
   * Fetches the details of a single booking by ID.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  getBookingById: async (id) => {
    const response = await axiosInstance.get(`/bookings/${id}`);
    return response.data;
  },

  /**
   * Fetches all bookings requested by a specific customer.
   * @param {string} customerId
   * @returns {Promise<Array>}
   */
  getBookingsByCustomer: async (customerId) => {
    const response = await axiosInstance.get(`/bookings?customerId=${customerId}`);
    return response.data;
  },

  /**
   * Fetches all bookings assigned to a specific worker.
   * @param {string} workerId
   * @returns {Promise<Array>}
   */
  getBookingsByWorker: async (workerId) => {
    const response = await axiosInstance.get(`/bookings?workerId=${workerId}`);
    return response.data;
  },

  /**
   * Fetches all bookings in the system (Admin access).
   * @returns {Promise<Array>}
   */
  getAllBookings: async () => {
    const response = await axiosInstance.get('/bookings');
    return response.data;
  },

  /**
   * Updates the status of a booking.
   * @param {string} id
   * @param {string} status - REQUESTED, ACCEPTED, ON_THE_WAY, WORK_STARTED, WORK_COMPLETED, PAID, CANCELLED
   * @returns {Promise<Object>}
   */
  updateBookingStatus: async (id, status) => {
    const response = await axiosInstance.patch(`/bookings/${id}`, { status });
    return response.data;
  },

  /**
   * Assigns a worker to a specific booking and transitions its status to ACCEPTED.
   * @param {string} bookingId
   * @param {string} workerId
   * @returns {Promise<Object>}
   */
  assignWorker: async (bookingId, workerId) => {
    const response = await axiosInstance.patch(`/bookings/${bookingId}`, {
      workerId,
      status: 'ACCEPTED'
    });
    return response.data;
  }
};
