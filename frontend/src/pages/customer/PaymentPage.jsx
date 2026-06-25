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
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { ShieldCheck, CreditCard, Smartphone, Award } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getBookingByIdThunk, updateBookingStatusThunk } from '../../store/slices/bookingSlice';
import { createPaymentThunk, verifyPaymentThunk } from '../../store/slices/paymentSlice';
import { getUserByIdThunk, getProfileThunk } from '../../store/slices/authSlice';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/helpers';


const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};


const PaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const booking = useSelector((state) => state.booking.currentBooking);
  const authUser = useSelector((state) => state.auth.user);
  const usersCached = useSelector((state) => state.auth.usersCached);

  const [workerUser, setWorkerUser] = useState(null);
  const [customerUser, setCustomerUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    
    loadRazorpayScript();
  }, []);

  useEffect(() => {
    const loadBookingData = async () => {
      try {
        const details = await dispatch(getBookingByIdThunk(id)).unwrap();

        
        if (details.status === 'PAID') {
          navigate(`/customer/review/${details.id}`);
          return;
        }

        if (details.workerId) {
          const cached = usersCached[details.workerId];
          if (cached) {
            setWorkerUser(cached);
          } else {
            const userObjResult = await dispatch(getUserByIdThunk(details.workerId)).unwrap();
            setWorkerUser(userObjResult.data);
          }
        }

        
        if (authUser) {
          setCustomerUser(authUser);
        } else {
          try {
            const profile = await dispatch(getProfileThunk()).unwrap();
            setCustomerUser(profile);
          } catch (e) {
            console.warn('Could not fetch customer profile for checkout prefill, using defaults.', e);
          }
        }
      } catch (err) {
        setError('Failed to fetch invoice details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadBookingData();
  }, [id, dispatch, navigate, authUser, usersCached]);

  const handlePaymentSubmit = async () => {
    if (!booking) return;
    setPaymentLoading(true);
    setError('');

    try {
      
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load. Please verify your internet connection.');
      }

      
      const paymentResponse = await dispatch(createPaymentThunk({
        bookingId: booking.id,
        amount: booking.amount, 
      })).unwrap();

      const razorpayKey = paymentResponse.keyId || 'rzp_test_5g6h7i8j9k0l1m';
      const orderId = paymentResponse.transactionId;

      
      const options = {
        key: razorpayKey,
        amount: booking.amount * 100, 
        currency: 'INR',
        name: 'NearFix Portal',
        description: `Emergency Service Booking #${booking.id}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            
            await dispatch(verifyPaymentThunk({
              bookingId: booking.id,
              transactionId: orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })).unwrap();

            navigate(`/customer/review/${booking.id}`);
          } catch (err) {
            console.error('Failed to verify payment or sync booking status:', err);
            setError('Payment verification failed or syncing state failed. Please check your bookings page.');
          } finally {
            setPaymentLoading(false);
          }
        },
        prefill: {
          name: customerUser?.fullName || 'NearFix Customer',
          email: customerUser?.email || 'customer@nearfix.com',
          contact: customerUser?.phone || '9999999999'
        },
        theme: {
          color: '#6366f1' 
        },
        modal: {
          ondismiss: function () {
            setError('Razorpay checkout dismissed by user. You can retry paying whenever you are ready.');
            setPaymentLoading(false);
          }
        }
      };

      
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Razorpay checkout initiation failed:', err);
      
      
      if (err.response?.status === 409 || err.message?.toLowerCase().includes('already')) {
        navigate(`/customer/review/${booking.id}`);
        return;
      }
      
      setError(err.message || 'Secure payment gateway failed. Please verify credentials or retry.');
      setPaymentLoading(false);
    }
  };

  if (loading) return <Loader message="Compiling checkout transaction..." />;
  if (error && !booking) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;
  if (!booking) return <Loader message="Booking details not found..." />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Grid container spacing={4}>
        
        
        <Grid xs={12} md={7}>
          <Card sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ p: 1, borderRadius: 3, bgcolor: 'primary.light', color: 'primary.contrastText', display: 'flex', alignItems: 'center' }}>
                  <ShieldCheck size={28} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="800" color="text.primary">
                    Secure Checkout
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Powered by Razorpay
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Please proceed to pay the service fee. Razorpay supports credit/debit cards, UPI/QR, netbanking, and leading mobile wallets.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" fontWeight="700" color="text.secondary" sx={{ mb: 1.8, fontSize: '0.8rem', letterSpacing: 0.5 }}>
                  ACCEPTED CHANNELS
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  {[
                    { label: 'UPI (GPay/PhonePe)', icon: <Smartphone size={16} /> },
                    { label: 'Credit/Debit Card', icon: <CreditCard size={16} /> },
                    { label: 'Netbanking / Wallets', icon: <Award size={16} /> },
                  ].map((item, index) => (
                    <Chip
                      key={index}
                      icon={item.icon}
                      label={item.label}
                      variant="outlined"
                      sx={{ py: 2, px: 0.5, borderRadius: 2, borderColor: 'divider', fontWeight: 600 }}
                    />
                  ))}
                </Box>
              </Box>

              
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                onClick={handlePaymentSubmit}
                disabled={paymentLoading}
                sx={{
                  py: 1.8,
                  borderRadius: 3,
                  fontWeight: '800',
                  fontSize: '1.05rem',
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  boxShadow: '0 8px 16px rgba(99, 102, 241, 0.25)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 20px rgba(99, 102, 241, 0.35)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  }
                }}
              >
                {paymentLoading ? 'Connecting Secure Gateway...' : `Pay with Razorpay`}
              </Button>

              
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5, 
                  p: 2, 
                  bgcolor: 'action.hover', 
                  borderRadius: 3, 
                  mt: 4, 
                  border: '1px solid', 
                  borderColor: 'divider' 
                }}
              >
                <ShieldCheck size={20} color="#10B981" style={{ flexShrink: 0 }} />
                <Typography variant="caption" color="text.secondary" fontWeight="500">
                  Your transactions are encrypted and secured. No credential details are retained in cleartext.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        
        <Grid xs={12} md={5}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="700" sx={{ mb: 3 }} color="text.primary">
                Invoice Details
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    SOS Dispatch ID
                  </Typography>
                  <Typography variant="body2" fontWeight="700" color="text.primary">
                    #{booking.id}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Service Callout Category
                  </Typography>
                  <Typography variant="body2" fontWeight="700" color="text.primary">
                    {booking.serviceType}
                  </Typography>
                </Box>
                {workerUser && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Emergency Helper
                    </Typography>
                    <Typography variant="body2" fontWeight="700" color="text.primary">
                      {workerUser.fullName}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Location
                  </Typography>
                  <Typography variant="body2" fontWeight="700" color="text.primary" align="right" sx={{ maxWidth: 220 }} noWrap>
                    {booking.address}
                  </Typography>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Typography variant="body1" fontWeight="700" color="text.primary">
                    Total Amount Due
                  </Typography>
                  <Typography variant="h5" fontWeight="800" color="secondary.main">
                    {formatCurrency(booking.amount)}
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
