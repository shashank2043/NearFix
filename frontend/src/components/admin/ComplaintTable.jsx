import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Rating from '@mui/material/Rating';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import { ShieldAlert, AlertOctagon } from 'lucide-react';
import { useTheme } from '@mui/material/styles';

/**
 * ComplaintTable component displaying completed bookings with low reviews (<= 2 stars).
 * 
 * @param {Object} props
 * @param {Array<Object>} props.bookings - The bookings data with status COMPLETED (or WORK_COMPLETED/PAID)
 * @param {Array<Object>} props.users - System users list to resolve names
 * @param {Array<Object>} props.workers - Workers details list to check if they are flagged
 * @param {Function} props.onFlagWorker - Callback to flag a worker by their ID
 */
const ComplaintTable = ({ bookings, users, workers, onFlagWorker }) => {
  const theme = useTheme();

  // Helper to find username by id
  const getUserName = (id) => {
    const u = users.find((user) => user.id === id);
    return u ? u.fullName : `User #${id}`;
  };

  // Helper to find worker flag status
  const isWorkerFlagged = (workerId) => {
    const w = workers.find((wrk) => wrk.id === workerId);
    return w ? !!w.flagged : false;
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
      <Table sx={{ minWidth: 650 }} aria-label="complaint table">
        <TableHead sx={{ bgcolor: theme.palette.mode === 'light' ? '#F8FAFC' : '#070D19' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 800 }}>Booking ID</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>Customer</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>Worker</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>Service</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>Rating</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>Comment</TableCell>
            <TableCell sx={{ fontWeight: 800 }} align="center">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookings.map((booking) => {
            const customerName = getUserName(booking.customerId);
            const workerName = getUserName(booking.workerId);
            const flagged = isWorkerFlagged(booking.workerId);

            return (
              <TableRow 
                key={booking.id}
                sx={{ 
                  '&:last-child td, &:last-child th': { border: 0 },
                  '&:hover': { bgcolor: theme.palette.mode === 'light' ? 'rgba(0, 180, 216, 0.02)' : 'rgba(0, 245, 212, 0.02)' }
                }}
              >
                {/* Booking ID */}
                <TableCell component="th" scope="row">
                  <Typography variant="body2" fontWeight="700">
                    #{booking.id}
                  </Typography>
                </TableCell>
                
                {/* Customer */}
                <TableCell>
                  <Box display="flex" alignItems="center" sx={{ gap: 1.5 }}>
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        fontSize: '0.85rem', 
                        bgcolor: 'rgba(99, 102, 241, 0.1)', 
                        color: theme.palette.mode === 'light' ? 'primary.main' : '#4C51BF' 
                      }}
                    >
                      {customerName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="600">
                        {customerName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {booking.customerId}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                
                {/* Worker */}
                <TableCell>
                  <Box display="flex" alignItems="center" sx={{ gap: 1.5 }}>
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        fontSize: '0.85rem', 
                        bgcolor: 'rgba(0, 180, 216, 0.1)', 
                        color: 'secondary.main' 
                      }}
                    >
                      {workerName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="600">
                        {workerName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {booking.workerId}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                
                {/* Service Type */}
                <TableCell>
                  <Chip 
                    label={booking.serviceType} 
                    size="small" 
                    sx={{ 
                      borderRadius: '6px',
                      fontWeight: 600,
                      bgcolor: theme.palette.mode === 'light' ? 'rgba(11, 25, 44, 0.05)' : 'rgba(255, 255, 255, 0.05)'
                    }} 
                  />
                </TableCell>
                
                {/* Rating */}
                <TableCell>
                  <Box display="flex" alignItems="center" sx={{ gap: 0.5 }}>
                    <Rating 
                      value={Number(booking.rating || 0)} 
                      readOnly 
                      size="small" 
                      max={5}
                      sx={{ color: '#EF4444' }} 
                    />
                    <Typography variant="caption" fontWeight="700" color="error.main">
                      ({booking.rating})
                    </Typography>
                  </Box>
                </TableCell>
                
                {/* Comment */}
                <TableCell sx={{ maxWidth: 220 }}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      display: '-webkit-box', 
                      WebkitLineClamp: 2, 
                      WebkitBoxOrient: 'vertical',
                      lineHeight: 1.3
                    }}
                  >
                    {booking.comment || 'No comments registered.'}
                  </Typography>
                </TableCell>
                
                {/* Action: Flag Worker */}
                <TableCell align="center">
                  {flagged ? (
                    <Chip 
                      icon={<AlertOctagon size={14} />} 
                      label="Flagged Worker" 
                      color="error" 
                      size="small" 
                      sx={{ fontWeight: 700 }}
                    />
                  ) : (
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      startIcon={<ShieldAlert size={14} />}
                      onClick={() => onFlagWorker(booking.workerId)}
                      sx={{ 
                        borderRadius: '6px', 
                        py: 0.5, 
                        px: 1.5,
                        fontSize: '0.75rem',
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: '#DC2626',
                          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                        }
                      }}
                    >
                      Flag Worker
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ComplaintTable;
