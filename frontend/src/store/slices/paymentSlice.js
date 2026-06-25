import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentApi } from '../../api/paymentApi';

export const createPaymentThunk = createAsyncThunk(
  'payment/createPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const data = await paymentApi.createPayment(paymentData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create payment');
    }
  }
);

export const getPaymentByIdThunk = createAsyncThunk(
  'payment/getPaymentById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await paymentApi.getPaymentById(id);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch payment details');
    }
  }
);

export const getPaymentByBookingIdThunk = createAsyncThunk(
  'payment/getPaymentByBookingId',
  async (bookingId, { rejectWithValue }) => {
    try {
      const data = await paymentApi.getPaymentByBookingId(bookingId);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch payment by booking ID');
    }
  }
);

export const getAllPaymentsThunk = createAsyncThunk(
  'payment/getAllPayments',
  async (_, { rejectWithValue }) => {
    try {
      const data = await paymentApi.getAllPayments();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch all payments');
    }
  }
);

export const verifyPaymentThunk = createAsyncThunk(
  'payment/verifyPayment',
  async (verificationData, { rejectWithValue }) => {
    try {
      const data = await paymentApi.verifyPayment(verificationData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to verify payment');
    }
  }
);

const initialState = {
  payments: [],
  currentPayment: null,
  loading: false,
  error: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
    },
    clearPaymentError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fulfilled cases
      .addCase(createPaymentThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.payments.unshift(action.payload);
        state.currentPayment = action.payload;
      })
      .addCase(getPaymentByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload;
      })
      .addCase(getPaymentByBookingIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        // Since getPaymentByBookingId might return a single payment or array
        const result = action.payload;
        if (Array.isArray(result)) {
          if (result.length > 0) {
            state.currentPayment = result[0];
          }
        } else {
          state.currentPayment = result;
        }
      })
      .addCase(getAllPaymentsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload;
      })
      .addCase(verifyPaymentThunk.fulfilled, (state, action) => {
        state.loading = false;
        const verifiedPayment = action.payload;
        state.payments = state.payments.map(p => p.id === verifiedPayment.id ? verifiedPayment : p);
        if (state.currentPayment && state.currentPayment.id === verifiedPayment.id) {
          state.currentPayment = verifiedPayment;
        }
      })
      // Pending matcher
      .addMatcher(
        (action) => action.type.startsWith('payment/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      // Rejected matcher
      .addMatcher(
        (action) => action.type.startsWith('payment/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearCurrentPayment, clearPaymentError } = paymentSlice.actions;
export default paymentSlice.reducer;
