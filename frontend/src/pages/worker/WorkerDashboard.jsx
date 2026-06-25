import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
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
import { useTheme } from '@mui/material/styles';
import { ClipboardList, Wallet, AlertTriangle, ArrowRight, Play, CheckCircle2, ShieldCheck, Plus } from 'lucide-react';

import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { 
  getCitiesThunk, 
  getWorkerProfileByIdThunk, 
  createWorkerProfileThunk, 
  updateWorkerStatusThunk 
} from '../../store/slices/workerSlice';
import { getBookingsByWorkerThunk, getAvailableBookingsThunk } from '../../store/slices/bookingSlice';
import { SERVICE_TYPES } from '../../utils/constants';

import WorkerProfileCard from '../../components/worker/WorkerProfileCard';
import AvailabilityToggle from '../../components/worker/AvailabilityToggle';
import Loader from '../../components/common/Loader';


const WorkerDashboard = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const profile = useSelector((state) => state.worker.currentWorker);
  const bookings = useSelector((state) => state.booking.bookings);
  const cities = useSelector((state) => state.worker.cities);
  const availableRequests = useSelector((state) => state.booking.availableBookings);

  const { loading: workerLoading, error: workerError } = useSelector((state) => state.worker);
  const { loading: bookingLoading, error: bookingError } = useSelector((state) => state.booking);

  const loading = workerLoading || bookingLoading;

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  
  const [showSetup, setShowSetup] = useState(false);

  
  const isPredefined = SERVICE_TYPES.filter(t => t !== 'Other').includes(profile?.skill);
  const initialSkill = profile?.skill ? (isPredefined ? profile.skill : 'Other') : 'Electrician';
  const initialCustomSkill = profile?.skill && !isPredefined ? profile.skill : '';

  const profileFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      skill: initialSkill,
      customSkill: initialCustomSkill,
      experience: profile?.experience ?? 1,
      city: profile?.city || '',
      aadhaarNumber: profile?.aadhaarNumber || '',
    },
    validationSchema: Yup.object().shape({
      skill: Yup.string().required('Skill is required'),
      customSkill: Yup.string().when('skill', {
        is: 'Other',
        then: (schema) => schema.required('Please specify your custom skill/trade').min(3, 'Skill name must be at least 3 characters'),
        otherwise: (schema) => schema.notRequired()
      }),
      experience: Yup.number()
        .required('Experience is required')
        .min(0, 'Experience must be greater than or equal to 0'),
      city: Yup.string().required('Operating city is required'),
      aadhaarNumber: Yup.string()
        .required('Aadhaar number is required')
        .matches(/^\d{12}$/, 'Aadhaar number must be exactly 12 digits'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setError('');
      try {
        await dispatch(createWorkerProfileThunk({
          id: user.id,
          skill: values.skill === 'Other' ? values.customSkill : values.skill,
          experience: Number(values.experience),
          city: values.city,
          aadhaarNumber: values.aadhaarNumber,
        })).unwrap();
        setShowSetup(false);
        setSuccess('Profile configured successfully! Waiting for Admin verification.');
        
        await dispatch(getBookingsByWorkerThunk(user.id)).unwrap();
      } catch (err) {
        setError(err.message || 'Failed to configure profile.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setError('');
      
      try {
        await dispatch(getCitiesThunk()).unwrap();
      } catch (err) {
        console.warn('Could not load operating cities list:', err);
      }

      
      let workerProfile = null;
      try {
        workerProfile = await dispatch(getWorkerProfileByIdThunk(user.id)).unwrap();
      } catch (err) {
        setShowSetup(true);
      }

      if (workerProfile) {
        await dispatch(getBookingsByWorkerThunk(user.id)).unwrap();

        if (workerProfile.verified && workerProfile.status === 'AVAILABLE') {
          await dispatch(getAvailableBookingsThunk({
            skill: workerProfile.skill,
            city: workerProfile.city
          })).unwrap();
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard metrics.');
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
      await dispatch(updateWorkerStatusThunk({ id: user.id, status: newStatus })).unwrap();
      setSuccess(`Status updated to ${newStatus}`);
      loadData();
    } catch (err) {
      setError('Could not update status. Please try again.');
    }
  };



  if (loading) {
    return <Loader message="Accessing dispatcher feed..." />;
  }

  
  const assignedRequested = bookings.filter((b) => b.status === 'REQUESTED');
  const pendingRequests = [...assignedRequested];
  availableRequests.forEach((b) => {
    if (!pendingRequests.some((p) => p.id === b.id)) {
      pendingRequests.push(b);
    }
  });
  const activeJob = bookings.find((b) => ['ACCEPTED', 'ON_THE_WAY', 'WORK_STARTED'].includes(b.status));
  const completedJobsCount = bookings.filter((b) => ['WORK_COMPLETED', 'PAID'].includes(b.status)).length;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      
      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 3, borderRadius: 3 }}>
          {success}
        </Alert>
      )}
      {(error || workerError || bookingError) && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: 3 }}>
          {error || workerError || bookingError}
        </Alert>
      )}

      {showSetup ? (
        <Card sx={{ maxWidth: 550, mx: 'auto', mt: 4, border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="800" color="primary.main" gutterBottom>
                Complete Worker Profile
              </Typography>
              <Typography variant="body2" color="text.secondary">
                To start receiving local emergency calls, please fill in your trade details.
              </Typography>
            </Box>
            <form onSubmit={profileFormik.handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                 <TextField
                  select
                  name="skill"
                  label="Select Skill"
                  value={profileFormik.values.skill}
                  onChange={(e) => {
                    profileFormik.handleChange(e);
                    if (e.target.value !== 'Other') {
                      profileFormik.setFieldValue('customSkill', '');
                    }
                  }}
                  onBlur={profileFormik.handleBlur}
                  error={profileFormik.touched.skill && Boolean(profileFormik.errors.skill)}
                  helperText={profileFormik.touched.skill && profileFormik.errors.skill}
                  fullWidth
                >
                  {SERVICE_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>

                {profileFormik.values.skill === 'Other' && (
                  <TextField
                    name="customSkill"
                    label="Specify Custom Skill / Trade"
                    placeholder="e.g. Locksmith, Painter, Appliance Repair"
                    value={profileFormik.values.customSkill}
                    onChange={profileFormik.handleChange}
                    onBlur={profileFormik.handleBlur}
                    error={profileFormik.touched.customSkill && Boolean(profileFormik.errors.customSkill)}
                    helperText={profileFormik.touched.customSkill && profileFormik.errors.customSkill}
                    fullWidth
                  />
                )}

                <TextField
                  name="experience"
                  label="Years of Experience"
                  type="number"
                  value={profileFormik.values.experience}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                  error={profileFormik.touched.experience && Boolean(profileFormik.errors.experience)}
                  helperText={profileFormik.touched.experience && profileFormik.errors.experience}
                  fullWidth
                />

                {cities.length === 0 && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                    <AlertTitle>Operations Halted</AlertTitle>
                    We are currently not operating in any cities. Profile registration is temporarily unavailable.
                  </Alert>
                )}

                <TextField
                  select
                  name="city"
                  label="Operating City"
                  value={profileFormik.values.city}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                  error={profileFormik.touched.city && Boolean(profileFormik.errors.city)}
                  helperText={profileFormik.touched.city && profileFormik.errors.city}
                  fullWidth
                >
                  {cities.length > 0 ? (
                    cities.map((cityObj) => (
                      <MenuItem key={cityObj.id} value={cityObj.name}>
                        {cityObj.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled value="">
                      <em>Operations Halted</em>
                    </MenuItem>
                  )}
                </TextField>

                <TextField
                  name="aadhaarNumber"
                  label="Aadhaar Card Number"
                  placeholder="Enter 12-digit Aadhaar number"
                  value={profileFormik.values.aadhaarNumber}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                  error={profileFormik.touched.aadhaarNumber && Boolean(profileFormik.errors.aadhaarNumber)}
                  helperText={profileFormik.touched.aadhaarNumber && profileFormik.errors.aadhaarNumber}
                  fullWidth
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  fullWidth
                  size="large"
                  disabled={profileFormik.isSubmitting || cities.length === 0}
                  startIcon={<Plus size={18} />}
                  sx={{ py: 1.2, fontWeight: 'bold' }}
                >
                  {profileFormik.isSubmitting ? 'Setting up...' : 'Setup Worker Account'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      ) : (
        
        <>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
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
            
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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

            
            <Grid size={{ xs: 12, md: 7 }}>
              <Grid container spacing={3}>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
                    <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0, 245, 212, 0.1)', color: '#00F5D4' }}>
                          <ClipboardList size={24} />
                        </Box>
                        <Typography variant="subtitle2" fontWeight="700" color="text.secondary">
                          Pending Requests
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 2 }}>
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

                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
                    <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0, 180, 216, 0.1)', color: '#00B4D8' }}>
                          <CheckCircle2 size={24} />
                        </Box>
                        <Typography variant="subtitle2" fontWeight="700" color="text.secondary">
                          Completed Tasks
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 2 }}>
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

                
                <Grid size={12}>
                  <Card sx={{
                    p: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    background: theme.palette.mode === 'light'
                      ? 'linear-gradient(135deg, #FFFFFF 0%, #F1F5F9 100%)'
                      : 'linear-gradient(135deg, #0F1A30 0%, #16243F 100%)'
                  }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle1" fontWeight="800" color="primary.main" sx={{ mb: 2 }}>
                        Live Command Quick Links
                      </Typography>
                      <Divider sx={{ mb: 2, borderColor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)' }} />
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
                              bgcolor: theme.palette.mode === 'light' ? 'rgba(11, 25, 44, 0.04)' : 'rgba(0, 245, 212, 0.04)',
                              color: 'text.primary',
                              textAlign: 'left',
                              border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(11, 25, 44, 0.1)' : 'rgba(0, 245, 212, 0.1)'}`,
                              '&:hover': {
                                bgcolor: theme.palette.mode === 'light' ? 'rgba(11, 25, 44, 0.08)' : 'rgba(0, 245, 212, 0.08)'
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
