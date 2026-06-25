import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingApi } from '../../api/bookingApi';

export const createBookingThunk = createAsyncThunk(
  'booking/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const data = await bookingApi.createBooking(bookingData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create booking');
    }
  }
);

export const getBookingByIdThunk = createAsyncThunk(
  'booking/getBookingById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await bookingApi.getBookingById(id);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch booking details');
    }
  }
);

export const getBookingsByCustomerThunk = createAsyncThunk(
  'booking/getBookingsByCustomer',
  async (customerId, { rejectWithValue }) => {
    try {
      const data = await bookingApi.getBookingsByCustomer(customerId);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch customer bookings');
    }
  }
);

export const getBookingsByWorkerThunk = createAsyncThunk(
  'booking/getBookingsByWorker',
  async (workerId, { rejectWithValue }) => {
    try {
      const data = await bookingApi.getBookingsByWorker(workerId);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch worker bookings');
    }
  }
);

export const getAllBookingsThunk = createAsyncThunk(
  'booking/getAllBookings',
  async (_, { rejectWithValue }) => {
    try {
      const data = await bookingApi.getAllBookings();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch all bookings');
    }
  }
);

export const updateBookingStatusThunk = createAsyncThunk(
  'booking/updateBookingStatus',
  async ({ id, status, extraData }, { rejectWithValue }) => {
    try {
      const data = await bookingApi.updateBookingStatus(id, status, extraData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update booking status');
    }
  }
);

export const updateWorkerLocationThunk = createAsyncThunk(
  'booking/updateWorkerLocation',
  async ({ bookingId, lat, lng }, { rejectWithValue }) => {
    try {
      const data = await bookingApi.updateWorkerLocation(bookingId, lat, lng);
      return { bookingId, data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update worker location');
    }
  }
);

export const assignWorkerThunk = createAsyncThunk(
  'booking/assignWorker',
  async ({ bookingId, workerId }, { rejectWithValue }) => {
    try {
      const data = await bookingApi.assignWorker(bookingId, workerId);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to assign worker');
    }
  }
);

export const rejectBookingThunk = createAsyncThunk(
  'booking/rejectBooking',
  async (bookingId, { rejectWithValue }) => {
    try {
      const data = await bookingApi.rejectBooking(bookingId);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to reject booking');
    }
  }
);

export const getAvailableBookingsThunk = createAsyncThunk(
  'booking/getAvailableBookings',
  async ({ skill, city }, { rejectWithValue }) => {
    try {
      const data = await bookingApi.getAvailableBookings(skill, city);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch available bookings');
    }
  }
);

const initialState = {
  bookings: [],
  currentBooking: null,
  availableBookings: [],
  loading: false,
  error: null,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
    clearBookingError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fulfilled cases
      .addCase(createBookingThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings.unshift(action.payload);
        state.currentBooking = action.payload;
      })
      .addCase(getBookingByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload;
      })
      .addCase(getBookingsByCustomerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(getBookingsByWorkerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(getAllBookingsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(updateBookingStatusThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        state.bookings = state.bookings.map(b => b.id === updated.id ? updated : b);
        if (state.currentBooking && state.currentBooking.id === updated.id) {
          state.currentBooking = updated;
        }
      })
      .addCase(updateWorkerLocationThunk.fulfilled, (state, action) => {
        state.loading = false;
        const { bookingId, data } = action.payload;
        if (state.currentBooking && state.currentBooking.id === bookingId) {
          state.currentBooking.workerLatitude = data.workerLatitude;
          state.currentBooking.workerLongitude = data.workerLongitude;
        }
        state.bookings = state.bookings.map(b => b.id === bookingId ? {
          ...b,
          workerLatitude: data.workerLatitude,
          workerLongitude: data.workerLongitude
        } : b);
      })
      .addCase(assignWorkerThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        state.bookings = state.bookings.map(b => b.id === updated.id ? updated : b);
        if (state.currentBooking && state.currentBooking.id === updated.id) {
          state.currentBooking = updated;
        }
      })
      .addCase(rejectBookingThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        state.bookings = state.bookings.map(b => b.id === updated.id ? updated : b);
        if (state.currentBooking && state.currentBooking.id === updated.id) {
          state.currentBooking = updated;
        }
      })
      .addCase(getAvailableBookingsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.availableBookings = action.payload;
      })
      // Pending state for all async operations
      .addMatcher(
        (action) => action.type.startsWith('booking/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      // Rejected state for all async operations
      .addMatcher(
        (action) => action.type.startsWith('booking/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearCurrentBooking, clearBookingError } = bookingSlice.actions;
export default bookingSlice.reducer;
