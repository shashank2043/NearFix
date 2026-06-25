import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }

  const isAuthenticated = !!context.accessToken;
  const isCustomer = () => context.role === 'CUSTOMER';
  const isWorker = () => context.role === 'WORKER';
  const isAdmin = () => context.role === 'ADMIN';

  return {
    ...context,
    isAuthenticated,
    isCustomer,
    isWorker,
    isAdmin
  };
};
