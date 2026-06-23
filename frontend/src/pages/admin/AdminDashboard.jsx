import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import { Users, ShieldCheck, HardDrive, IndianRupee, ArrowRight, UserPlus } from 'lucide-react';

import { authApi } from '../../api/authApi';
import { workerApi } from '../../api/workerApi';
import { bookingApi } from '../../api/bookingApi';
import { paymentApi } from '../../api/paymentApi';
import { formatCurrency } from '../../utils/helpers';
import AdminHeader from '../../components/admin/AdminHeader';
import StatsCard from '../../components/admin/StatsCard';
import AnalyticsChart from '../../components/admin/AnalyticsChart';
import UserTable from '../../components/admin/UserTable';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import { useTheme } from '@mui/material/styles';

const AdminDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Data States
  const [users, setUsers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const allBookings = await bookingApi.getAllBookings();
      setBookings(allBookings);

      const allWorkers = await workerApi.getAllWorkers();
      setWorkers(allWorkers);

      const allPayments = await paymentApi.getAllPayments();
      setPayments(allPayments);

      const allUsers = await authApi.getUserById('');
      setUsers(Array.isArray(allUsers) ? allUsers : [allUsers]);
    } catch (err) {
      console.error(err);
      setError('Error compiling administration statistics. Ensure service nodes are active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute metrics
  const totalUsers = users.length;
  const activeWorkers = workers.filter(w => w.status === 'AVAILABLE').length;
  const completedJobs = bookings.filter(b => b.status === 'WORK_COMPLETED' || b.status === 'PAID').length;
  
  const completedPayments = payments.filter(p => p.status === 'COMPLETED' || p.status === 'SUCCESS');
  const totalRevenue = completedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  // Compute pending verifications
  const pendingVerificationsCount = workers.filter(
    w => w.verificationStatus === 'PENDING' || (!w.verified && w.verificationStatus !== 'REJECTED')
  ).length;

  // Compute 7 Days Revenue Trend
  const getRevenueChartData = () => {
    const chartData = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - i);
      
      const dateString = targetDate.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      });
      
      // Filter payments on this calendar day
      const dayPayments = completedPayments.filter(p => {
        if (!p.paymentDate) return false;
        const pDate = new Date(p.paymentDate);
        return pDate.toDateString() === targetDate.toDateString();
      });

      const dayRevenue = dayPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
      
      chartData.push({
        date: dateString,
        Revenue: dayRevenue,
      });
    }
    return chartData;
  };

  const revenueData = getRevenueChartData();

  // Get recent 10 bookings
  const getRecentBookings = () => {
    return [...bookings]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);
  };

  const recentBookings = getRecentBookings();

  // Helper to resolve customer/worker fullNames
  const getUserName = (userId) => {
    const matched = users.find(u => u.id === userId);
    return matched ? matched.fullName : `User #${userId}`;
  };

  if (loading) {
    return <Loader message="Accessing secure administrative ledger..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Unified Admin Navigation and Header */}
      <AdminHeader 
        title="Operations Dashboard" 
        subtitle="Real-time operational summary, revenue trackers, recent dispatch calls, and worker verification requests."
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      {/* Row 1: Quick Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard 
            icon={Users} 
            label="Total Users" 
            value={totalUsers} 
            trend="+12%" 
            isPositive={true}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard 
            icon={UserPlus} 
            label="Active Workers" 
            value={activeWorkers} 
            trend="+5%" 
            isPositive={true}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard 
            icon={ShieldCheck} 
            label="Completed Jobs" 
            value={completedJobs} 
            trend="+8%" 
            isPositive={true}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard 
            icon={IndianRupee} 
            label="Total Revenue" 
            value={formatCurrency(totalRevenue)} 
            trend="+14%" 
            isPositive={true}
          />
        </Grid>
      </Grid>

      {/* Row 2: Verification Alert Banner */}
      {pendingVerificationsCount > 0 && (
        <Card 
          sx={{ 
            mb: 4, 
            background: theme.palette.mode === 'light' 
              ? 'linear-gradient(135deg, #FFF9E6 0%, #FFF3CD 100%)' 
              : 'linear-gradient(135deg, #1E1B10 0%, #2A2410 100%)',
            border: `1px solid ${theme.palette.mode === 'light' ? '#FFEBA8' : '#3E341A'}`,
            borderRadius: 3
          }}
        >
          <CardContent sx={{ p: 3, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Box>
              <Typography 
                variant="subtitle1" 
                fontWeight="800" 
                color={theme.palette.mode === 'light' ? 'primary.main' : '#F59E0B'}
              >
                Worker Verifications Pending
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                There are currently <strong>{pendingVerificationsCount}</strong> worker profiles awaiting compliance review and credential approval.
              </Typography>
            </Box>
            <Button
              component={Link}
              to="/admin/verifications"
              variant="contained"
              color="warning"
              endIcon={<ArrowRight size={16} />}
              sx={{ fontWeight: 700, borderRadius: '8px', color: '#000000' }}
            >
              Verify Workers
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Row 3: Revenue Chart and Recent Bookings */}
      <Grid container spacing={3}>
        {/* Left Column: Recharts Line Chart */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <AnalyticsChart 
            title="Revenue Trend (Last 7 Days)"
            type="line"
            data={revenueData}
            xAxisKey="date"
            dataKey="Revenue"
            colors={[theme.palette.secondary.main]}
            height={320}
          />
        </Grid>

        {/* Right Column: Recent Booking Table */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 2 }}>
                Recent Dispatches
              </Typography>
              
              {recentBookings.length === 0 ? (
                <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" sx={{ flexGrow: 1, py: 4 }}>
                  <HardDrive size={36} color={theme.palette.text.secondary} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                    No bookings logged in the system.
                  </Typography>
                </Box>
              ) : (
                <TableContainer 
                  component={Paper} 
                  sx={{ 
                    boxShadow: 'none', 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    maxHeight: 320,
                    overflowY: 'auto'
                  }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead sx={{ bgcolor: theme.palette.mode === 'light' ? '#F8FAFC' : '#070D19' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800 }}>ID</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Service</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Customer</TableCell>
                        <TableCell sx={{ fontWeight: 800 }} align="right">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentBookings.map((booking) => (
                        <TableRow 
                          key={booking.id}
                          sx={{ 
                            '&:last-child td, &:last-child th': { border: 0 },
                            '&:hover': { bgcolor: theme.palette.mode === 'light' ? 'rgba(0, 180, 216, 0.02)' : 'rgba(0, 245, 212, 0.02)' }
                          }}
                        >
                          <TableCell sx={{ fontWeight: '700' }}>#{booking.id}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem' }}>{booking.serviceType}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem' }}>{getUserName(booking.customerId)}</TableCell>
                          <TableCell align="right">
                            <StatusBadge status={booking.status} />
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
      </Grid>

      {/* Row 4: Registered Users Registry */}
      <Box sx={{ mt: 4 }}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 3 }}>
              Platform User Registry
            </Typography>
            <UserTable users={users} />
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
