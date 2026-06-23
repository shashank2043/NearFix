import { useState, useCallback } from 'react';
import { bookingApi } from '../api/bookingApi';
import { useAuth } from './useAuth';

/**
 * Custom hook to manage booking operations for the active session.
 */
export const useBooking = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetches a booking by its unique ID.
   */
  const fetchBookingById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingApi.getBookingById(id);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch booking details.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetches all bookings belonging to the currently logged in customer.
   */
  const fetchMyBookings = useCallback(async () => {
    if (!user?.id) return [];
    setLoading(true);
    setError(null);
    try {
      const data = await bookingApi.getBookingsByCustomer(user.id);
      // Sort newest first
      return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (err) {
      setError(err.message || 'Failed to fetch your bookings history.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /**
   * Creates a new emergency booking request.
   */
  const createBooking = useCallback(async (bookingData) => {
    if (!user?.id) throw new Error('User not authenticated.');
    setLoading(true);
    setError(null);
    try {
      const data = await bookingApi.createBooking({
        ...bookingData,
        customerId: user.id
      });
      return data;
    } catch (err) {
      setError(err.message || 'Failed to create booking.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /**
   * Updates the status of an existing booking.
   */
  const updateBookingStatus = useCallback(async (id, status) => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingApi.updateBookingStatus(id, status);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to update booking status.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchBookingById,
    fetchMyBookings,
    createBooking,
    updateBookingStatus
  };
};
