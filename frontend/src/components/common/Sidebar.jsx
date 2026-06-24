import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import { LayoutDashboard, UserCheck, BarChart3, AlertOctagon, ShieldAlert } from 'lucide-react';

const DRAWER_WIDTH = 240;


const Sidebar = ({ mobileOpen, onClose }) => {
  const theme = useTheme();
  const location = useLocation();
  const isDark = theme.palette.mode === 'dark';

  const menuItems = [
    { text: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { text: 'Worker Verification', path: '/admin/verifications', icon: <UserCheck size={20} /> },
    { text: 'Analytics', path: '/admin/analytics', icon: <BarChart3 size={20} /> },
    { text: 'Complaints', path: '/admin/complaints', icon: <AlertOctagon size={20} /> },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ p: 1, borderRadius: 2, bgcolor: isDark ? 'primary.main' : 'primary.dark', color: isDark ? 'primary.contrastText' : '#FFFFFF' }}>
          <ShieldAlert size={20} />
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight="800" color="text.primary" sx={{ lineHeight: 1.2 }}>
            Operations
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight="700">
            SYSTEM CONTROL
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      
      <List component="nav" sx={{ px: 2, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.text}
              component={Link}
              to={item.path}
              onClick={onClose}
              sx={{
                borderRadius: 2.5,
                mb: 1,
                py: 1.2,
                px: 2,
                transition: 'all 0.25s ease',
                bgcolor: isActive
                  ? isDark
                    ? 'rgba(0, 245, 212, 0.08)'
                    : 'rgba(11, 25, 44, 0.04)'
                  : 'transparent',
                color: isActive
                  ? isDark
                    ? 'primary.main'
                    : 'primary.main'
                  : 'text.secondary',
                borderLeft: isActive ? '3px solid' : '0px solid',
                borderColor: 'primary.main',
                '&:hover': {
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
                  color: 'text.primary',
                },
                '& .MuiListItemIcon-root': {
                  color: isActive
                    ? isDark
                      ? 'primary.main'
                      : 'primary.main'
                    : 'text.secondary',
                  minWidth: 36,
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: isActive ? 800 : 600,
                      fontSize: '0.875rem',
                    }}
                  >
                    {item.text}
                  </Typography>
                }
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider />
      
      
      <Box sx={{ p: 2.5, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary" fontWeight="500">
          NearFix Administrator
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '0.65rem', mt: 0.5 }}>
          v1.0.4 • © 2026
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }} 
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            bgcolor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
            backgroundImage: 'none',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          position: 'sticky',
          top: '64px',
          height: 'calc(100vh - 64px)',
          borderRight: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        {drawerContent}
      </Box>
    </>
  );
};

export default Sidebar;
export { DRAWER_WIDTH };
