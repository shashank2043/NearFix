import React from 'react';
import Box from '@mui/material/Box';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Typography from '@mui/material/Typography';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';


const AvailabilityToggle = ({ status, onChange, disabled = false }) => {
  const handleAlignment = (event, newStatus) => {
    if (newStatus !== null && onChange) {
      onChange(newStatus);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="caption" color="text.secondary" fontWeight="700" sx={{ mb: 1, display: 'block', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        Live Duty Status
      </Typography>
      <ToggleButtonGroup
        value={status}
        exclusive
        onChange={handleAlignment}
        disabled={disabled}
        fullWidth
        size="small"
        sx={{
          bgcolor: 'background.default',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          p: 0.5,
          '& .MuiToggleButtonGroup-grouped': {
            border: 0,
            '&.Mui-disabled': {
              border: 0,
            },
            borderRadius: '8px !important',
          },
        }}
      >
        <ToggleButton
          value="AVAILABLE"
          sx={{
            py: 1,
            color: 'text.secondary',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            fontWeight: 700,
            fontSize: '0.8rem',
            transition: 'all 0.25s ease',
            '&.Mui-selected': {
              bgcolor: 'rgba(46, 125, 50, 0.15)',
              color: '#4caf50',
              fontWeight: 800,
              boxShadow: '0 2px 10px rgba(76, 175, 80, 0.15)',
              '&:hover': {
                bgcolor: 'rgba(46, 125, 50, 0.25)',
              }
            }
          }}
        >
          <CheckCircle2 size={14} />
          AVAILABLE
        </ToggleButton>

        <ToggleButton
          value="BUSY"
          sx={{
            py: 1,
            color: 'text.secondary',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            fontWeight: 700,
            fontSize: '0.8rem',
            transition: 'all 0.25s ease',
            '&.Mui-selected': {
              bgcolor: 'rgba(237, 108, 2, 0.15)',
              color: '#ff9800',
              fontWeight: 800,
              boxShadow: '0 2px 10px rgba(255, 152, 0, 0.15)',
              '&:hover': {
                bgcolor: 'rgba(237, 108, 2, 0.25)',
              }
            }
          }}
        >
          <AlertCircle size={14} />
          BUSY
        </ToggleButton>

        <ToggleButton
          value="OFFLINE"
          sx={{
            py: 1,
            color: 'text.secondary',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            fontWeight: 700,
            fontSize: '0.8rem',
            transition: 'all 0.25s ease',
            '&.Mui-selected': {
              bgcolor: 'rgba(211, 47, 47, 0.15)',
              color: '#ef5350',
              fontWeight: 800,
              boxShadow: '0 2px 10px rgba(239, 83, 80, 0.15)',
              '&:hover': {
                bgcolor: 'rgba(211, 47, 47, 0.25)',
              }
            }
          }}
        >
          <XCircle size={14} />
          OFFLINE
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default AvailabilityToggle;
