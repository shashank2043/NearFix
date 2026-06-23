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
          // Retrieve fresh profile info based on current token
          const profile = await authApi.getProfile();
          setUser(profile);
          setToken(storedToken);
          setRole(storedRole);
        } catch (error) {
          console.error('Failed to initialize session:', error);
          // Auto-clear invalid local storage data
          localStorage.removeItem('token');
          localStorage.removeItem('role');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Log user in and save credential session.
   * @param {string} email
   * @param {string} password
   */
  const login = async (email, password) => {
    try {
      const data = await authApi.login(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      
      // Fetch full profile info to seed state
      const profile = await authApi.getUserById(data.id);
      setUser(profile);
      setToken(data.token);
      setRole(data.role);
      return profile;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Clears authentication states and terminates session.
   */
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
