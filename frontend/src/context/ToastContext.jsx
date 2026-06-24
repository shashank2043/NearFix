import React, { createContext, useState, useContext } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const ToastContext = createContext({
  showToast: (message, severity) => {}
});


export const ToastContextProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info');

  
  const showToast = (msg, sev = 'info') => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ mb: 2, mr: 2 }}
      >
        <Alert 
          onClose={handleClose} 
          severity={severity} 
          variant="filled"
          sx={{ 
            width: '100%', 
            borderRadius: 3,
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            fontWeight: 600,
            fontSize: '0.85rem'
          }}
        >
          {message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};


export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastContextProvider');
  }
  return context;
};
