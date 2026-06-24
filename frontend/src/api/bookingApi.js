import axiosInstance from './axiosInstance';

export const bookingApi = {
  /**
   * Creates a new service booking request.
   * @param {Object} bookingData - { serviceType, issueDescription, address }
   * @returns {Promise<Object>}
   */
  createBooking: async (bookingData) => {
    const response = await axiosInstance.post('/api/bookings', bookingData);
    return response.data;
  },

  /**
   * Fetches the details of a single booking by ID.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  getBookingById: async (id) => {
    const response = await axiosInstance.get(`/api/bookings/${id}`);
    return response.data;
  },

  /**
   * Fetches all bookings requested by the currently logged-in customer.
   * @param {string} customerId - Ignored (backend resolves via JWT)
   * @returns {Promise<Array>}
   */
  getBookingsByCustomer: async (customerId) => {
    const response = await axiosInstance.get('/api/bookings/customer');
    return response.data;
  },

  /**
   * Fetches all bookings assigned to the currently logged-in worker.
   * @param {string} workerId - Ignored (backend resolves via JWT)
   * @returns {Promise<Array>}
   */
  getBookingsByWorker: async (workerId) => {
    const response = await axiosInstance.get('/api/bookings/worker');
    return response.data;
  },

  /**
   * Fetches all bookings in the system (Admin access).
   * @returns {Promise<Array>}
   */
  getAllBookings: async () => {
    const response = await axiosInstance.get('/api/bookings');
    return response.data;
  },

  /**
   * Updates the status of a booking.
   * @param {string} id
   * @param {string} status - REQUESTED, ACCEPTED, ON_THE_WAY, WORK_STARTED, WORK_COMPLETED, PAID, CANCELLED
   * @param {Object} extraData - Optional extra payload data
   * @returns {Promise<Object>}
   */
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

  /**
   * Assigns a worker to a specific booking and transitions its status to ACCEPTED.
   * @param {string} bookingId
   * @param {string} workerId
   * @returns {Promise<Object>}
   */
  assignWorker: async (bookingId, workerId) => {
    const response = await axiosInstance.put(`/api/bookings/${bookingId}/assign-worker/${workerId}`);
    return response.data;
  },

  /**
   * Worker rejects a booking request (releasing assignment).
   * @param {string} bookingId
   * @returns {Promise<Object>}
   */
  rejectBooking: async (bookingId) => {
    const response = await axiosInstance.put(`/api/bookings/${bookingId}/reject`);
    return response.data;
  },

  /**
   * Fetches all available (unassigned) bookings matching a skill in a city.
   * @param {string} skill
   * @param {string} city
   * @returns {Promise<Array>}
   */
  getAvailableBookings: async (skill, city) => {
    const response = await axiosInstance.get(`/api/bookings/available?skill=${encodeURIComponent(skill)}&city=${encodeURIComponent(city)}`);
    return response.data;
  }
};
