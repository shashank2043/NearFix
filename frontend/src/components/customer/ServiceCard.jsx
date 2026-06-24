import React from 'react';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

/**
 * Reusable Service Type Card.
 * @param {Object} props
 * @param {React.ComponentType} props.icon - Lucide icon component
 * @param {string} props.name - Service name
 * @param {string} props.description - Brief description
 * @param {function} props.onClick - Click handler
 */
const ServiceCard = ({ icon: Icon, name, description, onClick }) => {
  const theme = useTheme();

  return (
    <Card 
      sx={{ 
        height: '100%', 
        transition: 'all 0.3s ease',
        '&:hover': { 
          transform: 'translateY(-4px)', 
          borderColor: 'secondary.main', 
          boxShadow: theme.palette.mode === 'light' 
            ? '0 8px 24px rgba(11, 25, 44, 0.08)' 
            : '0 8px 24px rgba(0, 245, 212, 0.15)'
        } 
      }}
    >
      <CardActionArea onClick={onClick} sx={{ height: '100%', p: 3 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            textAlign: 'center', 
            gap: 2 
          }}
        >
          {Icon && (
            <Box 
              sx={{ 
                p: 2, 
                borderRadius: '50%', 
                bgcolor: theme.palette.mode === 'light' 
                  ? 'rgba(0, 180, 216, 0.1)' 
                  : 'rgba(0, 245, 212, 0.1)', 
                color: theme.palette.mode === 'light' ? 'secondary.main' : 'primary.main',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}
            >
              <Icon size={32} strokeWidth={2} />
            </Box>
          )}
          <Typography variant="h6" fontWeight="700" color="text.primary">
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
            {description}
          </Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
};

export default ServiceCard;
