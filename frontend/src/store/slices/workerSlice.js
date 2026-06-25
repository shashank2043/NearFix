import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { workerApi } from '../../api/workerApi';

export const createWorkerProfileThunk = createAsyncThunk(
  'worker/createProfile',
  async (workerData, { rejectWithValue }) => {
    try {
      const data = await workerApi.createProfile(workerData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create worker profile');
    }
  }
);

export const getWorkerProfileByIdThunk = createAsyncThunk(
  'worker/getProfileById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await workerApi.getProfileById(id);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch worker profile');
    }
  }
);

export const updateWorkerProfileThunk = createAsyncThunk(
  'worker/updateProfile',
  async ({ id, workerData }, { rejectWithValue }) => {
    try {
      const data = await workerApi.updateProfile(id, workerData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update worker profile');
    }
  }
);

export const updateWorkerRatingThunk = createAsyncThunk(
  'worker/updateRating',
  async ({ id, rating }, { rejectWithValue }) => {
    try {
      const data = await workerApi.updateRating(id, rating);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update rating');
    }
  }
);

export const updateWorkerStatusThunk = createAsyncThunk(
  'worker/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const data = await workerApi.updateStatus(id, status);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update worker status');
    }
  }
);

export const searchWorkersThunk = createAsyncThunk(
  'worker/searchWorkers',
  async (filters, { rejectWithValue }) => {
    try {
      const data = await workerApi.searchWorkers(filters);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to search workers');
    }
  }
);

export const getAvailableWorkersThunk = createAsyncThunk(
  'worker/getAvailableWorkers',
  async (_, { rejectWithValue }) => {
    try {
      const data = await workerApi.getAvailableWorkers();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch available workers');
    }
  }
);

export const getAllWorkersThunk = createAsyncThunk(
  'worker/getAllWorkers',
  async (_, { rejectWithValue }) => {
    try {
      const data = await workerApi.getAllWorkers();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch all workers');
    }
  }
);

export const verifyWorkerThunk = createAsyncThunk(
  'worker/verifyWorker',
  async ({ id, verified }, { rejectWithValue }) => {
    try {
      const data = await workerApi.verifyWorker(id, verified);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to verify worker');
    }
  }
);

export const getCitiesThunk = createAsyncThunk(
  'worker/getCities',
  async (_, { rejectWithValue }) => {
    try {
      const data = await workerApi.getCities();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch cities');
    }
  }
);

export const createCityThunk = createAsyncThunk(
  'worker/createCity',
  async (name, { rejectWithValue }) => {
    try {
      const data = await workerApi.createCity(name);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create city');
    }
  }
);

export const deleteCityThunk = createAsyncThunk(
  'worker/deleteCity',
  async (id, { rejectWithValue }) => {
    try {
      await workerApi.deleteCity(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete city');
    }
  }
);

const initialState = {
  workers: [],
  currentWorker: null,
  availableWorkers: [],
  cities: [],
  loading: false,
  error: null,
};

const workerSlice = createSlice({
  name: 'worker',
  initialState,
  reducers: {
    clearCurrentWorker: (state) => {
      state.currentWorker = null;
    },
    clearWorkerError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fulfilled cases
      .addCase(createWorkerProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWorker = action.payload;
      })
      .addCase(getWorkerProfileByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWorker = action.payload;
      })
      .addCase(updateWorkerProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWorker = action.payload;
        state.workers = state.workers.map(w => w.id === action.payload.id ? action.payload : w);
      })
      .addCase(updateWorkerRatingThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentWorker && state.currentWorker.id === action.payload.id) {
          state.currentWorker = action.payload;
        }
        state.workers = state.workers.map(w => w.id === action.payload.id ? action.payload : w);
      })
      .addCase(updateWorkerStatusThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentWorker && state.currentWorker.id === action.payload.id) {
          state.currentWorker = action.payload;
        }
        state.workers = state.workers.map(w => w.id === action.payload.id ? action.payload : w);
      })
      .addCase(searchWorkersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.workers = action.payload;
      })
      .addCase(getAvailableWorkersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.availableWorkers = action.payload;
      })
      .addCase(getAllWorkersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.workers = action.payload;
      })
      .addCase(verifyWorkerThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        state.workers = state.workers.map(w => w.id === updated.id ? updated : w);
        if (state.currentWorker && state.currentWorker.id === updated.id) {
          state.currentWorker = updated;
        }
      })
      .addCase(getCitiesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.cities = action.payload;
      })
      .addCase(createCityThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.cities.push(action.payload);
      })
      .addCase(deleteCityThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.cities = state.cities.filter(c => c.id !== action.payload);
      })
      // Pending matcher
      .addMatcher(
        (action) => action.type.startsWith('worker/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      // Rejected matcher
      .addMatcher(
        (action) => action.type.startsWith('worker/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearCurrentWorker, clearWorkerError } = workerSlice.actions;
export default workerSlice.reducer;
