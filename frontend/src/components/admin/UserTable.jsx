import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import { Calendar, Phone, Mail } from 'lucide-react';
import { useTheme } from '@mui/material/styles';

/**
 * UserTable component showing list of users and system personnel with role badges and creation dates.
 * 
 * @param {Object} props
 * @param {Array<Object>} props.users - System users list
 */
const UserTable = ({ users }) => {
  const theme = useTheme();

  // Role style selector
  const getRoleStyle = (role) => {
    switch (role) {
      case 'ADMIN':
        return {
          label: 'Admin',
          color: 'error',
          variant: 'contained',
        };
      case 'WORKER':
        return {
          label: 'Worker',
          color: 'secondary',
          variant: 'outlined',
        };
      case 'CUSTOMER':
      default:
        return {
          label: 'Customer',
          color: 'primary',
          variant: 'outlined',
        };
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        boxShadow: 'none', 
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 3,
        overflow: 'hidden'
      }}
    >
      <Table sx={{ minWidth: 650 }} aria-label="user registry table">
        <TableHead sx={{ bgcolor: theme.palette.mode === 'light' ? '#F8FAFC' : '#070D19' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 800 }}>User ID</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>Name & Profile</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>Contact Info</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>System Role</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>Joined Date</TableCell>
            <TableCell sx={{ fontWeight: 800 }} align="center">Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => {
            const roleStyle = getRoleStyle(user.role);
            
            return (
              <TableRow 
                key={user.id}
                sx={{ 
                  '&:last-child td, &:last-child th': { border: 0 },
                  '&:hover': { bgcolor: theme.palette.mode === 'light' ? 'rgba(0, 180, 216, 0.02)' : 'rgba(0, 245, 212, 0.02)' }
                }}
              >
                {/* ID */}
                <TableCell component="th" scope="row">
                  <Typography variant="body2" fontWeight="700">
                    #{user.id}
                  </Typography>
                </TableCell>

                {/* Name and avatar */}
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar 
                      sx={{ 
                        width: 38, 
                        height: 38, 
                        fontSize: '0.95rem',
                        fontWeight: '700',
                        bgcolor: user.role === 'ADMIN' 
                          ? 'error.main' 
                          : user.role === 'WORKER' 
                          ? 'secondary.main' 
                          : 'primary.main',
                        color: user.role === 'WORKER' && theme.palette.mode === 'dark' ? '#0B192C' : '#FFFFFF'
                      }}
                    >
                      {user.fullName?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="700">
                        {user.fullName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.role} Account
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                {/* Contact Info */}
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                      <Mail size={12} />
                      <Typography variant="caption" sx={{ textDecoration: 'none' }}>
                        {user.email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                      <Phone size={12} />
                      <Typography variant="caption">
                        {user.phone}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                {/* Role Chip */}
                <TableCell>
                  <Chip 
                    label={roleStyle.label} 
                    color={roleStyle.color} 
                    size="small" 
                    variant={roleStyle.variant === 'outlined' ? 'outlined' : 'filled'}
                    sx={{ 
                      fontWeight: 700, 
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      px: 0.5
                    }} 
                  />
                </TableCell>

                {/* Joined Date */}
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                    <Calendar size={14} />
                    <Typography variant="body2">
                      {formatDate(user.createdAt)}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Status indicator */}
                <TableCell align="center">
                  <Chip 
                    label={user.active !== false ? "Active" : "Disabled"} 
                    color={user.active !== false ? "success" : "default"} 
                    size="small" 
                    sx={{ 
                      fontWeight: 700, 
                      borderRadius: '20px',
                      height: 20,
                      fontSize: '0.7rem'
                    }} 
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserTable;
