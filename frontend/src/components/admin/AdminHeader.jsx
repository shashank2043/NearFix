import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';


const AdminHeader = ({ title, subtitle }) => {
  const theme = useTheme();

  return (
    <Box sx={{ mb: 2 }}>
      
      <Box 
        sx={{ 
          py: 4, 
          px: { xs: 2, md: 3 },
          borderRadius: 4,
          bgcolor: theme.palette.mode === 'light' ? '#0B192C' : '#0F1A30',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: theme.palette.mode === 'light' 
            ? '0 10px 30px rgba(11, 25, 44, 0.08)' 
            : '0 10px 30px rgba(0, 0, 0, 0.4)',
          border: `1px solid ${theme.palette.mode === 'light' ? '#050B14' : '#1E293B'}`,
        }}
      >
        
        <Box 
          sx={{ 
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 245, 212, 0.15) 0%, rgba(0, 245, 212, 0) 70%)',
            pointerEvents: 'none'
          }}
        />
        <Box 
          sx={{ 
            position: 'absolute',
            bottom: '-40%',
            left: '20%',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 180, 216, 0.1) 0%, rgba(0, 180, 216, 0) 70%)',
            pointerEvents: 'none'
          }}
        />

        <Typography 
          variant="caption" 
          fontWeight="800" 
          sx={{ 
            color: theme.palette.mode === 'light' ? 'secondary.main' : 'primary.main',
            textTransform: 'uppercase', 
            letterSpacing: '0.15em',
            display: 'block',
            mb: 1
          }}
        >
          Administrator Console
        </Typography>
        <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.02em', mb: 1 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ opacity: 0.7, maxWidth: 600 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default AdminHeader;
