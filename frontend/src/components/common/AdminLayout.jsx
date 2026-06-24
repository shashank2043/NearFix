import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';


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
      
      <Sidebar mobileOpen={mobileOpen} onClose={handleDrawerClose} />

      
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

        
        <Box sx={{ flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
