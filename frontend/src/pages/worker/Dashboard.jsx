import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
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
import Divider from '@mui/material/Divider';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import { ShieldCheck, ToggleLeft, ClipboardList, Wallet, User, CheckCircle2, AlertTriangle, MapPin, Award } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { bookingApi } from '../../api/bookingApi';
import { workerApi } from '../../api/workerApi';
import { paymentApi } from '../../api/paymentApi';
import { authApi } from '../../api/authApi';
import { SERVICE_TYPES } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import RatingStars from '../../components/common/RatingStars';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const Dashboard = () => {
  const { user, setUser } = useAuth();

  
  const [tabValue, setTabValue] = useState(0);

  
  const [loading, setLoading] = useState(true);
  const [workerProfile, setWorkerProfile] = useState(null);
  const [availableRequests, setAvailableRequests] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cities, setCities] = useState([]);

  
  const profileFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      skill: workerProfile?.skill || 'Electrician',
      experience: workerProfile?.experience ?? 1,
      city: workerProfile?.city || '',
    },
    validationSchema: Yup.object().shape({
      skill: Yup.string().required('Skill is required'),
      experience: Yup.number()
        .required('Experience is required')
        .min(0, 'Experience must be greater than or equal to 0'),
      city: Yup.string().required('Operating city is required'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setError('');
      setSuccess('');
      try {
        let data;
        if (workerProfile) {
          data = await workerApi.updateProfile(user.id, {
            skill: values.skill,
            experience: Number(values.experience),
            city: values.city,
          });
          setSuccess('Profile updated successfully!');
        } else {
          data = await workerApi.createProfile({
            id: user.id,
            skill: values.skill,
            experience: Number(values.experience),
            city: values.city,
          });
          setSuccess('Profile initialized successfully! Awaiting verification by Admin.');
        }
        setWorkerProfile(data);
        loadDashboardData();
      } catch (err) {
        setError(workerProfile ? 'Failed to save profile modifications.' : 'Failed to configure profile.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      
      try {
        const list = await workerApi.getCities();
        setCities(list);
      } catch (err) {
        console.warn('Could not load operating cities list:', err);
      }

      
      let profile;
      try {
        profile = await workerApi.getProfileById(user.id);
        setWorkerProfile(profile);
      } catch (err) {
        
        console.warn('Worker profile not found. Need creation.');
      }

      if (profile) {
        
        const allBookings = await bookingApi.getAllBookings();
        
        
        const matchedRequests = allBookings.filter(
          (b) => b.status === 'REQUESTED' && b.serviceType === profile.skill
        );
        setAvailableRequests(matchedRequests);

        
        const workerAssignedJobs = allBookings.filter(
          (b) => b.workerId === user.id && ['ACCEPTED', 'ON_THE_WAY', 'WORK_STARTED'].includes(b.status)
        );
        setActiveJobs(workerAssignedJobs);

        
        const payments = await paymentApi.getAllPayments();
        
        const completedBookingIds = allBookings
          .filter((b) => b.workerId === user.id && ['WORK_COMPLETED', 'PAID'].includes(b.status))
          .map((b) => b.id);
        const workerPayments = payments.filter((p) => completedBookingIds.includes(p.bookingId) && (p.status === 'COMPLETED' || p.status === 'SUCCESS'));
        const totalEarnings = workerPayments.reduce((sum, current) => sum + current.amount, 0);
        setEarnings(totalEarnings);
      }
    } catch (err) {
      setError('Error loading portal metrics.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);



  const handleAvailabilityToggle = async () => {
    if (!workerProfile) return;
    const newStatus = workerProfile.status === 'AVAILABLE' ? 'OFFLINE' : 'AVAILABLE';
    try {
      const updated = await workerApi.updateStatus(user.id, newStatus);
      setWorkerProfile(updated);
      setSuccess(`Your status is updated to ${newStatus === 'AVAILABLE' ? 'Online' : 'Offline'}`);
      loadDashboardData();
    } catch (err) {
      setError('Could not modify online status.');
    }
  };

  const handleAcceptJob = async (bookingId) => {
    try {
      
      await bookingApi.assignWorker(bookingId, user.id);
      
      
      const updatedProfile = await workerApi.updateStatus(user.id, 'BUSY');
      setWorkerProfile(updatedProfile);

      setSuccess('Emergency job accepted! Proceed to location.');
      loadDashboardData();
    } catch (err) {
      setError('Could not accept job request.');
    }
  };

  const handleUpdateJobStatus = async (bookingId, currentStatus) => {
    let nextStatus = '';
    if (currentStatus === 'ACCEPTED') nextStatus = 'ON_THE_WAY';
    else if (currentStatus === 'ON_THE_WAY') nextStatus = 'WORK_STARTED';
    else if (currentStatus === 'WORK_STARTED') nextStatus = 'WORK_COMPLETED';

    try {
      await bookingApi.updateBookingStatus(bookingId, nextStatus);
      
      if (nextStatus === 'WORK_COMPLETED') {
        
        const updatedProfile = await workerApi.updateStatus(user.id, 'AVAILABLE');
        setWorkerProfile(updatedProfile);
        setSuccess('Work completed! Earnings added to your ledger.');
      } else {
        setSuccess(`Status advanced to: ${nextStatus.replace(/_/g, ' ')}`);
      }
      loadDashboardData();
    } catch (err) {
      setError('Failed to update job status.');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };

  if (loading) return <Loader message="Verifying profile metrics..." />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      
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

      
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }} color="secondary">
        <Tab label="Worker Dashboard" icon={<ClipboardList size={16} />} iconPosition="start" />
        <Tab label="Profile Details" icon={<User size={16} />} iconPosition="start" />
      </Tabs>

      {tabValue === 0 && (
        <>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0, 245, 212, 0.1)', color: '#00F5D4' }}>
                    <ClipboardList size={28} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="500">
                      Available Requests
                    </Typography>
                    <Typography variant="h4" fontWeight="800">
                      {workerProfile?.verified && workerProfile?.status === 'AVAILABLE' ? availableRequests.length : 0}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0, 180, 216, 0.1)', color: '#00B4D8' }}>
                    <CheckCircle2 size={28} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="500">
                      Active Assigned Jobs
                    </Typography>
                    <Typography variant="h4" fontWeight="800">
                      {activeJobs.length}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366F1' }}>
                    <Wallet size={28} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="500">
                      Today's Earnings
                    </Typography>
                    <Typography variant="h4" fontWeight="800">
                      {formatCurrency(earnings)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Profile Warning banner */}
          {!workerProfile ? (
            <Alert severity="warning" sx={{ mb: 4, borderRadius: 3 }}>
              You do not have a worker profile configured. Click on the <strong>Profile Details</strong> tab above to initialize your setup and start accepting jobs.
            </Alert>
          ) : !workerProfile.verified ? (
            <Alert severity="info" icon={<AlertTriangle />} sx={{ mb: 4, borderRadius: 3 }}>
              Your profile is awaiting Admin Verification. You will be able to mark yourself Available once verified.
            </Alert>
          ) : (
            /* Availability toggle if verified */
            <Card sx={{ mb: 4, bgcolor: 'background.paper' }}>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.8, '&:last-child': { pb: 1.8 } }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="700">
                    Real-time Availability Status
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Go online to receive matching local emergency requests.
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={workerProfile.status === 'AVAILABLE'}
                      onChange={handleAvailabilityToggle}
                      color="primary"
                    />
                  }
                  label={
                    <Chip
                      label={workerProfile.status}
                      color={workerProfile.status === 'AVAILABLE' ? 'success' : 'default'}
                      size="small"
                      fontWeight="bold"
                    />
                  }
                  labelPlacement="start"
                />
              </CardContent>
            </Card>
          )}

          {workerProfile?.verified && (
            <Grid container spacing={4}>
              {/* Active Jobs Section */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="700" sx={{ mb: 3 }}>
                      Active Dispatch Job
                    </Typography>

                    {activeJobs.length === 0 ? (
                      <EmptyState
                        title="No Active Jobs Assigned"
                        description="Toggle your status online to accept available requests when dispatched."
                        icon={ClipboardList}
                      />
                    ) : (
                      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                        {activeJobs.map((job, idx) => (
                          <React.Fragment key={job.id}>
                            <Box sx={{ py: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle1" fontWeight="700">
                                  {job.serviceType} Callout
                                </Typography>
                                <StatusBadge status={job.status} />
                              </Box>
                              <Typography variant="body2" color="text.secondary" paragraph>
                                <strong>Description:</strong> {job.issueDescription}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                                <MapPin size={16} /> <strong>Address:</strong> {job.address}
                              </Typography>
                              
                              <Box display="flex" sx={{ gap: 2 }}>
                                {job.status === 'ACCEPTED' && (
                                  <Button
                                    variant="contained"
                                    color="info"
                                    fullWidth
                                    onClick={() => handleUpdateJobStatus(job.id, 'ACCEPTED')}
                                  >
                                    Navigate to Location
                                  </Button>
                                )}
                                {job.status === 'ON_THE_WAY' && (
                                  <Button
                                    variant="contained"
                                    color="secondary"
                                    fullWidth
                                    onClick={() => handleUpdateJobStatus(job.id, 'ON_THE_WAY')}
                                  >
                                    Start Repair Work
                                  </Button>
                                )}
                                {job.status === 'WORK_STARTED' && (
                                  <Button
                                    variant="contained"
                                    color="success"
                                    fullWidth
                                    onClick={() => handleUpdateJobStatus(job.id, 'WORK_STARTED')}
                                  >
                                    Confirm Fix Complete
                                  </Button>
                                )}
                              </Box>
                            </Box>
                            {idx < activeJobs.length - 1 && <Divider />}
                          </React.Fragment>
                        ))}
                      </List>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Available Job Listings */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="700" sx={{ mb: 3 }}>
                      Available Local Requests ({workerProfile.skill})
                    </Typography>

                    {workerProfile.status !== 'AVAILABLE' ? (
                      <Alert severity="warning" sx={{ borderRadius: 2 }}>
                        You must turn your status <strong>ONLINE</strong> (Available) to browse and accept matching emergency jobs.
                      </Alert>
                    ) : availableRequests.length === 0 ? (
                      <EmptyState
                        title="No Emergency Requests Available"
                        description="All matching requests in your area have been assigned."
                        icon={ClipboardList}
                      />
                    ) : (
                      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                        {availableRequests.map((req, idx) => (
                          <React.Fragment key={req.id}>
                            <ListItem
                              alignItems="flex-start"
                              secondaryAction={
                                <Button
                                  variant="contained"
                                  color="secondary"
                                  size="small"
                                  onClick={() => handleAcceptJob(req.id)}
                                >
                                  Accept Call
                                </Button>
                              }
                              sx={{ px: 0, py: 2 }}
                            >
                              <ListItemText
                                disableTypography
                                primary={
                                  <Typography variant="subtitle1" fontWeight="700">
                                    Emergency Callout #{req.id}
                                  </Typography>
                                }
                                secondary={
                                  <Box>
                                    <Typography variant="body2" color="text.primary" sx={{ my: 0.5 }}>
                                      {req.issueDescription}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      Location: {req.address}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Dispatched: {formatDate(req.createdAt)}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                            {idx < availableRequests.length - 1 && <Divider />}
                          </React.Fragment>
                        ))}
                      </List>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </>
      )}

      {tabValue === 1 && (
        <Card sx={{ maxWidth: 600, mx: 'auto' }}>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mb: 4 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64, fontSize: '1.8rem' }}>
                {user.fullName.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" fontWeight="700">
                  {user.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email} | {user.phone}
                </Typography>
                
                {workerProfile && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Award size={16} color="#00B4D8" />
                      <Typography variant="body2" fontWeight="700">
                        {workerProfile.rating.toFixed(1)} / 5.0
                      </Typography>
                    </Box>
                    <Box sx={{ borderRight: '1px solid', borderColor: 'divider', height: 14 }} />
                    <Chip
                      icon={workerProfile.verified ? <ShieldCheck size={14} /> : undefined}
                      label={workerProfile.verified ? 'Verified Profile' : 'Awaiting Review'}
                      color={workerProfile.verified ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                )}
              </Box>
            </Box>

            <Divider sx={{ mb: 4 }} />

            <form onSubmit={profileFormik.handleSubmit}>
              <Box display="flex" flexDirection="column" sx={{ gap: 3 }}>
                <TextField
                  select
                  name="skill"
                  label="Select Skill"
                  value={profileFormik.values.skill}
                  onChange={profileFormik.handleChange}
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

                <TextField
                  name="experience"
                  label="Experience (in Years)"
                  type="number"
                  value={profileFormik.values.experience}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                  error={profileFormik.touched.experience && Boolean(profileFormik.errors.experience)}
                  helperText={profileFormik.touched.experience && profileFormik.errors.experience}
                  fullWidth
                />

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
                  {(cities.length > 0 ? cities : [
                    { id: 'blr', name: 'Bangalore' },
                    { id: 'mum', name: 'Mumbai' },
                    { id: 'del', name: 'Delhi' }
                  ]).map((cityObj) => (
                    <MenuItem key={cityObj.id} value={cityObj.name}>
                      {cityObj.name}
                    </MenuItem>
                  ))}
                </TextField>

                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  fullWidth
                  size="large"
                  disabled={profileFormik.isSubmitting}
                  sx={{ py: 1.2 }}
                >
                  {profileFormik.isSubmitting
                    ? 'Saving changes...'
                    : workerProfile
                    ? 'Save Profile modifications'
                    : 'Configure Worker Profile'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default Dashboard;
