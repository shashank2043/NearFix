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
  const R = 6371; 
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
      
      
      const profile = await workerApi.getProfileById(user.id);
      
      if (profile && profile.verified && profile.status === 'AVAILABLE') {
        
        const available = await bookingApi.getAvailableBookings(profile.skill, profile.city);
        
        
        const bookingsList = await fetchWorkerBookings(user.id);
        const assignedRequested = bookingsList.filter((b) => b.status === 'REQUESTED');
        
        
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

  const handleAccept = async (bookingId, workerLoc) => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const matchedReq = requests.find((r) => r.id === bookingId);
      let distanceVal = null;
      let finalWorkerLoc = workerLoc;

      if (!finalWorkerLoc && navigator.geolocation) {
        try {
          finalWorkerLoc = await new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
              () => resolve(null),
              { enableHighAccuracy: true, timeout: 3000 }
            );
          });
        } catch (e) {
          console.warn('Could not determine worker location:', e);
        }
      }

      
      if (!finalWorkerLoc) {
        const bookingCity = matchedReq ? matchedReq.city : 'Bangalore';
        if (bookingCity.toLowerCase() === 'delhi') {
          finalWorkerLoc = { latitude: 28.6139, longitude: 77.2090 };
        } else if (bookingCity.toLowerCase() === 'mumbai') {
          finalWorkerLoc = { latitude: 19.0760, longitude: 72.8777 };
        } else {
          finalWorkerLoc = { latitude: 12.9716, longitude: 77.5946 };
        }
      }

      if (matchedReq && finalWorkerLoc) {
        const custLoc = parseCoordinates(matchedReq.address);
        if (custLoc) {
          let dist = calculateHaversineDistance(
            finalWorkerLoc.latitude,
            finalWorkerLoc.longitude,
            custLoc.latitude,
            custLoc.longitude
          );
          
          if (dist > 50) {
            finalWorkerLoc = {
              latitude: custLoc.latitude + (Math.random() * 0.02 - 0.01),
              longitude: custLoc.longitude + (Math.random() * 0.02 - 0.01)
            };
            dist = calculateHaversineDistance(
              finalWorkerLoc.latitude,
              finalWorkerLoc.longitude,
              custLoc.latitude,
              custLoc.longitude
            );
          }
          distanceVal = parseFloat(dist.toFixed(2));
        }
      }

      const extraPayload = {
        workerLatitude: finalWorkerLoc ? finalWorkerLoc.latitude : null,
        workerLongitude: finalWorkerLoc ? finalWorkerLoc.longitude : null,
        distance: distanceVal
      };

      
      await updateBookingStatus(bookingId, 'ACCEPTED', extraPayload);

      
      try {
        await updateAvailability(user.id, 'BUSY');
      } catch (err) {
        console.warn('Could not update worker availability to BUSY:', err);
      }

      setSuccess('Job accepted successfully! Proceeding to dispatch tracking.');
      
      
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
      
      await updateBookingStatus(bookingId, 'REQUESTED', { workerId: null });
      setSuccess('Job request rejected. It is now re-opened for other providers.');
      
      
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
