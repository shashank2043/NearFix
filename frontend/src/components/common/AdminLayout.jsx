import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

/**
 * AdminLayout Component
 * Wraps all administration console sub-pages (Dashboard, Verifications, Analytics, Complaints).
 * Sets up a flexible multi-column grid layout rendering the collapsible Sidebar on the left
 * and the router Outlet main viewport on the right, providing responsive triggers for small screen sizes.
 */
const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleDrawerClose = () => {
    setMobileOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)', width: '100%' }}>
      {/* Collapsible Admin Sidebar */}
      <Sidebar mobileOpen={mobileOpen} onClose={handleDrawerClose} />

      {/* Main Administrative Viewport */}
      <Box 
        component="div" 
        sx={{ 
          flexGrow: 1, 
          width: { xs: '100%', md: 'calc(100% - 240px)' }, 
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default'
        }}
      >
        {/* Mobile Header Bar (Only visible on viewport widths under 'md') */}
        <Box 
          sx={{ 
            display: { xs: 'flex', md: 'none' }, 
            p: 1.5, 
            px: 2,
            alignItems: 'center',
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <IconButton
            color="inherit"
            aria-label="toggle navigation drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 1 }}
          >
            <Menu size={20} />
          </IconButton>
          <Typography variant="body2" fontWeight="800" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}>
            Admin Menu
          </Typography>
        </Box>

        {/* Dynamic Nested Page Content Container */}
        <Box sx={{ flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
