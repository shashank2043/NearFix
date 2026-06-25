import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import { AlertOctagon, Wrench, Zap, Eye, Flame, ShieldAlert, Pipette, Hammer, Car, Cpu, ArrowRight } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { useBooking } from '../../hooks/useBooking';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/helpers';


const CustomerDashboard = () => {
  const { user } = useAuth();
  const { fetchMyBookings, loading, error } = useBooking();
  const [bookings, setBookings] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const list = await fetchMyBookings();
        setBookings(list || []);
      } catch (err) {
        console.error('Failed loading bookings list:', err);
      }
    };
    if (user?.id) {
      loadBookings();
    }
  }, [user?.id, fetchMyBookings]);

  const displayedBookings = showAll ? bookings : bookings.slice(0, 3);

  const quickServices = [
    { name: 'Electrician', icon: Zap },
    { name: 'Plumber', icon: Wrench },
    { name: 'Carpenter', icon: Hammer },
    { name: 'Mechanic', icon: Car },
    { name: 'AC Technician', icon: Cpu },
  ];

  const handleQuickServiceClick = (service) => {
    navigate(`/customer/request?service=${encodeURIComponent(service)}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="800" gutterBottom color="text.primary">
          Hello, {user?.fullName || 'Customer'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Need an emergency fix? Select a service category or tap SOS to match with nearby helpers instantly.
        </Typography>
      </Box>

      
      <Card 
        sx={{ 
          bgcolor: 'error.dark', 
          color: '#FFFFFF', 
          mb: 4, 
          py: 1, 
          border: 'none',
          boxShadow: '0 8px 32px rgba(220, 38, 38, 0.2)'
        }}
      >
        <CardContent 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            gap: 3 
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box 
              sx={{ 
                p: 1.8, 
                bgcolor: 'rgba(255,255,255,0.15)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#FFFFFF'
              }}
            >
              <Flame size={32} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="800" sx={{ color: '#FFFFFF' }}>
                EMERGENCY SOS DISPATCH
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, color: '#FFFFFF' }}>
                Directly connect to certified service technicians within 15 minutes.
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/customer/services')}
            startIcon={<AlertOctagon size={18} />}
            sx={{
              bgcolor: '#FFFFFF',
              color: 'error.dark',
              fontWeight: 800,
              px: 4,
              py: 1.5,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.9)',
              },
            }}
          >
            DISPATCH NOW
          </Button>
        </CardContent>
      </Card>

      
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <Typography variant="h6" fontWeight="700" color="text.primary">
            Quick Select Categories
          </Typography>
          <Button 
            variant="text" 
            color="secondary" 
            onClick={() => navigate('/customer/services')}
            endIcon={<ArrowRight size={16} />}
            sx={{ fontWeight: '700', textTransform: 'none' }}
          >
            Explore More Services
          </Button>
        </Box>
        <Grid container spacing={2}>
          {quickServices.map((service) => {
            const Icon = service.icon;
            return (
              <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={service.name}>
                <Card
                  sx={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': { 
                      transform: 'translateY(-4px)', 
                      borderColor: 'secondary.main',
                      boxShadow: '0 6px 18px rgba(0, 180, 216, 0.15)'
                    }
                  }}
                  onClick={() => handleQuickServiceClick(service.name)}
                >
                  <CardContent sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                    <Box 
                      sx={{ 
                        p: 1.5, 
                        borderRadius: '50%', 
                        bgcolor: 'rgba(0,180,216,0.1)', 
                        color: 'secondary.main' 
                      }}
                    >
                      <Icon size={24} />
                    </Box>
                    <Typography variant="body2" fontWeight="700">
                      {service.name}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <Typography variant="h6" fontWeight="700" color="text.primary">
            {showAll ? 'All SOS Bookings' : 'Recent SOS Bookings'}
          </Typography>
          {bookings.length > 3 && (
            <Button
              size="small"
              onClick={() => setShowAll(!showAll)}
              sx={{ fontWeight: '700' }}
            >
              {showAll ? 'Show Recent Only' : `View All (${bookings.length})`}
            </Button>
          )}
        </Box>

        {loading ? (
          <Loader />
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
        ) : bookings.length === 0 ? (
          <EmptyState
            title="No Bookings Found"
            description="You don't have any recent service bookings. Tap DISPATCH NOW or choose a category to request emergency fixes."
            icon={ShieldAlert}
          />
        ) : (
          <Card>
            <CardContent sx={{ p: 0 }}>
              <List sx={{ p: 0 }}>
                {displayedBookings.map((booking, idx) => (
                  <React.Fragment key={booking.id}>
                    <Box 
                      sx={{ 
                        p: 2.5, 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2
                      }}
                    >
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                          <Typography variant="subtitle1" fontWeight="700" color="text.primary">
                            {booking.serviceType} Callout
                          </Typography>
                          <StatusBadge status={booking.status} />
                        </Box>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            mb: 0.5, 
                            maxWidth: { xs: 260, sm: 400, md: 600 },
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {booking.issueDescription}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Requested: {formatDate(booking.createdAt)}
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        onClick={() => navigate(`/customer/track/${booking.id}`)}
                        startIcon={<Eye size={14} />}
                        sx={{ flexShrink: 0, alignSelf: { xs: 'flex-end', sm: 'center' } }}
                      >
                        Track Call
                      </Button>
                    </Box>
                    {idx < displayedBookings.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
};

export default CustomerDashboard;
