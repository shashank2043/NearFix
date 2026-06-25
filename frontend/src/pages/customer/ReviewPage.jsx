import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import { Award } from 'lucide-react';

import { useDispatch, useSelector } from 'react-redux';
import { getBookingByIdThunk } from '../../store/slices/bookingSlice';
import { createReviewThunk, getReviewsByWorkerThunk } from '../../store/slices/reviewSlice';
import { getWorkerProfileByIdThunk, updateWorkerRatingThunk } from '../../store/slices/workerSlice';
import { getUserByIdThunk } from '../../store/slices/authSlice';
import ReviewForm from '../../components/customer/ReviewForm';
import Loader from '../../components/common/Loader';


const ReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const booking = useSelector((state) => state.booking.currentBooking);
  const workerProfile = useSelector((state) => state.worker.currentWorker);
  const usersCached = useSelector((state) => state.auth.usersCached);

  const [workerUser, setWorkerUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadBookingAndWorker = async () => {
      try {
        const details = await dispatch(getBookingByIdThunk(id)).unwrap();

        if (details.workerId) {
          await dispatch(getWorkerProfileByIdThunk(details.workerId)).unwrap();
          
          const cached = usersCached[details.workerId];
          if (cached) {
            setWorkerUser(cached);
          } else {
            const userObjResult = await dispatch(getUserByIdThunk(details.workerId)).unwrap();
            setWorkerUser(userObjResult.data);
          }
        }
      } catch (err) {
        setError('Failed to load technician details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadBookingAndWorker();
  }, [id, dispatch, usersCached]);

  const handleReviewSubmit = async ({ rating, comment }) => {
    if (!booking || !booking.workerId) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      
      await dispatch(createReviewThunk({
        bookingId: booking.id,
        customerId: booking.customerId,
        workerId: booking.workerId,
        rating,
        comment,
      })).unwrap();

      
      const allReviews = await dispatch(getReviewsByWorkerThunk(booking.workerId)).unwrap();
      const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
      const avg = Number((sum / allReviews.length).toFixed(1));

      
      await dispatch(updateWorkerRatingThunk({ id: booking.workerId, rating: avg })).unwrap();

      setSuccess('Review submitted! Navigating to dashboard...');
      setTimeout(() => {
        navigate('/customer/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Submit review failed:', err);
      setError(err.message || 'Could not register service review. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) return <Loader message="Connecting reviews portal..." />;
  if (error && !booking) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;
  if (!booking) return <Loader message="Booking details not found..." />;

  return (
    <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
      <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight="800" color="text.primary" gutterBottom sx={{ textAlign: 'center' }}>
            Rate Technician
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
            Rate your experience with our emergency responder. Your feedback helps maintain our high standards of service.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              {success}
            </Alert>
          )}

          
          {workerUser && workerProfile && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, mb: 4 }}>
              <Avatar 
                sx={{ 
                  bgcolor: 'secondary.main', 
                  color: '#0B192C', 
                  width: 56, 
                  height: 56, 
                  fontWeight: 800 
                }}
              >
                {workerUser.fullName?.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle1" fontWeight="700" color="text.primary">
                  {workerUser.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {workerProfile.skill} Specialist
                </Typography>
                <Box 
                  sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5, mt: 0.5, color: 'text.secondary' }}
                >
                  <Award size={14} color="#00B4D8" />
                  <Typography variant="caption" fontWeight="600" color="text.secondary">
                    Overall Rating: {workerProfile.rating.toFixed(1)} / 5.0
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          <Divider sx={{ mb: 4 }} />

          
          <ReviewForm
            onSubmit={handleReviewSubmit}
            loading={submitting}
          />
        </CardContent>
      </Card>
    </Container>
  );
};

export default ReviewPage;
