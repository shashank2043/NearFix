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
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import { Sun, Moon, LogOut, LayoutDashboard, Menu as MenuIcon, X, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';


const Navbar = () => {
  const { user, token, logout, role, isAuthenticated } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleDrawerToggle = () => {
    setMobileDrawerOpen((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
    setMobileDrawerOpen(false);
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (role === 'CUSTOMER') return '/customer/dashboard';
    if (role === 'WORKER') return '/worker/dashboard';
    if (role === 'ADMIN') return '/admin/dashboard';
    return '/';
  };

  const handleNavClick = (path) => {
    setMobileDrawerOpen(false);
    navigate(path);
  };

  
  const mobileDrawerContent = (
    <Box sx={{ width: 260, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight="800" color="text.primary">
          Near<span>Fix</span>
        </Typography>
        <IconButton onClick={handleDrawerToggle}>
          <X size={20} />
        </IconButton>
      </Box>

      {isAuthenticated ? (
        <Box sx={{ p: 2, bgcolor: 'background.default' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 'bold', width: 40, height: 40 }}>
              {user?.fullName?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight="800" color="text.primary">
                {user?.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {role} Profile
              </Typography>
            </Box>
          </Box>
        </Box>
      ) : null}

      <List sx={{ px: 2, flexGrow: 1 }}>
        {isAuthenticated ? (
          <>
            <ListItemButton onClick={() => handleNavClick(getDashboardPath())} sx={{ borderRadius: 2, mb: 1 }}>
              <ListItemIcon><LayoutDashboard size={18} /></ListItemIcon>
              <ListItemText primary={<Typography variant="body2" sx={{ fontWeight: 700 }}>Dashboard</Typography>} />
            </ListItemButton>
            
            <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, mb: 1, color: 'error.main' }}>
              <ListItemIcon><LogOut size={18} className="text-error" /></ListItemIcon>
              <ListItemText primary={<Typography variant="body2" sx={{ fontWeight: 700 }}>Logout</Typography>} />
            </ListItemButton>
          </>
        ) : (
          <>
            <ListItemButton onClick={() => handleNavClick('/login')} sx={{ borderRadius: 2, mb: 1 }}>
              <ListItemIcon><LogIn size={18} /></ListItemIcon>
              <ListItemText primary={<Typography variant="body2" sx={{ fontWeight: 700 }}>Login</Typography>} />
            </ListItemButton>

            <ListItemButton onClick={() => handleNavClick('/register')} sx={{ borderRadius: 2, mb: 1 }}>
              <ListItemIcon><UserPlus size={18} /></ListItemIcon>
              <ListItemText primary={<Typography variant="body2" sx={{ fontWeight: 700 }}>Register</Typography>} />
            </ListItemButton>
          </>
        )}
      </List>

      <Divider />
      
      <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'center' }}>
        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          startIcon={mode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          onClick={toggleTheme}
          sx={{ fontWeight: 'bold' }}
        >
          {mode === 'light' ? 'Dark Theme' : 'Light Theme'}
        </Button>
      </Box>
    </Box>
  );

  return (
    <AppBar position="sticky">
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          
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

          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'nowrap' }}>
            
            <IconButton onClick={toggleTheme} color="inherit" size="small">
              {mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </IconButton>

            {isAuthenticated ? (
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="Account menu">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
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
                  slotProps={{
                    paper: {
                      sx: {
                        borderRadius: 3,
                        boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                        border: '1px solid',
                        borderColor: 'divider',
                        minWidth: 190,
                      },
                    }
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
              
              <>
                
                <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                  <Button component={Link} to="/login" variant="text" color="inherit">
                    Login
                  </Button>
                  <Button component={Link} to="/register" variant="contained" color="secondary">
                    Register
                  </Button>
                </Box>
                
                
                <IconButton
                  color="inherit"
                  aria-label="open navigation menu"
                  onClick={handleDrawerToggle}
                  sx={{ display: { xs: 'inline-flex', md: 'none' } }}
                >
                  <MenuIcon size={24} />
                </IconButton>
              </>
            )}

            
            {isAuthenticated && (
              <IconButton
                color="inherit"
                aria-label="open navigation menu"
                onClick={handleDrawerToggle}
                sx={{ display: { xs: 'inline-flex', sm: 'none' }, ml: 0.5 }}
              >
                <MenuIcon size={24} />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </Container>

      
      <Drawer
        anchor="right"
        open={mobileDrawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 260, borderLeft: '1px solid', borderColor: 'divider' },
        }}
      >
        {mobileDrawerContent}
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
