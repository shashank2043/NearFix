import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import { LayoutDashboard, UserCheck, BarChart3, AlertOctagon } from 'lucide-react';
import { useTheme } from '@mui/material/styles';

/**
 * Reusable AdminHeader component that displays the workspace title and provides sub-navigation.
 * 
 * @param {Object} props
 * @param {string} props.title - Title of the active sub-page
 * @param {string} [props.subtitle] - Optional subtitle text
 */
const AdminHeader = ({ title, subtitle }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Map paths to tab values
  const paths = [
    '/admin/dashboard',
    '/admin/verifications',
    '/admin/analytics',
    '/admin/complaints'
  ];

  const currentTab = paths.indexOf(location.pathname);
  const tabValue = currentTab !== -1 ? currentTab : 0;

  const handleTabChange = (event, newValue) => {
    navigate(paths[newValue]);
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* Header section with styling */}
      <Box 
        sx={{ 
          py: 4, 
          px: { xs: 2, md: 3 },
          borderRadius: 4,
          bgcolor: theme.palette.mode === 'light' ? '#0B192C' : '#0F1A30',
          color: '#FFFFFF',
          mb: 3,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: theme.palette.mode === 'light' 
            ? '0 10px 30px rgba(11, 25, 44, 0.08)' 
            : '0 10px 30px rgba(0, 0, 0, 0.4)',
          border: `1px solid ${theme.palette.mode === 'light' ? '#050B14' : '#1E293B'}`,
        }}
      >
        {/* Dynamic Glowing Teal Background shapes */}
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

      {/* Navigation Sub-bar */}
      <Paper 
        sx={{ 
          borderRadius: 3, 
          boxShadow: 'none', 
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden'
        }}
      >
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="secondary"
          textColor="secondary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            px: 2,
            '& .MuiTab-root': {
              minHeight: 56,
              fontWeight: 700,
              fontSize: '0.875rem',
              gap: 1,
              textTransform: 'none'
            }
          }}
        >
          <Tab icon={<LayoutDashboard size={18} />} iconPosition="start" label="Dashboard" />
          <Tab icon={<UserCheck size={18} />} iconPosition="start" label="Worker Verifications" />
          <Tab icon={<BarChart3 size={18} />} iconPosition="start" label="System Analytics" />
          <Tab icon={<AlertOctagon size={18} />} iconPosition="start" label="Complaints Desk" />
        </Tabs>
      </Paper>
    </Box>
  );
};

export default AdminHeader;
