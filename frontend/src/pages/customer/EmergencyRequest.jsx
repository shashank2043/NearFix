import React, { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { ArrowLeft, Clock } from 'lucide-react';

import EmergencyRequestForm from '../../components/customer/EmergencyRequestForm';
import PriceEstimator from '../../components/customer/PriceEstimator';
import { useBooking } from '../../hooks/useBooking';

/**
 * EmergencyRequest Page.
 * Houses the request form and the pricing estimations sidebar.
 */
const EmergencyRequest = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createBooking, loading, error } = useBooking();

  const selectedService = useMemo(() => {
    return searchParams.get('service') || 'Electrician';
  }, [searchParams]);

  // Detect system hour to evaluate NIGHT surges (9 PM to 6 AM)
  const timeOfDay = useMemo(() => {
    const hour = new Date().getHours();
    return hour >= 21 || hour < 6 ? 'NIGHT' : 'DAY';
  }, []);

  const handleBookingSubmit = async (formData) => {
    try {
      const response = await createBooking(formData);
      // Route straight to tracking board upon successful match dispatch
      navigate(`/customer/track/${response.id}`);
    } catch (err) {
      console.error('SOS booking match dispatch failed:', err);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Header back navigation */}
      <Box display="flex" alignItems="center" sx={{ gap: 1, mb: 3 }}>
        <Button
          variant="text"
          color="inherit"
          onClick={() => navigate('/customer/services')}
          startIcon={<ArrowLeft size={16} />}
          sx={{ fontWeight: '700' }}
        >
          Change Service
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/*SOS Dispatch form */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" fontWeight="800" color="text.primary" gutterBottom>
                SOS Dispatch Request
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Describe the repair emergency and confirm your current address below. Our algorithm matches your request with the closest worker.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <EmergencyRequestForm
                initialService={selectedService}
                onSubmit={handleBookingSubmit}
                loading={loading}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Dynamic Sidebar Estimator */}
        <Grid item xs={12} md={5}>
          <Box display="flex" flexDirection="column" sx={{ gap: 3 }}>
            
            <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="700" sx={{ mb: 2.5 }} color="text.primary">
                  Pricing Matrix
                </Typography>
                
                <PriceEstimator
                  serviceType={selectedService}
                  timeOfDay={timeOfDay}
                />
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 3, display: 'flex', gap: 2 }}>
                <Clock size={24} color="#00B4D8" style={{ flexShrink: 0 }} />
                <Box>
                  <Typography variant="body2" fontWeight="700" color="text.primary" gutterBottom>
                    Estimated Match Time
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Due to the emergency nature of SOS dispatches, nearest technicians are requested to respond in under 2 minutes. Avg matching time is 45 seconds.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
            
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EmergencyRequest;
