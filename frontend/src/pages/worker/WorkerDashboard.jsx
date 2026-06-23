import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import { ClipboardList, Wallet, AlertTriangle, ArrowRight, Play, CheckCircle2, ShieldCheck, Plus } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { useWorkers } from '../../hooks/useWorkers';
import { workerApi } from '../../api/workerApi';
import { SERVICE_TYPES } from '../../utils/constants';

import WorkerProfileCard from '../../components/worker/WorkerProfileCard';
import AvailabilityToggle from '../../components/worker/AvailabilityToggle';
import Loader from '../../components/common/Loader';

/**
 * WorkerDashboard Component
 * The main panel for emergency workers. Shows their profile summary, lets them toggle live availability,
 * alerts them to pending bookings, and links them to dispatch & earnings portals.
 */
const WorkerDashboard = () => {
  const { user } = useAuth();
  const { fetchWorkerById, updateAvailability, fetchWorkerBookings, loading: hookLoading, error: hookError } = useWorkers();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile setup states for new/unconfigured workers
  const [showSetup, setShowSetup] = useState(false);
  const [skill, setSkill] = useState('Electrician');
  const [experience, setExperience] = useState(1);
  const [city, setCity] = useState('');
  const [submittingProfile, setSubmittingProfile] = useState(false);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setError('');
      // Fetch profile
      let workerProfile = null;
      try {
        workerProfile = await fetchWorkerById(user.id);
        setProfile(workerProfile);
        setSkill(workerProfile.skill || 'Electrician');
        setExperience(workerProfile.experience || 1);
        setCity(workerProfile.city || '');
      } catch (err) {
        // Profile not created yet
        setShowSetup(true);
      }

      if (workerProfile) {
        // Fetch bookings assigned to this worker
        const bookingsList = await fetchWorkerBookings(user.id);
        setBookings(bookingsList);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const handleStatusChange = async (newStatus) => {
    if (!profile) return;
    try {
      setError('');
      setSuccess('');
      const updatedProfile = await updateAvailability(user.id, newStatus);
      setProfile(updatedProfile);
      setSuccess(`Status updated to ${newStatus}`);
    } catch (err) {
      setError('Could not update status. Please try again.');
    }
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    if (!city) {
      setError('Please specify your city.');
      return;
    }
    setSubmittingProfile(true);
    setError('');
    try {
      const data = await workerApi.createProfile({
        id: user.id,
        skill,
        experience: Number(experience),
        city,
      });
      setProfile(data);
      setShowSetup(false);
      setSuccess('Profile configured successfully! Waiting for Admin verification.');
      // Refresh
      const bookingsList = await fetchWorkerBookings(user.id);
      setBookings(bookingsList);
    } catch (err) {
      setError('Failed to configure profile.');
    } finally {
      setSubmittingProfile(false);
    }
  };

  if (loading) {
    return <Loader message="Accessing dispatcher feed..." />;
  }

  // Filter lists based on status
  const pendingRequests = bookings.filter((b) => b.status === 'REQUESTED');
  const activeJob = bookings.find((b) => ['ACCEPTED', 'ON_THE_WAY', 'WORK_STARTED'].includes(b.status));
  const completedJobsCount = bookings.filter((b) => ['WORK_COMPLETED', 'PAID'].includes(b.status)).length;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Alert Notifications */}
      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 3, borderRadius: 3 }}>
          {success}
        </Alert>
      )}
      {(error || hookError) && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: 3 }}>
          {error || hookError}
        </Alert>
      )}

      {showSetup ? (
        /* Setup Form for unconfigured workers */
        <Card sx={{ maxWidth: 550, mx: 'auto', mt: 4, border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: 4 }}>
            <Box textAlign="center" sx={{ mb: 3 }}>
              <Typography variant="h5" fontWeight="800" color="primary.main" gutterBottom>
                Complete Worker Profile
              </Typography>
              <Typography variant="body2" color="text.secondary">
                To start receiving local emergency calls, please fill in your trade details.
              </Typography>
            </Box>
            <form onSubmit={handleCreateProfile}>
              <Box display="flex" flexDirection="column" sx={{ gap: 3 }}>
                <TextField
                  select
                  label="Select Skill"
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                  fullWidth
                >
                  {SERVICE_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Years of Experience"
                  type="number"
                  inputProps={{ min: 0 }}
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  fullWidth
                  required
                />

                <TextField
                  label="Operating City"
                  placeholder="Enter city you serve (e.g. Bangalore)"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  fullWidth
                  required
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  fullWidth
                  size="large"
                  disabled={submittingProfile}
                  startIcon={<Plus size={18} />}
                  sx={{ py: 1.2, fontWeight: 'bold' }}
                >
                  {submittingProfile ? 'Setting up...' : 'Setup Worker Account'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      ) : (
        /* Standard Worker Dashboard Grid */
        <>
          {/* Hero Welcome banner */}
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight="800" color="text.primary">
                Welcome back, {user?.fullName || 'Worker'}!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ready to handle emergency fix dispatches in your area.
              </Typography>
            </Box>
            {profile && !profile.verified && (
              <Chip
                icon={<AlertTriangle size={14} />}
                label="Verification Pending"
                color="warning"
                sx={{ fontWeight: 'bold' }}
              />
            )}
          </Box>

          {/* Active Job Alert Banner if one is in progress */}
          {activeJob && (
            <Alert
              severity="info"
              icon={<Play className="animate-pulse" />}
              action={
                <Button
                  color="info"
                  size="small"
                  onClick={() => navigate('/worker/active-job')}
                  endIcon={<ArrowRight size={14} />}
                  sx={{ fontWeight: 'bold' }}
                >
                  Resume Job
                </Button>
              }
              sx={{ mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'info.main' }}
            >
              <AlertTitle sx={{ fontWeight: 'bold' }}>Active Emergency Callout in Progress</AlertTitle>
              You have an ongoing {activeJob.serviceType} job. Location: <strong>{activeJob.address}</strong>.
            </Alert>
          )}

          <Grid container spacing={4}>
            {/* Left side: Profile summary & live availability */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Box display="flex" flexDirection="column" gap={3}>
                <WorkerProfileCard user={user} profile={profile} />

                {profile && (
                  <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
                    <CardContent sx={{ p: 3 }}>
                      <AvailabilityToggle
                        status={profile.status}
                        onChange={handleStatusChange}
                        disabled={!profile.verified}
                      />
                      {!profile.verified && (
                        <Typography variant="caption" color="warning.main" sx={{ mt: 1.5, display: 'block', fontWeight: 'bold' }}>
                          * You will be able to toggle availability once your profile is verified by administration.
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                )}
              </Box>
            </Grid>

            {/* Right side: Quick stats cards & navigation blocks */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Grid container spacing={3}>
                {/* Pending Bookings count card */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
                    <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0, 245, 212, 0.1)', color: '#00F5D4' }}>
                          <ClipboardList size={24} />
                        </Box>
                        <Typography variant="subtitle2" fontWeight="700" color="text.secondary">
                          Pending Requests
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="baseline" gap={1.5} sx={{ mb: 2 }}>
                        <Typography variant="h3" fontWeight="800">
                          {pendingRequests.length}
                        </Typography>
                        <Chip
                          label="INCOMING"
                          size="small"
                          color={pendingRequests.length > 0 ? "error" : "default"}
                          sx={{ fontSize: '0.65rem', fontWeight: 'bold', height: 18 }}
                        />
                      </Box>
                      <Box sx={{ mt: 'auto' }}>
                        <Button
                          component={Link}
                          to="/worker/requests"
                          variant="outlined"
                          color="secondary"
                          fullWidth
                          endIcon={<ArrowRight size={14} />}
                          sx={{ fontWeight: 'bold', border: '1.5px solid' }}
                        >
                          View Requests
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Total jobs completed card */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
                    <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0, 180, 216, 0.1)', color: '#00B4D8' }}>
                          <CheckCircle2 size={24} />
                        </Box>
                        <Typography variant="subtitle2" fontWeight="700" color="text.secondary">
                          Completed Tasks
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="baseline" gap={1.5} sx={{ mb: 2 }}>
                        <Typography variant="h3" fontWeight="800">
                          {completedJobsCount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight="700">
                          TOTAL COMPLETED JOBS
                        </Typography>
                      </Box>
                      <Box sx={{ mt: 'auto' }}>
                        <Button
                          component={Link}
                          to="/worker/earnings"
                          variant="outlined"
                          color="secondary"
                          fullWidth
                          endIcon={<ArrowRight size={14} />}
                          sx={{ fontWeight: 'bold', border: '1.5px solid' }}
                        >
                          View Earnings
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Quick Link Navigation Blocks */}
                <Grid size={12}>
                  <Card sx={{ p: 1, border: '1px solid', borderColor: 'divider', background: 'linear-gradient(135deg, #0F1A30 0%, #16243F 100%)' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle1" fontWeight="800" color="primary.main" sx={{ mb: 2 }}>
                        Live Command Quick Links
                      </Typography>
                      <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.05)' }} />
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Button
                            component={Link}
                            to="/worker/requests"
                            variant="text"
                            fullWidth
                            sx={{
                              justifyContent: 'space-between',
                              p: 2,
                              borderRadius: 3,
                              bgcolor: 'rgba(0, 245, 212, 0.04)',
                              color: 'text.primary',
                              textAlign: 'left',
                              border: '1px solid rgba(0, 245, 212, 0.1)',
                              '&:hover': {
                                bgcolor: 'rgba(0, 245, 212, 0.08)'
                              }
                            }}
                          >
                            <Box>
                              <Typography variant="body2" fontWeight="800">
                                Incoming Requests Panel
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Review emergency repair dispatches
                              </Typography>
                            </Box>
                            <ArrowRight size={18} />
                          </Button>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Button
                            component={Link}
                            to="/worker/earnings"
                            variant="text"
                            fullWidth
                            sx={{
                              justifyContent: 'space-between',
                              p: 2,
                              borderRadius: 3,
                              bgcolor: 'rgba(0, 180, 216, 0.04)',
                              color: 'text.primary',
                              textAlign: 'left',
                              border: '1px solid rgba(0, 180, 216, 0.1)',
                              '&:hover': {
                                bgcolor: 'rgba(0, 180, 216, 0.08)'
                              }
                            }}
                          >
                            <Box>
                              <Typography variant="body2" fontWeight="800">
                                Earnings & Metrics
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Track payouts, jobs, and history
                              </Typography>
                            </Box>
                            <ArrowRight size={18} />
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
};

export default WorkerDashboard;
