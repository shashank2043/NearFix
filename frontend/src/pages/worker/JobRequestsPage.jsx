import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { ArrowLeft, ClipboardList } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { useWorkers } from '../../hooks/useWorkers';
import { workerApi } from '../../api/workerApi';
import { bookingApi } from '../../api/bookingApi';
import JobRequestCard from '../../components/worker/JobRequestCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

/**
 * JobRequestsPage Component
 * Lists incoming emergency booking requests assigned to the logged-in worker.
 * Allows the worker to accept a job (which puts them on duty/busy and opens the tracking panel)
 * or reject a job (which opens the booking back up to other local providers).
 */
const JobRequestsPage = () => {
  const { user } = useAuth();
  const { fetchWorkerBookings, updateBookingStatus, updateAvailability, loading: hookLoading } = useWorkers();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadRequests = async () => {
    if (!user?.id) return;
    try {
      setError('');
      
      // 1. Fetch worker profile details
      const profile = await workerApi.getProfileById(user.id);
      
      if (profile && profile.verified && profile.status === 'AVAILABLE') {
        // 2. Fetch unassigned requests matching skill & city
        const available = await bookingApi.getAvailableBookings(profile.skill, profile.city);
        
        // 3. Fetch pre-assigned requested bookings (if any)
        const bookingsList = await fetchWorkerBookings(user.id);
        const assignedRequested = bookingsList.filter((b) => b.status === 'REQUESTED');
        
        // 4. Merge lists ensuring no duplicates
        const merged = [...assignedRequested];
        available.forEach((b) => {
          if (!merged.some((m) => m.id === b.id)) {
            merged.push(b);
          }
        });
        
        setRequests(merged);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve job requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [user?.id]);

  const handleAccept = async (bookingId) => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      // 1. Advance booking status to ACCEPTED (atomic backend assignment)
      await updateBookingStatus(bookingId, 'ACCEPTED');

      // 2. Mark worker availability status as BUSY
      try {
        await updateAvailability(user.id, 'BUSY');
      } catch (err) {
        console.warn('Could not update worker availability to BUSY:', err);
      }

      setSuccess('Job accepted successfully! Proceeding to dispatch tracking.');
      
      // Navigate to Active Job Page after a brief moment
      setTimeout(() => {
        navigate('/worker/active-job');
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Failed to accept job request.');
      setActionLoading(false);
    }
  };

  const handleReject = async (bookingId) => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      // Re-opens booking for other workers by status: REQUESTED and workerId: null
      await updateBookingStatus(bookingId, 'REQUESTED', { workerId: null });
      setSuccess('Job request rejected. It is now re-opened for other providers.');
      
      // Reload bookings to reflect the update
      await loadRequests();
    } catch (err) {
      console.error(err);
      setError('Failed to reject job request.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Accessing dispatcher network..." />;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      {/* Page Header */}
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
            Incoming Job Requests
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review and accept urgent local requests matching your skill.
          </Typography>
        </Box>
      </Box>

      {/* Alert Notifications */}
      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 3, borderRadius: 3 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      {requests.length === 0 ? (
        <EmptyState
          title="No Incoming Requests"
          description="There are currently no emergency job assignments awaiting your confirmation. Go online and wait for a dispatch call."
          icon={ClipboardList}
        />
      ) : (
        <Grid container spacing={3}>
          {requests.map((booking) => (
            <Grid size={12} key={booking.id}>
              <JobRequestCard
                booking={booking}
                onAccept={handleAccept}
                onReject={handleReject}
                actionLoading={actionLoading}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default JobRequestsPage;
