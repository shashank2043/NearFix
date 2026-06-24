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
import { Ban, ChevronRight, Phone, RefreshCw } from 'lucide-react';

import { useBooking } from '../../hooks/useBooking';
import { workerApi } from '../../api/workerApi';
import { authApi } from '../../api/authApi';
import BookingStatusStepper from '../../components/customer/BookingStatusStepper';
import WorkerCard from '../../components/customer/WorkerCard';
import Loader from '../../components/common/Loader';


const TrackingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchBookingById, updateBookingStatus, loading, error } = useBooking();

  const [booking, setBooking] = useState(null);
  const [workerProfile, setWorkerProfile] = useState(null);
  const [workerUser, setWorkerUser] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [refreshingETA, setRefreshingETA] = useState(false);

  const handleCheckETA = async () => {
    if (!id) return;
    setRefreshingETA(true);
    try {
      const details = await fetchBookingById(id);
      setBooking(details);
      if (details.workerId && !workerUser) {
        const profile = await workerApi.getProfileById(details.workerId);
        const userObj = await authApi.getUserById(details.workerId);
        setWorkerProfile(profile);
        setWorkerUser(userObj);
      }
    } catch (err) {
      console.error('Error refreshing ETA:', err);
    } finally {
      setRefreshingETA(false);
    }
  };

  
  useEffect(() => {
    let active = true;

    const loadBookingDetails = async () => {
      try {
        const details = await fetchBookingById(id);
        if (!active) return;
        setBooking(details);

        
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
    const interval = setInterval(loadBookingDetails, 30000);

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
        
        
        <Grid xs={12} md={7}>
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" fontWeight="800" color="text.primary" gutterBottom>
                Live Tracking Status
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                SOS Dispatch ID: <strong>#{booking.id}</strong> | Service Category: <strong>{booking.serviceType}</strong>
              </Typography>

              
              <BookingStatusStepper status={booking.status} />

              {!isPaid && !isCompleted && (
                <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
                  <strong>Billing Info:</strong> The final service charge is decided by the worker (minimum ₹300) and may vary based on the work done. You can negotiate the amount in person with the worker, and they will enter the agreed amount when completing the work.
                </Alert>
              )}

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

          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {isCompleted && (
              <Alert severity="success" sx={{ width: '100%', borderRadius: 2 }}>
                <strong>Final Amount: ₹{booking.amount}</strong>. The worker has marked the job as completed. Please proceed to payment.
              </Alert>
            )}

            {isPaid && (
              <Alert severity="info" sx={{ width: '100%', borderRadius: 2 }}>
                <strong>Paid Amount: ₹{booking.amount}</strong>. Booking is closed successfully.
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
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
          </Box>
        </Grid>

        
        <Grid xs={12} md={5}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            


            
            {workerUser && workerProfile ? (
              <Box>
                <Typography variant="subtitle2" fontWeight="700" color="text.secondary" sx={{ mb: 1.5 }}>
                  Assigned Emergency Technician
                </Typography>
                <WorkerCard
                  name={workerUser.fullName}
                  skill={workerProfile.skill}
                  rating={workerProfile.rating}
                  distance={
                    (booking.distance !== null && booking.distance !== undefined)
                      ? `${booking.distance} km` 
                      : 'Calculating...'
                  }
                  estimatedArrival={
                    (booking.distance !== null && booking.distance !== undefined)
                      ? `${Math.max(1, Math.round(booking.distance * 5))} mins`
                      : 'Calculating...'
                  }
                />
                
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={handleCheckETA}
                    disabled={refreshingETA}
                    startIcon={<RefreshCw size={14} className={refreshingETA ? "animate-spin" : ""} />}
                    sx={{ fontWeight: 'bold', width: '100%' }}
                  >
                    {refreshingETA ? 'Checking ETA...' : 'Check ETA / Refresh Location'}
                  </Button>
                </Box>
                
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
