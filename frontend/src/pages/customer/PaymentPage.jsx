import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

import { useBooking } from '../../hooks/useBooking';
import { paymentApi } from '../../api/paymentApi';
import { authApi } from '../../api/authApi';
import PaymentForm from '../../components/customer/PaymentForm';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/helpers';

/**
 * PaymentPage Component.
 * Fetches the specific booking, displays invoice details, and collects mock payments.
 */
const PaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchBookingById, updateBookingStatus } = useBooking();

  const [booking, setBooking] = useState(null);
  const [workerUser, setWorkerUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBookingData = async () => {
      try {
        const details = await fetchBookingById(id);
        setBooking(details);

        if (details.workerId) {
          const userObj = await authApi.getUserById(details.workerId);
          setWorkerUser(userObj);
        }
      } catch (err) {
        setError('Failed to fetch invoice details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadBookingData();
  }, [id, fetchBookingById]);

  const handlePaymentSubmit = async (formData) => {
    if (!booking) return;
    setPaymentLoading(true);
    setError('');
    try {
      // 1. Submit payment details
      await paymentApi.createPayment({
        bookingId: booking.id,
        amount: 500, // standard emergency base callout rate
      });

      // 2. Mark booking status as PAID
      await updateBookingStatus(booking.id, 'PAID');

      // 3. Move forward to reviews
      navigate(`/customer/review/${booking.id}`);
    } catch (err) {
      console.error('Payment checkout transaction failed:', err);
      setError('Secure payment gateway failed. Please verify credentials or retry.');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) return <Loader message="Compiling checkout transaction..." />;
  if (error && !booking) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;
  if (!booking) return <Loader message="Booking details not found..." />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Grid container spacing={4}>
        
        {/* Payment Select Form Column */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" fontWeight="800" color="text.primary" gutterBottom>
                Secure Checkout
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Choose your local payment handler and fill credentials to finish dispatch payment.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <PaymentForm
                onSubmit={handlePaymentSubmit}
                loading={paymentLoading}
                amount={500}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Invoice Summary Column */}
        <Grid item xs={12} md={5}>
          <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="700" sx={{ mb: 3 }} color="text.primary">
                Invoice Details
              </Typography>

              <Box display="flex" flexDirection="column" sx={{ gap: 2 }}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    SOS Dispatch ID
                  </Typography>
                  <Typography variant="body2" fontWeight="700" color="text.primary">
                    #{booking.id}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Service Callout Category
                  </Typography>
                  <Typography variant="body2" fontWeight="700" color="text.primary">
                    {booking.serviceType}
                  </Typography>
                </Box>
                {workerUser && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Emergency Helper
                    </Typography>
                    <Typography variant="body2" fontWeight="700" color="text.primary">
                      {workerUser.fullName}
                    </Typography>
                  </Box>
                )}
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Location
                  </Typography>
                  <Typography variant="body2" fontWeight="700" color="text.primary" align="right" sx={{ maxWidth: 220 }} noWrap>
                    {booking.address}
                  </Typography>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Box display="flex" justifyContent="space-between" alignItems="baseline">
                  <Typography variant="body1" fontWeight="700" color="text.primary">
                    Total Amount Due
                  </Typography>
                  <Typography variant="h5" fontWeight="800" color="secondary.main">
                    {formatCurrency(500)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
      </Grid>
    </Container>
  );
};

export default PaymentPage;
