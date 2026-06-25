import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getBookingByIdThunk, 
  getBookingsByCustomerThunk, 
  createBookingThunk, 
  updateBookingStatusThunk 
} from '../store/slices/bookingSlice';
import { useAuth } from './useAuth';
import { useToast } from './useToast';

export const useBooking = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { bookings, currentBooking, loading, error } = useSelector((state) => state.booking);
  const { showToast } = useToast();

  
  const fetchBookingById = useCallback(async (id) => {
    try {
      const data = await dispatch(getBookingByIdThunk(id)).unwrap();
      return data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to fetch booking details.';
      showToast(errMsg, 'error');
      throw err;
    }
  }, [dispatch, showToast]);

  
  const fetchMyBookings = useCallback(async () => {
    if (!user?.id) return [];
    try {
      const data = await dispatch(getBookingsByCustomerThunk(user.id)).unwrap();
      return [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to fetch your bookings history.';
      showToast(errMsg, 'error');
      throw err;
    }
  }, [user?.id, dispatch, showToast]);

  
  const createBooking = useCallback(async (bookingData) => {
    if (!user?.id) throw new Error('User not authenticated.');
    try {
      const data = await dispatch(createBookingThunk({
        ...bookingData,
        customerId: user.id
      })).unwrap();
      showToast('Emergency SOS Dispatch Requested!', 'success');
      return data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to create booking.';
      showToast(errMsg, 'error');
      throw err;
    }
  }, [user?.id, dispatch, showToast]);

  
  const updateBookingStatus = useCallback(async (id, status) => {
    try {
      const data = await dispatch(updateBookingStatusThunk({ id, status })).unwrap();
      return data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to update booking status.';
      showToast(errMsg, 'error');
      throw err;
    }
  }, [dispatch, showToast]);

  return {
    bookings,
    currentBooking,
    loading,
    error,
    fetchBookingById,
    fetchMyBookings,
    createBooking,
    updateBookingStatus
  };
};
