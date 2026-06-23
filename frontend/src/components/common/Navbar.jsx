import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import { Sun, Moon, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

/**
 * Global Navigation Header component for NearFix.
 * Dynamically changes layouts based on theme modes and session presence.
 */
const Navbar = () => {
  const { user, token, logout, role } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (role === 'CUSTOMER') return '/customer/dashboard';
    if (role === 'WORKER') return '/worker/dashboard';
    if (role === 'ADMIN') return '/admin/dashboard';
    return '/';
  };

  return (
    <AppBar position="sticky">
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          {/* Logo Section */}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to={token ? getDashboardPath() : '/'}
            sx={{
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              fontWeight: 800,
              fontSize: '1.4rem',
              letterSpacing: '-0.02em',
              textDecoration: 'none',
              color: 'text.primary',
              '& span': {
                color: mode === 'light' ? 'secondary.main' : 'primary.main',
              },
            }}
          >
            Near<span>Fix</span>
          </Typography>

          {/* Action Section */}
          <Box display="flex" alignItems="center" sx={{ gap: 1.5 }}>
            {/* Theme Toggle Button */}
            <IconButton onClick={toggleTheme} color="inherit" size="small">
              {mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </IconButton>

            {token ? (
              // Authenticated View
              <Box>
                <Tooltip title="Account menu">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar
                      sx={{
                        bgcolor: mode === 'light' ? 'primary.main' : 'primary.main',
                        color: mode === 'light' ? '#FFFFFF' : '#0B192C',
                        fontWeight: 700,
                        width: 36,
                        height: 36,
                        fontSize: '0.9rem'
                      }}
                    >
                      {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                  PaperProps={{
                    sx: {
                      borderRadius: 3,
                      boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                      border: '1px solid',
                      borderColor: 'divider',
                      minWidth: 190,
                    },
                  }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight="700" color="text.primary">
                      {user?.fullName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {role}
                    </Typography>
                  </Box>
                  <Divider />
                  
                  <MenuItem 
                    onClick={() => { handleCloseUserMenu(); navigate(getDashboardPath()); }}
                    sx={{ gap: 1.5, py: 1 }}
                  >
                    <LayoutDashboard size={16} />
                    <Typography variant="body2">Dashboard</Typography>
                  </MenuItem>

                  <MenuItem 
                    onClick={handleLogout} 
                    sx={{ gap: 1.5, py: 1, color: 'error.main' }}
                  >
                    <LogOut size={16} />
                    <Typography variant="body2">Logout</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              // Unauthenticated View
              <Box display="flex" sx={{ gap: 1 }}>
                <Button component={Link} to="/login" variant="text" color="inherit">
                  Login
                </Button>
                <Button component={Link} to="/register" variant="contained" color="secondary">
                  Register
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
