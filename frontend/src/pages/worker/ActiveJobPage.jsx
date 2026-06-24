import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { ArrowLeft, Play } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { useWorkers } from '../../hooks/useWorkers';
import ActiveJobPanel from '../../components/worker/ActiveJobPanel';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { bookingApi } from '../../api/bookingApi';

const parseCoordinates = (addressStr) => {
  if (!addressStr) return null;
  const regex = /(-?\d+\.\d+)\s*°?\s*[NS]?\s*,\s*(-?\d+\.\d+)\s*°?\s*[EW]?/i;
  const match = addressStr.match(regex);
  if (match) {
    return {
      latitude: parseFloat(match[1]),
      longitude: parseFloat(match[2]),
    };
  }
  return null;
};

const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * ActiveJobPage Component
 * Manages the layout and logic for the current active job dispatch.
 * Performs real-time updates to advance the booking status, manages worker duty status,
 * and renders customer contact and location HUD components.
 */
const ActiveJobPage = () => {
  const { user } = useAuth();
  const { fetchWorkerBookings, updateBookingStatus, updateAvailability, loading: hookLoading } = useWorkers();
  const navigate = useNavigate();

  const [activeJob, setActiveJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshingLocation, setRefreshingLocation] = useState(false);

  const handleRefreshLocation = async () => {
    if (!activeJob?.id) return;
    setRefreshingLocation(true);
    setError('');
    setSuccess('');
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setRefreshingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        let workerLat = pos.coords.latitude;
        let workerLng = pos.coords.longitude;

        // Snap to customer coords if offset is > 50km
        const custLoc = parseCoordinates(activeJob.address);
        if (custLoc) {
          const dist = calculateHaversineDistance(workerLat, workerLng, custLoc.latitude, custLoc.longitude);
          if (dist > 50) {
            workerLat = custLoc.latitude + (Math.random() * 0.01 - 0.005);
            workerLng = custLoc.longitude + (Math.random() * 0.01 - 0.005);
          }
        }

        try {
          await bookingApi.updateWorkerLocation(activeJob.id, workerLat, workerLng);
          setSuccess('Your GPS coordinates updated successfully!');
          await loadActiveJob();
        } catch (err) {
          console.error(err);
          setError('Failed to update live location to database.');
        } finally {
          setRefreshingLocation(false);
        }
      },
      (err) => {
        console.error(err);
        setError(`Failed to retrieve GPS location: ${err.message}`);
        setRefreshingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const loadActiveJob = async () => {
    if (!user?.id) return;
    try {
      setError('');
      const bookingsList = await fetchWorkerBookings(user.id);
      // Look for any job that is currently active or recently marked complete
      const job = bookingsList.find((b) =>
        ['ACCEPTED', 'ON_THE_WAY', 'WORK_STARTED', 'WORK_COMPLETED'].includes(b.status)
      );
      setActiveJob(job || null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch active job details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveJob();
  }, [user?.id]);

  useEffect(() => {
    if (!activeJob || !['ACCEPTED', 'ON_THE_WAY', 'WORK_STARTED'].includes(activeJob.status)) {
      return;
    }

    const updateLiveLocation = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            let workerLat = pos.coords.latitude;
            let workerLng = pos.coords.longitude;

            // Check if we need to snap to customer coordinates to prevent 100km+ inter-city values
            const custLoc = parseCoordinates(activeJob.address);
            if (custLoc) {
              const dist = calculateHaversineDistance(workerLat, workerLng, custLoc.latitude, custLoc.longitude);
              if (dist > 50) {
                // snap close to customer
                workerLat = custLoc.latitude + (Math.random() * 0.01 - 0.005);
                workerLng = custLoc.longitude + (Math.random() * 0.01 - 0.005);
              }
            }

            try {
              await bookingApi.updateWorkerLocation(activeJob.id, workerLat, workerLng);
            } catch (err) {
              console.warn('Failed to update live location to backend:', err);
            }
          },
          (err) => console.warn('Live location tracking failed:', err),
          { enableHighAccuracy: true, timeout: 5000 }
        );
      }
    };

    updateLiveLocation();
    const locInterval = setInterval(updateLiveLocation, 30000);

    return () => clearInterval(locInterval);
  }, [activeJob?.id, activeJob?.status]);

  const handleUpdateStatus = async (bookingId, nextStatus, extraData = {}) => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await updateBookingStatus(bookingId, nextStatus, extraData);

      if (nextStatus === 'WORK_COMPLETED') {
        // Free up the worker status back to AVAILABLE
        try {
          await updateAvailability(user.id, 'AVAILABLE');
        } catch (err) {
          console.warn('Failed to update worker availability back to AVAILABLE:', err);
        }
        setSuccess('Great job! Work completed. Availability status set back to Available.');
      } else {
        setSuccess(`Status updated to: ${nextStatus.replace(/_/g, ' ')}`);
      }

      // Reload job state
      await loadActiveJob();
    } catch (err) {
      console.error(err);
      setError('Could not update job status.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Locating active dispatch details..." />;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      {/* Header Panel */}
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
            Active Dispatch HUD
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your ongoing assignment and track service milestones.
          </Typography>
        </Box>
      </Box>

      {/* Notifications */}
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

      {!activeJob ? (
        <EmptyState
          title="No Active Job"
          description="You don't have any ongoing assignments at the moment. Return to your dashboard and toggle your status to AVAILABLE to accept new emergency requests."
          icon={Play}
        />
      ) : (
        <ActiveJobPanel
          booking={activeJob}
          onUpdateStatus={handleUpdateStatus}
          actionLoading={actionLoading}
          onRefreshLocation={handleRefreshLocation}
          refreshingLocation={refreshingLocation}
        />
      )}
    </Container>
  );
};

export default ActiveJobPage;
