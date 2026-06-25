import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../api/authApi';

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await authApi.login(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      
      let profile = null;
      if (data && data.id) {
        try {
          profile = await authApi.getUserById(data.id);
        } catch (profileErr) {
          console.warn('Failed to fetch full user profile during login:', profileErr);
        }
      }
      return {
        token: data.token,
        role: data.role,
        user: profile || { id: data.id, role: data.role }
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
    }
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const data = await authApi.register(userData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Registration failed');
    }
  }
);

export const getProfileThunk = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const profile = await authApi.getProfile();
      return profile;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch profile');
    }
  }
);

export const getUserByIdThunk = createAsyncThunk(
  'auth/getUserById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await authApi.getUserById(id);
      return { id, data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch user');
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  role: localStorage.getItem('role') || null,
  loading: false,
  error: null,
  usersCached: {}, // cache for getUserById results
  usersList: [], // list of all users for admin
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      state.user = null;
      state.token = null;
      state.role = null;
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.role = action.payload.role;
        state.user = action.payload.user;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Profile
      .addCase(getProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.role = action.payload.role;
      })
      .addCase(getProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.token = null;
        state.role = null;
        localStorage.removeItem('token');
        localStorage.removeItem('role');
      })
      // Get User By Id
      .addCase(getUserByIdThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(getUserByIdThunk.fulfilled, (state, action) => {
        const { id, data } = action.payload;
        if (!id) {
          state.usersList = Array.isArray(data) ? data : [data];
          // If id is empty, it returns list of all users
          if (Array.isArray(data)) {
            data.forEach(u => {
              state.usersCached[u.id] = u;
            });
          }
        } else {
          state.usersCached[id] = data;
        }
      })
      .addCase(getUserByIdThunk.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { logout, setUser, setToken, setRole, setLoading } = authSlice.actions;
export default authSlice.reducer;
