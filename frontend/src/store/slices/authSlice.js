import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../api/authApi';

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await authApi.login(email, password);
      
      let profile = null;
      if (data && data.id) {
        try {
          profile = await authApi.getUserById(data.id, data.token);
        } catch (profileErr) {
          console.warn('Failed to fetch full user profile during login:', profileErr);
        }
      }
      return {
        accessToken: data.token,
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
  accessToken: null,
  role: null,
  isAuthenticated: false,
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
      state.accessToken = null;
      state.role = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      if (action.payload) {
        state.isAuthenticated = true;
        if (action.payload.role) {
          state.role = action.payload.role;
        }
      } else {
        state.isAuthenticated = false;
        state.role = null;
      }
    },
    setToken: (state, action) => {
      state.accessToken = action.payload;
      state.isAuthenticated = !!action.payload;
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
        state.accessToken = action.payload.accessToken;
        state.role = action.payload.role;
        state.user = action.payload.user;
        state.isAuthenticated = true;
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
        state.isAuthenticated = true;
      })
      .addCase(getProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.accessToken = null;
        state.role = null;
        state.isAuthenticated = false;
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
