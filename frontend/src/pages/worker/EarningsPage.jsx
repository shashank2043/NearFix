import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Alert from '@mui/material/Alert';
import { ArrowLeft, Wallet, ClipboardCheck, Calendar, User, TrendingUp } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { useWorkers } from '../../hooks/useWorkers';
import { paymentApi } from '../../api/paymentApi';
import axiosInstance from '../../api/axiosInstance';
import { formatCurrency, formatDate } from '../../utils/helpers';
import EarningsChart from '../../components/worker/EarningsChart';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';


const EarningsPage = () => {
  const { user } = useAuth();
  const { fetchWorkerBookings, loading: hookLoading } = useWorkers();
  const navigate = useNavigate();

  
  const [tabValue, setTabValue] = useState(1); 

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allPayments, setAllPayments] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [usersMap, setUsersMap] = useState({});

  
  const [summaryAmount, setSummaryAmount] = useState(0);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [chartData, setChartData] = useState([]);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError('');

      
      const bookingsList = await fetchWorkerBookings(user.id);
      const completedBookings = bookingsList.filter((b) =>
        ['WORK_COMPLETED', 'PAID'].includes(b.status)
      );
      setAllBookings(completedBookings);

      
      const paymentsList = await paymentApi.getAllPayments();
      
      const completedIds = completedBookings.map((b) => b.id);
      const workerPayments = paymentsList.filter(
        (p) => completedIds.includes(p.bookingId) && (p.status === 'COMPLETED' || p.status === 'SUCCESS')
      );
      setAllPayments(workerPayments);

      
      try {
        const usersResponse = await axiosInstance.get('/api/auth/users');
        const map = {};
        usersResponse.data.forEach((u) => {
          map[u.id] = u.fullName;
        });
        setUsersMap(map);
      } catch (err) {
        console.warn('Failed to fetch users mapping. Displaying IDs instead.', err);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch earnings ledger data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  useEffect(() => {
    if (loading) return;

    
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    
    const startOfWeek = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    
    const startOfMonth = new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000);

    let thresholdDate = startOfWeek;
    if (tabValue === 0) thresholdDate = startOfToday;
    if (tabValue === 2) thresholdDate = startOfMonth;

    
    const matchedPayments = allPayments.filter((p) => {
      const dateStr = p.paymentDate || allBookings.find((b) => b.id === p.bookingId)?.createdAt;
      if (!dateStr) return false;
      const pDate = new Date(dateStr);
      return pDate >= thresholdDate;
    });

    
    const total = matchedPayments.reduce((sum, curr) => sum + curr.amount, 0);
    setSummaryAmount(total);

    
    const matchedBookingIds = matchedPayments.map((p) => p.bookingId);
    const matchedBookings = allBookings.filter((b) => matchedBookingIds.includes(b.id));
    setFilteredBookings(matchedBookings);

    
    let computedChart = [];
    if (tabValue === 0 || tabValue === 1) {
      
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(startOfToday.getTime() - i * 24 * 60 * 60 * 1000);
        const label = `${daysOfWeek[d.getDay()]} ${d.getDate()}`;
        computedChart.push({
          name: label,
          dateString: d.toDateString(),
          amount: 0,
        });
      }

      matchedPayments.forEach((p) => {
        const dateStr = p.paymentDate || allBookings.find((b) => b.id === p.bookingId)?.createdAt;
        if (!dateStr) return;
        const pDate = new Date(dateStr);
        const match = computedChart.find((item) => item.dateString === pDate.toDateString());
        if (match) {
          match.amount += p.amount;
        }
      });
    } else {
      
      for (let i = 29; i >= 0; i--) {
        const d = new Date(startOfToday.getTime() - i * 24 * 60 * 60 * 1000);
        const label = `${d.getDate()} ${d.toLocaleString('en-US', { month: 'short' })}`;
        computedChart.push({
          name: label,
          dateString: d.toDateString(),
          amount: 0,
        });
      }

      matchedPayments.forEach((p) => {
        const dateStr = p.paymentDate || allBookings.find((b) => b.id === p.bookingId)?.createdAt;
        if (!dateStr) return;
        const pDate = new Date(dateStr);
        const match = computedChart.find((item) => item.dateString === pDate.toDateString());
        if (match) {
          match.amount += p.amount;
        }
      });
    }

    setChartData(computedChart);
  }, [tabValue, allPayments, allBookings, loading]);

  if (loading) {
    return <Loader message="Reconciliation of accounts..." />;
  }

  
  const getBookingAmount = (bookingId) => {
    const payment = allPayments.find((p) => p.bookingId === bookingId);
    return payment ? payment.amount : 0;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => navigate('/worker/dashboard')}
          startIcon={<ArrowLeft size={16} />}
          sx={{ border: '1.5px solid', fontWeight: 'bold' }}
        >
          Dashboard
        </Button>
        <Box>
          <Typography variant="h4" fontWeight="800" color="text.primary">
            Earnings Ledger
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Analyze your emergency fix profits and view historical statements.
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={(e, val) => setTabValue(val)}
          textColor="secondary"
          indicatorColor="secondary"
          aria-label="earnings timeframes"
        >
          <Tab label="Today" sx={{ fontWeight: 'bold' }} />
          <Tab label="This Week" sx={{ fontWeight: 'bold' }} />
          <Tab label="This Month" sx={{ fontWeight: 'bold' }} />
        </Tabs>
      </Box>

      <Grid container spacing={4}>
        
        <Grid size={{ xs: 12, md: 7 }}>
          <Grid container spacing={3}>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                  <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(0, 245, 212, 0.1)', color: '#00F5D4', flexShrink: 0 }}>
                    <Wallet size={32} />
                  </Box>
                  <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="700" display="block" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Period Earnings
                    </Typography>
                    <Typography fontWeight="900" color="text.primary" sx={{ fontSize: { xs: '1.75rem', sm: '1.4rem', md: '1.75rem', lg: '2.125rem' }, lineHeight: 1.2 }}>
                      {formatCurrency(summaryAmount)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            
            <Grid size={{ xs: 12, sm: 6 }}>
              <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                  <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(0, 180, 216, 0.1)', color: '#00B4D8', flexShrink: 0 }}>
                    <ClipboardCheck size={32} />
                  </Box>
                  <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="700" display="block" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Jobs Completed
                    </Typography>
                    <Typography fontWeight="900" color="text.primary" sx={{ fontSize: { xs: '1.75rem', sm: '1.4rem', md: '1.75rem', lg: '2.125rem' }, lineHeight: 1.2 }}>
                      {filteredBookings.length}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            
            <Grid size={12}>
              <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <TrendingUp size={18} className="text-secondary" />
                    <Typography variant="subtitle1" fontWeight="800">
                      Earnings Distribution
                    </Typography>
                  </Box>
                  <EarningsChart data={chartData} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 3 }}>
                Completed Jobs Feed
              </Typography>

              {filteredBookings.length === 0 ? (
                <EmptyState
                  title="No Completed Jobs"
                  description="There are no completed job payments logged in this specific timeframe."
                  icon={Calendar}
                />
              ) : (
                <List sx={{ width: '100%', p: 0, overflow: 'auto', maxHeight: 420 }}>
                  {filteredBookings.map((job, idx) => (
                    <React.Fragment key={job.id}>
                      <ListItem sx={{ px: 0, py: 2 }}>
                        <ListItemText
                          disableTypography
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" fontWeight="800" color="text.primary">
                                {job.serviceType} Callout
                              </Typography>
                              <Typography variant="body2" fontWeight="900" color="primary.main">
                                {formatCurrency(getBookingAmount(job.id))}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                <User size={12} className="text-secondary" />
                                <Typography variant="caption" color="text.secondary">
                                  {usersMap[job.customerId] || `Customer #${job.customerId}`}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Calendar size={12} className="text-secondary" />
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(job.createdAt)}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {idx < filteredBookings.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EarningsPage;
