import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import bookingReducer from './slices/bookingSlice';
import workerReducer from './slices/workerSlice';
import paymentReducer from './slices/paymentSlice';
import reviewReducer from './slices/reviewSlice';
import { injectStore } from '../api/axiosInstance';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    booking: bookingReducer,
    worker: workerReducer,
    payment: paymentReducer,
    review: reviewReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Turn off since Axios errors or responses might have non-serializable details
    }),
});

injectStore(store);
