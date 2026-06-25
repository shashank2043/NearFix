import React, { createContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginThunk, getProfileThunk, logout as logoutAction, setUser as setUserAction, setLoading as setLoadingAction } from '../store/slices/authSlice';

export const AuthContext = createContext({
  user: null,
  accessToken: null,
  role: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  setUser: () => {}
});

export const AuthContextProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, accessToken, role, loading, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Set loading false since we don't fetch profile from local storage on refresh
    dispatch(setLoadingAction(false));
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
    <AuthContext.Provider value={{ user, accessToken, role, loading, isAuthenticated, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
