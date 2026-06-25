import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getWorkerProfileByIdThunk, 
  updateWorkerStatusThunk 
} from '../store/slices/workerSlice';
import { 
  getBookingsByWorkerThunk, 
  updateBookingStatusThunk 
} from '../store/slices/bookingSlice';
import { useToast } from './useToast';

export const useWorkers = () => {
  const dispatch = useDispatch();
  const { workers, currentWorker, loading: workerLoading, error: workerError } = useSelector((state) => state.worker);
  const { loading: bookingLoading, error: bookingError } = useSelector((state) => state.booking);
  const { showToast } = useToast();

  const loading = workerLoading || bookingLoading;
  const error = workerError || bookingError;

  
  const fetchWorkerById = useCallback(async (id) => {
    try {
      const data = await dispatch(getWorkerProfileByIdThunk(id)).unwrap();
      return data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to fetch worker profile.';
      showToast(errMsg, 'error');
      throw err;
    }
  }, [dispatch, showToast]);

  
  const updateAvailability = useCallback(async (id, status) => {
    try {
      const data = await dispatch(updateWorkerStatusThunk({ id, status })).unwrap();
      showToast(`Duty status advanced to ${status}`, 'success');
      return data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to update availability status.';
      showToast(errMsg, 'error');
      throw err;
    }
  }, [dispatch, showToast]);

  
  const fetchWorkerBookings = useCallback(async (workerId) => {
    try {
      const data = await dispatch(getBookingsByWorkerThunk(workerId)).unwrap();
      return [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to fetch worker bookings.';
      showToast(errMsg, 'error');
      throw err;
    }
  }, [dispatch, showToast]);

  
  const updateBookingStatus = useCallback(async (id, status, extraData = {}) => {
    try {
      const data = await dispatch(updateBookingStatusThunk({ id, status, extraData })).unwrap();
      return data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to update booking status.';
      showToast(errMsg, 'error');
      throw err;
    }
  }, [dispatch, showToast]);

  return {
    workers,
    currentWorker,
    loading,
    error,
    fetchWorkerById,
    updateAvailability,
    fetchWorkerBookings,
    updateBookingStatus
  };
};
