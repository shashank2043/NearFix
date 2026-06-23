import { useState, useCallback } from 'react';
import { workerApi } from '../api/workerApi';
import { bookingApi } from '../api/bookingApi';
import { useToast } from './useToast';

/**
 * Custom hook to manage worker-related operations, including fetching profiles,
 * updating availability, and managing assigned booking statuses.
 * Integrates global toast notifications for transparent error reporting.
 */
export const useWorkers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  /**
   * Fetches a worker profile by ID.
   */
  const fetchWorkerById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await workerApi.getProfileById(id);
      return data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to fetch worker profile.';
      setError(errMsg);
      showToast(errMsg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  /**
   * Updates the worker availability status (AVAILABLE, BUSY, UNAVAILABLE).
   */
  const updateAvailability = useCallback(async (id, status) => {
    setLoading(true);
    setError(null);
    try {
      const data = await workerApi.updateStatus(id, status);
      showToast(`Duty status advanced to ${status}`, 'success');
      return data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to update availability status.';
      setError(errMsg);
      showToast(errMsg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  /**
   * Fetches bookings assigned to a specific worker.
   */
  const fetchWorkerBookings = useCallback(async (workerId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingApi.getBookingsByWorker(workerId);
      // Sort newest first
      return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to fetch worker bookings.';
      setError(errMsg);
      showToast(errMsg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  /**
   * Updates the status of a specific booking, with optional extra payload details.
   */
  const updateBookingStatus = useCallback(async (id, status, extraData = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingApi.updateBookingStatus(id, status, extraData);
      return data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to update booking status.';
      setError(errMsg);
      showToast(errMsg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  return {
    loading,
    error,
    fetchWorkerById,
    updateAvailability,
    fetchWorkerBookings,
    updateBookingStatus
  };
};
