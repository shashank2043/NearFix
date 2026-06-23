import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * Premium loading spinner component supporting inline and full-page overlay modes.
 */
const Loader = ({ fullPage, message = 'Loading NearFix...' }) => {
  const content = (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}
    >
      <CircularProgress color="primary" size={50} thickness={4} />
      {message && (
        <Typography variant="body1" color="text.secondary" fontWeight="500">
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullPage) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(7, 13, 25, 0.90)',
          zIndex: 9999,
          backdropFilter: 'blur(6px)',
        }}
      >
        {content}
      </Box>
    );
  }

  return (
    <Box sx={{ py: 6, display: 'flex', justifyContent: 'center', width: '100%' }}>
      {content}
    </Box>
  );
};

export default Loader;
