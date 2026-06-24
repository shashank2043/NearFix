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
import TextField from '@mui/material/TextField';
import { Users, ShieldCheck, HardDrive, IndianRupee, ArrowRight, UserPlus, Plus, Trash2, MapPin } from 'lucide-react';

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
  
  
  const [users, setUsers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);

  
  const [cities, setCities] = useState([]);
  const [newCityName, setNewCityName] = useState('');
  const [cityActionLoading, setCityActionLoading] = useState(false);
  const [cityError, setCityError] = useState('');
  const [citySuccess, setCitySuccess] = useState('');

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

      
      try {
        const allCities = await workerApi.getCities();
        setCities(allCities);
      } catch (err) {
        console.error('Failed to load cities:', err);
      }
    } catch (err) {
      console.error(err);
      setError('Error compiling administration statistics. Ensure service nodes are active.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCity = async (e) => {
    e.preventDefault();
    if (!newCityName.trim()) return;
    setCityActionLoading(true);
    setCityError('');
    setCitySuccess('');
    try {
      const created = await workerApi.createCity(newCityName.trim());
      setCities((prev) => [...prev, created]);
      setNewCityName('');
      setCitySuccess(`City "${created.name}" added successfully.`);
    } catch (err) {
      console.error(err);
      setCityError(err.response?.data?.message || 'Failed to add operating city. Ensure city is unique.');
    } finally {
      setCityActionLoading(false);
    }
  };

  const handleDeleteCity = async (cityId, cityName) => {
    if (!window.confirm(`Are you sure you want to remove "${cityName}" from operating cities?`)) {
      return;
    }
    setCityActionLoading(true);
    setCityError('');
    setCitySuccess('');
    try {
      await workerApi.deleteCity(cityId);
      setCities((prev) => prev.filter((c) => c.id !== cityId));
      setCitySuccess(`City "${cityName}" removed successfully.`);
    } catch (err) {
      console.error(err);
      setCityError(err.response?.data?.message || 'Failed to remove operating city.');
    } finally {
      setCityActionLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  
  const totalUsers = users.length;
  const activeWorkers = workers.filter(w => w.status === 'AVAILABLE').length;
  const completedJobs = bookings.filter(b => b.status === 'WORK_COMPLETED' || b.status === 'PAID').length;
  
  const completedPayments = payments.filter(p => p.status === 'COMPLETED' || p.status === 'SUCCESS');
  const totalRevenue = completedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  
  const pendingVerificationsCount = workers.filter(
    w => w.verificationStatus === 'PENDING' || (!w.verified && w.verificationStatus !== 'REJECTED')
  ).length;

  
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

  
  const getRecentBookings = () => {
    return [...bookings]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);
  };

  const recentBookings = getRecentBookings();

  
  const getUserName = (userId) => {
    const matched = users.find(u => u.id === userId);
    return matched ? matched.fullName : `User #${userId}`;
  };

  if (loading) {
    return <Loader message="Accessing secure administrative ledger..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      
      <AdminHeader 
        title="Operations Dashboard" 
        subtitle="Real-time operational summary, revenue trackers, recent dispatch calls, and worker verification requests."
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      
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

      
      <Grid container spacing={3}>
        
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

        
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 2 }}>
                Recent Dispatches
              </Typography>
              
              {recentBookings.length === 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flexGrow: 1, py: 4 }}>
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

      
      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          
          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MapPin size={20} /> Add Operating City
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Introduce a new location where NearFix emergency dispatch agents operate.
                </Typography>

                {(cityError || citySuccess) && (
                  <Box sx={{ mb: 2 }}>
                    {cityError && (
                      <Alert severity="error" onClose={() => setCityError('')} sx={{ borderRadius: 2 }}>
                        {cityError}
                      </Alert>
                    )}
                    {citySuccess && (
                      <Alert severity="success" onClose={() => setCitySuccess('')} sx={{ borderRadius: 2 }}>
                        {citySuccess}
                      </Alert>
                    )}
                  </Box>
                )}

                <Box component="form" onSubmit={handleAddCity} sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="City Name"
                    placeholder="e.g. Hyderabad"
                    value={newCityName}
                    onChange={(e) => setNewCityName(e.target.value)}
                    disabled={cityActionLoading}
                    slotProps={{
                      input: {
                        sx: { borderRadius: 2 }
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    disabled={cityActionLoading || !newCityName.trim()}
                    startIcon={<Plus size={18} />}
                    sx={{ py: 1.2, fontWeight: 700, borderRadius: 2 }}
                  >
                    {cityActionLoading ? 'Adding City...' : 'Add Operating City'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          
          <Grid size={{ xs: 12, md: 7 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 2 }}>
                  Active Service Locations
                </Typography>

                {cities.length === 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flexGrow: 1, py: 4 }}>
                    <MapPin size={36} color={theme.palette.text.secondary} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                      No operating cities configured. System will fallback to standard defaults.
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer
                    component={Paper}
                    sx={{
                      boxShadow: 'none',
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      maxHeight: 280,
                      overflowY: 'auto'
                    }}
                  >
                    <Table size="small" stickyHeader>
                      <TableHead sx={{ bgcolor: theme.palette.mode === 'light' ? '#F8FAFC' : '#070D19' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 800 }}>ID</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>City Name</TableCell>
                          <TableCell sx={{ fontWeight: 800 }} align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cities.map((cityObj) => (
                          <TableRow
                            key={cityObj.id}
                            sx={{
                              '&:last-child td, &:last-child th': { border: 0 },
                              '&:hover': { bgcolor: theme.palette.mode === 'light' ? 'rgba(0, 180, 216, 0.02)' : 'rgba(0, 245, 212, 0.02)' }
                            }}
                          >
                            <TableCell sx={{ fontWeight: '700' }}>#{cityObj.id}</TableCell>
                            <TableCell sx={{ fontWeight: '600' }}>{cityObj.name}</TableCell>
                            <TableCell align="right">
                              <Button
                                size="small"
                                color="error"
                                onClick={() => handleDeleteCity(cityObj.id, cityObj.name)}
                                disabled={cityActionLoading}
                                startIcon={<Trash2 size={14} />}
                                sx={{ fontWeight: 700 }}
                              >
                                Delete
                              </Button>
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
      </Box>
    </Container>
  );
};

export default AdminDashboard;
