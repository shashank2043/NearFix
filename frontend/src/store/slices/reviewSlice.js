import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewApi } from '../../api/reviewApi';

export const createReviewThunk = createAsyncThunk(
  'review/createReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      const data = await reviewApi.createReview(reviewData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create review');
    }
  }
);

export const getReviewsByWorkerThunk = createAsyncThunk(
  'review/getReviewsByWorker',
  async (workerId, { rejectWithValue }) => {
    try {
      const data = await reviewApi.getReviewsByWorker(workerId);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch reviews for worker');
    }
  }
);

export const getReviewByBookingThunk = createAsyncThunk(
  'review/getReviewByBooking',
  async (bookingId, { rejectWithValue }) => {
    try {
      const data = await reviewApi.getReviewByBooking(bookingId);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch review for booking');
    }
  }
);

export const getAllReviewsThunk = createAsyncThunk(
  'review/getAllReviews',
  async (_, { rejectWithValue }) => {
    try {
      const data = await reviewApi.getAllReviews();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch all reviews');
    }
  }
);

const initialState = {
  reviews: [],
  currentReview: null,
  loading: false,
  error: null,
};

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    clearCurrentReview: (state) => {
      state.currentReview = null;
    },
    clearReviewError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fulfilled cases
      .addCase(createReviewThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews.unshift(action.payload);
        state.currentReview = action.payload;
      })
      .addCase(getReviewsByWorkerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(getReviewByBookingThunk.fulfilled, (state, action) => {
        state.loading = false;
        const result = action.payload;
        if (Array.isArray(result)) {
          if (result.length > 0) {
            state.currentReview = result[0];
          }
        } else {
          state.currentReview = result;
        }
      })
      .addCase(getAllReviewsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      // Pending matcher
      .addMatcher(
        (action) => action.type.startsWith('review/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      // Rejected matcher
      .addMatcher(
        (action) => action.type.startsWith('review/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearCurrentReview, clearReviewError } = reviewSlice.actions;
export default reviewSlice.reducer;
