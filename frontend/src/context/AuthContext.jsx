import React, { createContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

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
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedRole = localStorage.getItem('role');
      
      if (storedToken && storedRole) {
        try {
          
          const profile = await authApi.getProfile();
          setUser(profile);
          setToken(storedToken);
          setRole(storedRole);
        } catch (error) {
          console.error('Failed to initialize session:', error);
          
          localStorage.removeItem('token');
          localStorage.removeItem('role');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  
  const login = async (email, password) => {
    try {
      const data = await authApi.login(email, password);
      // console.log('Login API Response:', data);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      
      
      let profile = null;
      if (data && data.id) {
        try {
          profile = await authApi.getUserById(data.id);
          // console.log('Fetched Profile Details:', profile);
        } catch (profileErr) {
          console.warn('Failed to fetch full user profile during login:', profileErr);
        }
      }
      
      const resolvedUser = profile || { id: data.id, role: data.role };
      setUser(resolvedUser);
      setToken(data.token);
      setRole(data.role);
      return resolvedUser;
    } catch (error) {
      console.error('Login process error:', error);
      throw error;
    }
  };

  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
    setToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, role, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
