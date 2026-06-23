import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useTheme } from '@mui/material/styles';

/**
 * StatsCard component for displaying administrative metrics.
 * @param {Object} props
 * @param {React.Component} props.icon - Lucide React Icon component
 * @param {string} props.label - Metric name/description
 * @param {string|number} props.value - Metric value
 * @param {number|string} [props.trend] - Percentage change (positive/negative)
 * @param {boolean} [props.isPositive=true] - Determine trend direction and color
 */
const StatsCard = ({ icon: Icon, label, value, trend, isPositive = true }) => {
  const theme = useTheme();
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        position: 'relative', 
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.palette.mode === 'light' 
            ? '0 12px 28px rgba(11, 25, 44, 0.08)' 
            : '0 12px 28px rgba(0, 0, 0, 0.4)',
          borderColor: theme.palette.primary.main,
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Box 
            sx={{ 
              p: 1.5, 
              borderRadius: 2.5, 
              bgcolor: theme.palette.mode === 'light' 
                ? 'rgba(11, 25, 44, 0.04)' 
                : 'rgba(0, 245, 212, 0.08)', 
              color: theme.palette.mode === 'light' 
                ? 'primary.main' 
                : 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(11, 25, 44, 0.08)' : 'rgba(0, 245, 212, 0.15)'}`
            }}
          >
            {Icon && <Icon size={24} />}
          </Box>
          
          {trend !== undefined && (
            <Box 
              display="flex" 
              alignItems="center" 
              sx={{ 
                px: 1.5, 
                py: 0.5, 
                borderRadius: '20px', 
                bgcolor: isPositive 
                  ? 'rgba(74, 222, 128, 0.1)' 
                  : 'rgba(239, 68, 68, 0.1)', 
                color: isPositive 
                  ? '#4ADE80' 
                  : '#EF4444',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: `1px solid ${isPositive ? 'rgba(74, 222, 128, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
              }}
            >
              {isPositive ? <ArrowUpRight size={14} style={{ marginRight: 2 }} /> : <ArrowDownRight size={14} style={{ marginRight: 2 }} />}
              {typeof trend === 'number' ? `${isPositive ? '+' : ''}${trend}%` : trend}
            </Box>
          )}
        </Box>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          fontWeight="500" 
          sx={{ mb: 0.5, letterSpacing: '0.02em', textTransform: 'uppercase', fontSize: '0.75rem' }}
        >
          {label}
        </Typography>
        
        <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.02em' }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
