import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Divider from '@mui/material/Divider';
import { ShieldAlert, PlusCircle, Wrench, Clock, FileText, CheckCircle2, DollarSign, Star, User } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { bookingApi } from '../../api/bookingApi';
import { paymentApi } from '../../api/paymentApi';
import { reviewApi } from '../../api/reviewApi';
import { workerApi } from '../../api/workerApi';
import { authApi } from '../../api/authApi';
import { SERVICE_TYPES } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import RatingStars from '../../components/common/RatingStars';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const Dashboard = () => {
  const { user } = useAuth();

  // Local State
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Booking Form State
  const [serviceType, setServiceType] = useState('Electrician');
  const [issueDescription, setIssueDescription] = useState('');
  const [address, setAddress] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // Booking Tracking Modal
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [assignedWorker, setAssignedWorker] = useState(null);
  const [assignedWorkerUser, setAssignedWorkerUser] = useState(null);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);

  // Payment State
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Review State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingApi.getBookingsByCustomer(user.id);
      // Sort bookings by newest first
      setBookings(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      setError('Failed to fetch bookings history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchBookings();
    }
  }, [user?.id]);

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!issueDescription || !address) {
      setError('Please provide the issue details and service location.');
      return;
    }

    setSubmittingBooking(true);
    setError('');
    setSuccess('');

    try {
      await bookingApi.createBooking({
        customerId: user.id,
        serviceType,
        issueDescription,
        address,
      });

      setSuccess('Emergency request submitted! Finding nearby helpers...');
      setIssueDescription('');
      setAddress('');
      fetchBookings();
    } catch (err) {
      setError('Failed to log booking request. Please try again.');
      console.error(err);
    } finally {
      setSubmittingBooking(false);
    }
  };

  // Timeline Tracker Steps mapping
  const getStepIndex = (status) => {
    switch (status) {
      case 'REQUESTED': return 0;
      case 'ACCEPTED': return 1;
      case 'ON_THE_WAY': return 2;
      case 'WORK_STARTED': return 3;
      case 'WORK_COMPLETED':
      case 'PAID': return 4;
      default: return 0;
    }
  };

  const trackingSteps = ['Requested', 'Accepted', 'On The Way', 'Work Started', 'Completed'];

  const handleOpenTracking = async (booking) => {
    setSelectedBooking(booking);
    setTrackingModalOpen(true);
    setAssignedWorker(null);
    setAssignedWorkerUser(null);
    setHasReviewed(false);

    if (booking.workerId) {
      try {
        // Fetch worker profile details
        const workerProfile = await workerApi.getProfileById(booking.workerId);
        setAssignedWorker(workerProfile);
        
        // Fetch worker user details (for name and phone)
        const workerUser = await authApi.getUserById(booking.workerId);
        setAssignedWorkerUser(workerUser);

        // Check if review already exists
        const reviews = await reviewApi.getReviewByBooking(booking.id);
        if (reviews && reviews.length > 0) {
          setHasReviewed(true);
        }
      } catch (err) {
        console.error('Error fetching worker details for tracking:', err);
      }
    }
  };

  const handlePay = async () => {
    if (!selectedBooking) return;
    setPaymentLoading(true);
    try {
      // 1. Submit Mock Payment
      await paymentApi.createPayment({
        bookingId: selectedBooking.id,
        amount: 500, // Flat rate for emergency dispatch
      });

      // 2. Update Booking Status
      const updatedBooking = await bookingApi.updateBookingStatus(selectedBooking.id, 'PAID');
      
      // Update local state
      setSelectedBooking(updatedBooking);
      setSuccess('Payment processed successfully!');
      fetchBookings();
    } catch (err) {
      console.error('Payment failed:', err);
      setError('Payment transaction failed. Please retry.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBooking || !assignedWorker) return;

    setSubmittingReview(true);
    try {
      await reviewApi.createReview({
        bookingId: selectedBooking.id,
        customerId: user.id,
        workerId: assignedWorker.id,
        rating: reviewRating,
        comment: reviewComment,
      });

      // Update worker overall rating
      const reviews = await reviewApi.getReviewsByWorker(assignedWorker.id);
      const avgRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
      await workerApi.updateProfile(assignedWorker.id, { rating: Number(avgRating.toFixed(1)) });

      setHasReviewed(true);
      setSuccess('Thank you for your feedback!');
      fetchBookings();
    } catch (err) {
      console.error('Submit review failed:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Compute metrics
  const totalRequests = bookings.length;
  const activeBookings = bookings.filter(b => !['WORK_COMPLETED', 'PAID', 'CANCELLED'].includes(b.status)).length;
  const completedBookings = bookings.filter(b => ['WORK_COMPLETED', 'PAID'].includes(b.status)).length;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Alert Notices */}
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

      {/* Metrics Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent display="flex" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0, 180, 216, 0.1)', color: '#00B4D8' }}>
                <Clock size={28} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight="500">
                  Active Requests
                </Typography>
                <Typography variant="h4" fontWeight="800">
                  {activeBookings}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent display="flex" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0, 245, 212, 0.1)', color: '#00F5D4' }}>
                <CheckCircle2 size={28} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight="500">
                  Completed Services
                </Typography>
                <Typography variant="h4" fontWeight="800">
                  {completedBookings}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent display="flex" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366F1' }}>
                <FileText size={28} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight="500">
                  Total Bookings
                </Typography>
                <Typography variant="h4" fontWeight="800">
                  {totalRequests}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Area */}
      <Grid container spacing={4}>
        {/* Create Request Column */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" sx={{ gap: 1.5, mb: 3 }}>
                <PlusCircle size={22} color="#00F5D4" />
                <Typography variant="h6" fontWeight="700">
                  Emergency Help Request
                </Typography>
              </Box>
              
              <form onSubmit={handleCreateBooking}>
                <Box display="flex" flexDirection="column" sx={{ gap: 3 }}>
                  <TextField
                    select
                    label="Service Type"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                          <Wrench size={18} />
                        </Box>
                      )
                    }}
                  >
                    {SERVICE_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Explain the Emergency"
                    multiline
                    rows={4}
                    placeholder="Describe the issue (e.g. power outlet sparked and blew fuse, kitchen faucet burst, etc.)"
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    fullWidth
                    required
                  />

                  <TextField
                    label="Service Address"
                    placeholder="Enter complete flat, street and layout address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    fullWidth
                    required
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    fullWidth
                    size="large"
                    disabled={submittingBooking}
                    sx={{ py: 1.2 }}
                  >
                    {submittingBooking ? 'Submitting request...' : 'Dispatch Request Now'}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* History Column */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="700" sx={{ mb: 3 }}>
                Request History
              </Typography>

              {loading ? (
                <Loader />
              ) : bookings.length === 0 ? (
                <EmptyState
                  title="No Service Bookings Yet"
                  description="Submit an emergency request on the left pane to match with top skilled workers."
                  icon={ShieldAlert}
                />
              ) : (
                <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
                  {bookings.map((booking, index) => (
                    <React.Fragment key={booking.id}>
                      <ListItem
                        alignItems="flex-start"
                        secondaryAction={
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleOpenTracking(booking)}
                          >
                            Track
                          </Button>
                        }
                        sx={{ px: 1, py: 1.8 }}
                      >
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" sx={{ gap: 1.5, mb: 0.5 }}>
                              <Typography variant="subtitle1" fontWeight="700">
                                {booking.serviceType}
                              </Typography>
                              <StatusBadge status={booking.status} />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.primary" sx={{ mb: 0.5 }} noWrap>
                                {booking.issueDescription}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Requested on: {formatDate(booking.createdAt)}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < bookings.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Booking Tracker + Payments + Reviews Dialog */}
      {selectedBooking && (
        <Dialog
          open={trackingModalOpen}
          onClose={() => setTrackingModalOpen(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: { borderRadius: 4, p: 1 }
          }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}>
            Request Tracker
            <StatusBadge status={selectedBooking.status} size="medium" />
          </DialogTitle>
          <DialogContent>
            {/* Timeline Stepper */}
            {selectedBooking.status !== 'CANCELLED' ? (
              <Box sx={{ width: '100%', py: 2 }}>
                <Stepper activeStep={getStepIndex(selectedBooking.status)} alternativeLabel>
                  {trackingSteps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>
            ) : (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                This emergency booking request was cancelled.
              </Alert>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Description Info */}
            <Typography variant="subtitle2" fontWeight="700" color="text.secondary" gutterBottom>
              Description of Emergency
            </Typography>
            <Typography variant="body2" color="text.primary" sx={{ mb: 2 }}>
              {selectedBooking.issueDescription}
            </Typography>

            <Typography variant="subtitle2" fontWeight="700" color="text.secondary" gutterBottom>
              Service Address
            </Typography>
            <Typography variant="body2" color="text.primary" sx={{ mb: 3 }}>
              {selectedBooking.address}
            </Typography>

            {/* Assigned Helper Card */}
            {assignedWorkerUser ? (
              <Card sx={{ bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', mb: 3 }}>
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box display="flex" alignItems="center" sx={{ gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', color: '#0B192C' }}>
                      <User size={18} />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight="700">
                        {assignedWorkerUser.fullName}
                      </Typography>
                      <Box display="flex" alignItems="center" sx={{ gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {assignedWorker?.experience} Years Experience
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          •
                        </Typography>
                        <RatingStars value={assignedWorker?.rating} showLabel />
                      </Box>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="caption" display="block" color="text.secondary">
                        Contact Info
                      </Typography>
                      <Typography variant="body2" fontWeight="700">
                        {assignedWorkerUser.phone}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ) : (
              selectedBooking.status === 'REQUESTED' && (
                <Alert severity="info" icon={<Clock />} sx={{ mb: 3, borderRadius: 2 }}>
                  Awaiting worker dispatch. We are checking availability...
                </Alert>
              )
            )}

            {/* Payment Section (Shown when work is completed) */}
            {selectedBooking.status === 'WORK_COMPLETED' && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(0, 245, 212, 0.05)', border: '1px dashed #00F5D4', borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight="700" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DollarSign size={18} color="#00F5D4" />
                  Dispatch Payment Due
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  The job is complete. Pay the helper's emergency service call rate.
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Amount Due
                    </Typography>
                    <Typography variant="h5" fontWeight="800">
                      {formatCurrency(500)}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handlePay}
                    disabled={paymentLoading}
                  >
                    {paymentLoading ? 'Processing...' : 'Pay Flat Rate'}
                  </Button>
                </Box>
              </Box>
            )}

            {/* Paid Notice */}
            {selectedBooking.status === 'PAID' && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                Service Paid. Thank you!
              </Alert>
            )}

            {/* Review Section (Shown when paid) */}
            {selectedBooking.status === 'PAID' && (
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle1" fontWeight="700" sx={{ mb: 1.5 }}>
                  Submit Rating & Feedback
                </Typography>

                {hasReviewed ? (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    Your feedback for this service request was submitted. Thank you!
                  </Alert>
                ) : (
                  <form onSubmit={handleReviewSubmit}>
                    <Box display="flex" flexDirection="column" sx={{ gap: 2 }}>
                      <Box display="flex" alignItems="center" sx={{ gap: 2 }}>
                        <Typography variant="body2">Rate the helper's service:</Typography>
                        <RatingStars
                          value={reviewRating}
                          readOnly={false}
                          onChange={(val) => setReviewRating(val)}
                        />
                      </Box>
                      <TextField
                        label="Your Comments"
                        placeholder="Write a brief comment about the technician's professionalism, speed, quality..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        fullWidth
                        multiline
                        rows={2}
                        required
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={submittingReview}
                        sx={{ alignSelf: 'flex-end' }}
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Feedback'}
                      </Button>
                    </Box>
                  </form>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setTrackingModalOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

export default Dashboard;
