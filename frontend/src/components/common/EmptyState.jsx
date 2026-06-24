import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { HardDrive } from 'lucide-react';


const EmptyState = ({
  title = 'No Data Found',
  description,
  actionLabel,
  onAction,
  icon: Icon = HardDrive
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 3,
        textAlign: 'center',
        backgroundColor: 'background.paper',
        borderRadius: 4,
        border: '1px dashed',
        borderColor: 'divider',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      <Box sx={{ color: 'text.secondary', mb: 2, display: 'flex', alignItems: 'center' }}>
        <Icon size={48} strokeWidth={1.5} />
      </Box>
      <Typography variant="h6" fontWeight="700" color="text.primary" gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: actionLabel ? 3 : 0, maxWidth: 360 }}>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="contained" color="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
