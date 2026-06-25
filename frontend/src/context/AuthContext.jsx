import React, { createContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginThunk, getProfileThunk, logout as logoutAction, setUser as setUserAction, setLoading as setLoadingAction } from '../store/slices/authSlice';

export const AuthContext = createContext({
  user: null,
  token: null,
  role: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  setUser: () => {}
});

export const AuthContextProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, token, role, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedRole = localStorage.getItem('role');
      
      if (storedToken && storedRole) {
        try {
          await dispatch(getProfileThunk()).unwrap();
        } catch (error) {
          console.error('Failed to initialize session:', error);
          dispatch(logoutAction());
        }
      } else {
        // Set loading false using redux action since we don't fetch profile
        dispatch(setLoadingAction(false));
      }
    };

    initializeAuth();
  }, [dispatch]);

  
  const login = async (email, password) => {
    try {
      const result = await dispatch(loginThunk({ email, password })).unwrap();
      return result.user;
    } catch (error) {
      console.error('Login process error:', error);
      throw error;
    }
  };

  
  const logout = () => {
    dispatch(logoutAction());
  };

  const setUser = (userVal) => {
    dispatch(setUserAction(userVal));
  };

  return (
    <AuthContext.Provider value={{ user, token, role, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
