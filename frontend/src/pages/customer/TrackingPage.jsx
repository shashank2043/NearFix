import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import { Map, Ban, ChevronRight, Phone } from 'lucide-react';

import { useBooking } from '../../hooks/useBooking';
import { workerApi } from '../../api/workerApi';
import { authApi } from '../../api/authApi';
import BookingStatusStepper from '../../components/customer/BookingStatusStepper';
import WorkerCard from '../../components/customer/WorkerCard';
import Loader from '../../components/common/Loader';

/**
 * TrackingPage Component.
 * Fetches current booking status and details, polls for worker status updates,
 * and renders a static placeholder map representing mock tracking coordinates.
 */
const TrackingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchBookingById, updateBookingStatus, loading, error } = useBooking();

  const [booking, setBooking] = useState(null);
  const [workerProfile, setWorkerProfile] = useState(null);
  const [workerUser, setWorkerUser] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Poll booking details every 5 seconds to simulate real-time worker changes
  useEffect(() => {
    let active = true;

    const loadBookingDetails = async () => {
      try {
        const details = await fetchBookingById(id);
        if (!active) return;
        setBooking(details);

        // Fetch details of worker if assigned
        if (details.workerId && !workerUser) {
          const profile = await workerApi.getProfileById(details.workerId);
          const userObj = await authApi.getUserById(details.workerId);
          if (active) {
            setWorkerProfile(profile);
            setWorkerUser(userObj);
          }
        }
      } catch (err) {
        console.error('Error fetching tracker details:', err);
      }
    };

    loadBookingDetails();
    const interval = setInterval(loadBookingDetails, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [id, fetchBookingById, workerUser]);

  const handleCancelBooking = async () => {
    if (!booking) return;
    setCancelling(true);
    try {
      await updateBookingStatus(booking.id, 'CANCELLED');
      setBooking((prev) => ({ ...prev, status: 'CANCELLED' }));
    } catch (err) {
      console.error('SOS cancellation dispatch failed:', err);
    } finally {
      setCancelling(false);
    }
  };

  if (loading && !booking) return <Loader message="Connecting booking tracking data..." />;
  if (error && !booking) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;
  if (!booking) return <Loader message="Booking details not found..." />;

  const isRequested = booking.status === 'REQUESTED';
  const isCompleted = booking.status === 'WORK_COMPLETED';
  const isPaid = booking.status === 'PAID';

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Grid container spacing={4}>
        
        {/* Live Tracking Column */}
        <Grid xs={12} md={7}>
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" fontWeight="800" color="text.primary" gutterBottom>
                Live Tracking Status
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                SOS Dispatch ID: <strong>#{booking.id}</strong> | Service Category: <strong>{booking.serviceType}</strong>
              </Typography>

              {/* Status Stepper */}
              <BookingStatusStepper status={booking.status} />

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle2" fontWeight="700" color="text.secondary" gutterBottom>
                Emergency Description
              </Typography>
              <Typography variant="body2" color="text.primary" sx={{ mb: 3 }}>
                {booking.issueDescription}
              </Typography>

              <Typography variant="subtitle2" fontWeight="700" color="text.secondary" gutterBottom>
                Service Address
              </Typography>
              <Typography variant="body2" color="text.primary">
                {booking.address}
              </Typography>
            </CardContent>
          </Card>

          {/* Action Triggers */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            {isRequested && (
              <Button
                variant="outlined"
                color="error"
                fullWidth
                size="large"
                startIcon={<Ban size={18} />}
                disabled={cancelling}
                onClick={handleCancelBooking}
                sx={{ py: 1.2 }}
              >
                {cancelling ? 'Cancelling SOS Dispatch...' : 'Cancel SOS Request'}
              </Button>
            )}

            {(isCompleted || isPaid) && (
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                endIcon={<ChevronRight size={18} />}
                onClick={() => navigate(isPaid ? `/customer/review/${booking.id}` : `/customer/pay/${booking.id}`)}
                sx={{ py: 1.2 }}
              >
                {isPaid ? 'Submit Rating & Feedback' : 'Proceed to Payment'}
              </Button>
            )}
          </Box>
        </Grid>

        {/* Worker Info Map Column */}
        <Grid xs={12} md={5}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* Mock GPS Map Panel */}
            <Card>
              <CardContent sx={{ p: 0, position: 'relative' }}>
                <Box
                  sx={{
                    height: 250,
                    bgcolor: '#0B192C',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    textAlign: 'center',
                    p: 3,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Map size={48} color="#00F5D4" style={{ marginBottom: 16 }} />
                  <Typography variant="body1" fontWeight="800" sx={{ color: '#FFFFFF' }}>
                    Live GPS Tracker Simulator
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7, color: '#FFFFFF', maxWidth: 300, mt: 0.5 }}>
                    {booking.status === 'REQUESTED'
                      ? 'Analyzing nearest technician GPS coordinates...'
                      : `Helper dispatched. Approaching your service location...`}
                  </Typography>

                  {/* Pulse Indicator */}
                  {booking.status !== 'REQUESTED' && (
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        bgcolor: 'secondary.main',
                        position: 'absolute',
                        top: '55%',
                        left: '48%',
                        boxShadow: '0 0 10px #00F5D4',
                        animation: 'pulse 1.5s infinite ease-in-out',
                        '@keyframes pulse': {
                          '0%': { transform: 'scale(0.8)', opacity: 0.5 },
                          '50%': { transform: 'scale(1.4)', opacity: 1 },
                          '100%': { transform: 'scale(0.8)', opacity: 0.5 },
                        },
                      }}
                    />
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Helper Card */}
            {workerUser && workerProfile ? (
              <Box>
                <Typography variant="subtitle2" fontWeight="700" color="text.secondary" sx={{ mb: 1.5 }}>
                  Assigned Emergency Technician
                </Typography>
                <WorkerCard
                  name={workerUser.fullName}
                  skill={workerProfile.skill}
                  rating={workerProfile.rating}
                  distance={booking.status === 'ON_THE_WAY' ? '300 m' : '1.4 km'}
                  estimatedArrival={booking.status === 'ON_THE_WAY' ? '2 mins' : '8 mins'}
                />
                
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5, 
                    p: 2, 
                    bgcolor: 'action.hover', 
                    border: '1px solid', 
                    borderColor: 'divider', 
                    borderRadius: 3, 
                    mt: 2 
                  }}
                >
                  <Phone size={18} color="#00B4D8" />
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Direct phone contact
                    </Typography>
                    <Typography variant="body2" fontWeight="700">
                      {workerUser.phone}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ) : (
              booking.status === 'REQUESTED' && (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  Technicians are reviewing your call. Do not close this page. Average dispatch match takes under 60 seconds.
                </Alert>
              )
            )}
            
          </Box>
        </Grid>
        
      </Grid>
    </Container>
  );
};

export default TrackingPage;
