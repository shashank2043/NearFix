import React, { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Rating from '@mui/material/Rating';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { Award, ShieldCheck, MapPin, HardDrive } from 'lucide-react';

import { useDispatch, useSelector } from 'react-redux';
import { getUserByIdThunk } from '../../store/slices/authSlice';
import { getAllWorkersThunk } from '../../store/slices/workerSlice';
import { getAllBookingsThunk } from '../../store/slices/bookingSlice';
import { getAllPaymentsThunk } from '../../store/slices/paymentSlice';
import AdminHeader from '../../components/admin/AdminHeader';
import AnalyticsChart from '../../components/admin/AnalyticsChart';
import Loader from '../../components/common/Loader';
import { useTheme } from '@mui/material/styles';

const AnalyticsPage = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const users = useSelector((state) => state.auth.usersList);
  const workers = useSelector((state) => state.worker.workers);
  const bookings = useSelector((state) => state.booking.bookings);
  const payments = useSelector((state) => state.payment.payments);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      await dispatch(getAllBookingsThunk()).unwrap();
      await dispatch(getAllWorkersThunk()).unwrap();
      await dispatch(getAllPaymentsThunk()).unwrap();
      await dispatch(getUserByIdThunk('')).unwrap();
    } catch (err) {
      console.error(err);
      setError('Could not fetch metrics required for system analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  
  const getRevenueByServiceType = () => {
    const revenueMap = {};
    const completedPayments = payments.filter(p => p.status === 'COMPLETED' || p.status === 'SUCCESS');

    completedPayments.forEach(p => {
      const b = bookings.find(booking => booking.id === p.bookingId);
      if (b && b.serviceType) {
        revenueMap[b.serviceType] = (revenueMap[b.serviceType] || 0) + Number(p.amount || 0);
      }
    });

    const dataset = Object.keys(revenueMap).map(service => ({
      name: service,
      value: revenueMap[service],
    }));

    
    if (dataset.length === 0) {
      return [
        { name: 'Electrician', value: 0 },
        { name: 'Plumber', value: 0 },
        { name: 'Carpenter', value: 0 },
        { name: 'AC Mechanic', value: 0 }
      ];
    }
    return dataset;
  };

  const revenueByServiceData = getRevenueByServiceType();

  
  const getBookingsPerDay = () => {
    const chartData = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - i);

      const dateStr = targetDate.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      });

      const dayBookingsCount = bookings.filter(b => {
        if (!b.createdAt) return false;
        const bDate = new Date(b.createdAt);
        return bDate.toDateString() === targetDate.toDateString();
      }).length;

      chartData.push({
        date: dateStr,
        Bookings: dayBookingsCount,
      });
    }
    return chartData;
  };

  const bookingsPerDayData = getBookingsPerDay();

  
  const getTopWorkers = () => {
    return [...workers]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5)
      .map(worker => {
        const u = users.find(user => user.id === worker.id) || {};
        const completedJobsCount = bookings.filter(
          b => b.workerId === worker.id && (b.status === 'WORK_COMPLETED' || b.status === 'PAID')
        ).length;
        
        return {
          ...worker,
          fullName: u.fullName || 'Unregistered Worker',
          email: u.email || 'N/A',
          completedJobs: completedJobsCount,
        };
      });
  };

  const topWorkers = getTopWorkers();

  
  const busiestLocations = [
    { rank: 1, neighborhood: 'Green Glen Layout, Bangalore', requestCount: 48, topService: 'Electrician' },
    { rank: 2, neighborhood: 'HSR Layout, Bangalore', requestCount: 39, topService: 'Plumber' },
    { rank: 3, neighborhood: 'Andheri West, Mumbai', requestCount: 31, topService: 'Plumber' },
    { rank: 4, neighborhood: 'Connaught Place, Delhi', requestCount: 24, topService: 'Carpenter' },
    { rank: 5, neighborhood: 'Sector 62, Noida', requestCount: 19, topService: 'Electrician' }
  ];

  if (loading) {
    return <Loader message="Compiling analytical databases..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      
      <AdminHeader 
        title="Performance Analytics" 
        subtitle="Deconstruct platform performance: revenues per category, booking frequency, top emergency workers, and active service zones."
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <AnalyticsChart 
            title="Total Revenue by Service Type"
            type="pie"
            data={revenueByServiceData}
            xAxisKey="name"
            dataKey="value"
            height={320}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <AnalyticsChart 
            title="Bookings Dispatched Per Day"
            type="bar"
            data={bookingsPerDayData}
            xAxisKey="date"
            dataKey="Bookings"
            colors={[theme.palette.secondary.main]}
            height={320}
          />
        </Grid>
      </Grid>

      
      <Grid container spacing={3}>
        
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Award size={20} color="#00B4D8" /> Top 5 Star Workers
              </Typography>

              {topWorkers.length === 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                  <HardDrive size={36} color="text.secondary" />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                    No workers currently verified in the system.
                  </Typography>
                </Box>
              ) : (
                <TableContainer 
                  component={Paper} 
                  sx={{ 
                    boxShadow: 'none', 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 3,
                    overflow: 'hidden'
                  }}
                >
                  <Table size="small">
                    <TableHead sx={{ bgcolor: theme.palette.mode === 'light' ? '#F8FAFC' : '#070D19' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800 }}>Worker</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Specialty</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Completed Jobs</TableCell>
                        <TableCell sx={{ fontWeight: 800 }} align="right">Rating</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topWorkers.map((worker) => (
                        <TableRow 
                          key={worker.id}
                          sx={{ 
                            '&:last-child td, &:last-child th': { border: 0 },
                            '&:hover': { bgcolor: theme.palette.mode === 'light' ? 'rgba(0, 180, 216, 0.02)' : 'rgba(0, 245, 212, 0.02)' }
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar 
                                sx={{ 
                                  width: 30, 
                                  height: 30, 
                                  fontSize: '0.8rem',
                                  bgcolor: 'rgba(0, 180, 216, 0.1)', 
                                  color: 'secondary.main',
                                  fontWeight: 700 
                                }}
                              >
                                {worker.fullName.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight="700">
                                  {worker.fullName}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={worker.skill} 
                              size="small" 
                              sx={{ 
                                borderRadius: '4px', 
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                height: 20
                              }} 
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{worker.completedJobs} calls</TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                              <Rating value={worker.rating} precision={0.1} readOnly size="small" max={1} />
                              <Typography variant="body2" fontWeight="800">
                                {worker.rating?.toFixed(1) || '0.0'}
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MapPin size={20} color="#00B4D8" /> Emergency Hot Zones
              </Typography>

              <TableContainer 
                component={Paper} 
                sx={{ 
                  boxShadow: 'none', 
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 3,
                  overflow: 'hidden'
                }}
              >
                <Table size="small">
                  <TableHead sx={{ bgcolor: theme.palette.mode === 'light' ? '#F8FAFC' : '#070D19' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, width: 50 }}>Rank</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Zone / Area</TableCell>
                      <TableCell sx={{ fontWeight: 800 }} align="right">Requests</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {busiestLocations.map((location) => (
                      <TableRow 
                        key={location.rank}
                        sx={{ 
                          '&:last-child td, &:last-child th': { border: 0 },
                          '&:hover': { bgcolor: theme.palette.mode === 'light' ? 'rgba(0, 180, 216, 0.02)' : 'rgba(0, 245, 212, 0.02)' }
                        }}
                      >
                        <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>
                          #{location.rank}
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="700">
                              {location.neighborhood.split(',')[0]}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {location.neighborhood.split(',')[1]} | Peak: {location.topService}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: 'secondary.main' }}>
                          {location.requestCount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AnalyticsPage;
