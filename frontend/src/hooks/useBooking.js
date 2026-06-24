import { useState, useCallback } from 'react';
import { bookingApi } from '../api/bookingApi';
import { useAuth } from './useAuth';
import { useToast } from './useToast';


export const useBooking = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  
  const fetchBookingById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingApi.getBookingById(id);
      return data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to fetch booking details.';
      setError(errMsg);
      showToast(errMsg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  
  const fetchMyBookings = useCallback(async () => {
    if (!user?.id) return [];
    setLoading(true);
    setError(null);
    try {
      const data = await bookingApi.getBookingsByCustomer(user.id);
      
      return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to fetch your bookings history.';
      setError(errMsg);
      showToast(errMsg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, showToast]);

  
  const createBooking = useCallback(async (bookingData) => {
    if (!user?.id) throw new Error('User not authenticated.');
    setLoading(true);
    setError(null);
    try {
      const data = await bookingApi.createBooking({
        ...bookingData,
        customerId: user.id
      });
      showToast('Emergency SOS Dispatch Requested!', 'success');
      return data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to create booking.';
      setError(errMsg);
      showToast(errMsg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, showToast]);

  
  const updateBookingStatus = useCallback(async (id, status) => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingApi.updateBookingStatus(id, status);
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
    fetchBookingById,
    fetchMyBookings,
    createBooking,
    updateBookingStatus
  };
};
