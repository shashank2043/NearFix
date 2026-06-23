import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import { Users, ShieldCheck, ClipboardList, TrendingUp, AlertTriangle, ShieldAlert, Award, FileText, CheckCircle } from 'lucide-react';

import { authApi } from '../../api/authApi';
import { workerApi } from '../../api/workerApi';
import { bookingApi } from '../../api/bookingApi';
import { paymentApi } from '../../api/paymentApi';
import { formatCurrency } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const Dashboard = () => {
  // Navigation Tabs state
  const [tabValue, setTabValue] = useState(0);

  // States
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Complaint Management Mock State
  const [complaints, setComplaints] = useState([
    {
      id: 'CMP-101',
      customerName: 'Amit Sharma',
      workerName: 'Rajesh Kumar',
      issue: 'Delay in arrival: Worker arrived 45 mins late instead of 15 mins.',
      status: 'OPEN'
    },
    {
      id: 'CMP-102',
      customerName: 'Priya Patel',
      workerName: 'Vikram Singh',
      issue: 'Messy cleanup: Plumber resolved the leak but left water and debris.',
      status: 'RESOLVED'
    }
  ]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all core system data
      const allBookings = await bookingApi.getAllBookings();
      setBookings(allBookings);

      const allWorkers = await workerApi.getAllWorkers();
      setWorkers(allWorkers);

      const allPayments = await paymentApi.getAllPayments();
      setPayments(allPayments);

      // Fetch all users
      // Since json-server /users gets everyone, we fetch that list.
      const usersCheck = await authApi.getUserById(''); // standard query to get all if no id, or we fetch manually using custom fetch
      // Wait, let's verify if authApi.getUserById('') gets all, or if we can make a direct call.
      // If we look at authApi: getUserById: (id) => axiosInstance.get(`/users/${id}`)
      // If we pass empty string, it fetches `/users/` which gets all users in json-server. This is perfect!
      const responseUsers = await authApi.getUserById('');
      setUsers(Array.isArray(responseUsers) ? responseUsers : [responseUsers]);
    } catch (err) {
      setError('Failed to fetch administrative metrics from system services.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveWorker = async (workerId) => {
    try {
      // 1. Verify worker profile
      await workerApi.verifyWorker(workerId, true);
      
      // 2. Set worker status to AVAILABLE (online)
      await workerApi.updateStatus(workerId, 'AVAILABLE');

      setSuccess('Worker verified and activated successfully!');
      loadData();
    } catch (err) {
      setError('Could not verify worker profile.');
    }
  };

  const handleRejectWorker = async (workerId) => {
    try {
      // Reject worker sets verified to false and status UNAVAILABLE
      await workerApi.verifyWorker(workerId, false);
      await workerApi.updateStatus(workerId, 'UNAVAILABLE');
      
      setSuccess('Worker verification rejected.');
      loadData();
    } catch (err) {
      setError('Could not reject worker verification.');
    }
  };

  const handleResolveComplaint = (id) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'RESOLVED' } : c))
    );
    setSuccess(`Complaint ${id} marked as RESOLVED.`);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };

  // Metrics computation
  const totalUsersCount = users.length;
  const workersCount = workers.length;
  const bookingsCount = bookings.length;
  // Sum payments with SUCCESS/COMPLETED status
  const grossRevenue = payments
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, curr) => sum + curr.amount, 0);

  // Filter workers awaiting verification
  const pendingWorkers = workers.filter((w) => !w.verified);

  if (loading) return <Loader message="Compiling admin dashboard ledger..." />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Alert logs */}
      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 3, borderRadius: 2 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Metrics Header */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366F1' }}>
                <Users size={24} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight="500">
                  Total Users
                </Typography>
                <Typography variant="h5" fontWeight="800">
                  {totalUsersCount}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0, 180, 216, 0.1)', color: '#00B4D8' }}>
                <Award size={24} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight="500">
                  Total Workers
                </Typography>
                <Typography variant="h5" fontWeight="800">
                  {workersCount}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0, 245, 212, 0.1)', color: '#00F5D4' }}>
                <ClipboardList size={24} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight="500">
                  Bookings Logged
                </Typography>
                <Typography variant="h5" fontWeight="800">
                  {bookingsCount}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(74, 222, 128, 0.1)', color: '#4ADE80' }}>
                <TrendingUp size={24} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight="500">
                  Gross Revenue
                </Typography>
                <Typography variant="h5" fontWeight="800">
                  {formatCurrency(grossRevenue)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }} color="secondary">
        <Tab label={`Worker Verification (${pendingWorkers.length})`} icon={<ShieldCheck size={16} />} iconPosition="start" />
        <Tab label="Booking Registry" icon={<FileText size={16} />} iconPosition="start" />
        <Tab label="Complaints Desk" icon={<AlertTriangle size={16} />} iconPosition="start" />
      </Tabs>

      {/* Verification tab */}
      {tabValue === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="700" sx={{ mb: 3 }}>
              Workers Awaiting Profile Verification
            </Typography>

            {pendingWorkers.length === 0 ? (
              <EmptyState
                title="All Workers Verified"
                description="There are currently no registered technicians awaiting compliance verification."
                icon={ShieldCheck}
              />
            ) : (
              <List sx={{ width: '100%' }}>
                {pendingWorkers.map((worker, idx) => {
                  const userDetail = users.find((u) => u.id === worker.id) || {};
                  return (
                    <React.Fragment key={worker.id}>
                      <Box sx={{ py: 2.5, px: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box display="flex" sx={{ gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'secondary.main', color: '#0B192C', fontWeight: 'bold' }}>
                            {userDetail.fullName?.charAt(0).toUpperCase() || 'W'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="700">
                              {userDetail.fullName || 'Unregistered User'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Skill: <strong>{worker.skill}</strong> | Experience: <strong>{worker.experience} yrs</strong>
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Email: {userDetail.email} | Mobile: {userDetail.phone} | City: {worker.city}
                            </Typography>
                          </Box>
                        </Box>
                        <Box display="flex" sx={{ gap: 1.5 }}>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleRejectWorker(worker.id)}
                          >
                            Reject
                          </Button>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => handleApproveWorker(worker.id)}
                          >
                            Approve
                          </Button>
                        </Box>
                      </Box>
                      {idx < pendingWorkers.length - 1 && <Divider />}
                    </React.Fragment>
                  );
                })}
              </List>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bookings log tab */}
      {tabValue === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="700" sx={{ mb: 3 }}>
              Global Booking Audit Registry
            </Typography>

            {bookings.length === 0 ? (
              <EmptyState
                title="No Bookings Recorded"
                description="Bookings logged on the client app will populate here."
                icon={ClipboardList}
              />
            ) : (
              <List>
                {bookings.map((booking, idx) => {
                  const customer = users.find((u) => u.id === booking.customerId) || {};
                  const worker = users.find((u) => u.id === booking.workerId) || {};
                  return (
                    <React.Fragment key={booking.id}>
                      <Box sx={{ py: 2, px: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Box display="flex" alignItems="center" sx={{ gap: 1.5, mb: 0.5 }}>
                            <Typography variant="subtitle1" fontWeight="700">
                              #{booking.id} - {booking.serviceType} Callout
                            </Typography>
                            <StatusBadge status={booking.status} />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Customer: <strong>{customer.fullName || `User ID ${booking.customerId}`}</strong>
                            {booking.workerId && (
                              <>
                                {' '}| Assigned Worker:{' '}
                                <strong>{worker.fullName || `Worker ID ${booking.workerId}`}</strong>
                              </>
                            )}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Address: {booking.address} | Dispatched: {formatDate(booking.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                      {idx < bookings.length - 1 && <Divider />}
                    </React.Fragment>
                  );
                })}
              </List>
            )}
          </CardContent>
        </Card>
      )}

      {/* Complaints desk tab */}
      {tabValue === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="700" sx={{ mb: 3 }}>
              Customer Complaints Ticketing
            </Typography>

            <List>
              {complaints.map((comp, idx) => (
                <React.Fragment key={comp.id}>
                  <Box sx={{ py: 2.5, px: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Box display="flex" alignItems="center" sx={{ gap: 1.5, mb: 0.8 }}>
                        <Typography variant="subtitle1" fontWeight="700">
                          {comp.id}
                        </Typography>
                        <Chip
                          label={comp.status}
                          color={comp.status === 'OPEN' ? 'error' : 'success'}
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.primary" paragraph sx={{ mb: 0.5 }}>
                        {comp.issue}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Reporter: <strong>{comp.customerName}</strong> | Accused Worker: <strong>{comp.workerName}</strong>
                      </Typography>
                    </Box>
                    {comp.status === 'OPEN' && (
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={() => handleResolveComplaint(comp.id)}
                      >
                        Resolve
                      </Button>
                    )}
                  </Box>
                  {idx < complaints.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default Dashboard;
