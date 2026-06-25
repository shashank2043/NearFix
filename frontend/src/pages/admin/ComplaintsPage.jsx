import React, { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import { AlertOctagon, ShieldAlert, Filter } from 'lucide-react';

import { useDispatch, useSelector } from 'react-redux';
import { getUserByIdThunk } from '../../store/slices/authSlice';
import { getAllWorkersThunk, verifyWorkerThunk } from '../../store/slices/workerSlice';
import { getAllBookingsThunk } from '../../store/slices/bookingSlice';
import { getAllReviewsThunk } from '../../store/slices/reviewSlice';
import AdminHeader from '../../components/admin/AdminHeader';
import ComplaintTable from '../../components/admin/ComplaintTable';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { useTheme } from '@mui/material/styles';

const ComplaintsPage = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const bookings = useSelector((state) => state.booking.bookings);
  const reviews = useSelector((state) => state.review.reviews);
  const workers = useSelector((state) => state.worker.workers);
  const users = useSelector((state) => state.auth.usersList);

  const [selectedService, setSelectedService] = useState('All');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      await dispatch(getAllBookingsThunk()).unwrap();
      await dispatch(getAllReviewsThunk()).unwrap();
      await dispatch(getAllWorkersThunk()).unwrap();
      await dispatch(getUserByIdThunk('')).unwrap();
    } catch (err) {
      console.error(err);
      setError('Could not compile system reviews and complaints databases.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  
  const getComplaints = () => {
    return reviews
      .filter(r => Number(r.rating) <= 2)
      .map(r => {
        const b = bookings.find(booking => booking.id === r.bookingId) || {};
        return {
          ...b,
          id: b.id || r.bookingId,
          customerId: b.customerId || r.customerId,
          workerId: b.workerId || r.workerId,
          serviceType: b.serviceType || 'Unknown',
          rating: r.rating,
          comment: r.comment || 'No comment provided.',
        };
      });
  };

  const complaints = getComplaints();

  
  const getServiceTypes = () => {
    const services = complaints.map(c => c.serviceType).filter(Boolean);
    return ['All', ...new Set(services)];
  };

  const serviceTypesList = getServiceTypes();

  
  const filteredComplaints = selectedService === 'All'
    ? complaints
    : complaints.filter(c => c.serviceType === selectedService);

  const handleFlagWorker = async (workerId) => {
    try {
      setError('');
      setSuccess('');

      await dispatch(verifyWorkerThunk({ id: workerId, verified: false })).unwrap();

      setSuccess(`Worker ID ${workerId} has been flagged for low quality reports.`);
      await loadData();
    } catch (err) {
      console.error(err);
      setError('Failed to flag worker profile.');
    }
  };

  if (loading) {
    return <Loader message="Accessing customer ticketing desks..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      
      <AdminHeader 
        title="Complaints & Quality Desk" 
        subtitle="Audit emergency calls that received low customer reviews (rating ≤ 2). Flag workers who breach compliance rules."
      />

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

      
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Filter size={18} color={theme.palette.secondary.main} />
            <Typography variant="subtitle2" fontWeight="700">
              Filter Complaints
            </Typography>
          </Box>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="service-filter-label">Service Type</InputLabel>
            <Select
              labelId="service-filter-label"
              id="service-filter"
              value={selectedService}
              label="Service Type"
              onChange={(e) => setSelectedService(e.target.value)}
            >
              {serviceTypesList.map((service) => (
                <MenuItem key={service} value={service}>
                  {service}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      
      {filteredComplaints.length === 0 ? (
        <EmptyState 
          title="No Active Complaints"
          description={
            selectedService === 'All' 
              ? "Wonderful! There are currently no completed jobs with low ratings (≤ 2 stars)."
              : `No complaints found for service category: ${selectedService}.`
          }
          icon={AlertOctagon}
        />
      ) : (
        <ComplaintTable 
          bookings={filteredComplaints}
          users={users}
          workers={workers}
          onFlagWorker={handleFlagWorker}
        />
      )}
    </Container>
  );
};

export default ComplaintsPage;
