import React, { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import { UserCheck, ShieldAlert, ShieldCheck, Users, Search } from 'lucide-react';

import { useDispatch, useSelector } from 'react-redux';
import { getAllWorkersThunk, verifyWorkerThunk } from '../../store/slices/workerSlice';
import { getUserByIdThunk } from '../../store/slices/authSlice';
import AdminHeader from '../../components/admin/AdminHeader';
import WorkerVerificationCard from '../../components/admin/WorkerVerificationCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { useTheme } from '@mui/material/styles';

const WorkerVerificationPage = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const workers = useSelector((state) => state.worker.workers);
  const users = useSelector((state) => state.auth.usersList);
  
  
  const [tabValue, setTabValue] = useState(1); 

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      await dispatch(getAllWorkersThunk()).unwrap();
      await dispatch(getUserByIdThunk('')).unwrap();
    } catch (err) {
      console.error(err);
      setError('Failed to fetch worker database registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id) => {
    try {
      setError('');
      setSuccess('');
      
      await dispatch(verifyWorkerThunk({ id, verified: true })).unwrap();

      setSuccess('Worker profile approved and activated successfully.');
      await loadData();
    } catch (err) {
      console.error(err);
      setError('Failed to approve worker profile.');
    }
  };

  const handleReject = async (id) => {
    try {
      setError('');
      setSuccess('');

      await dispatch(verifyWorkerThunk({ id, verified: false })).unwrap();

      setSuccess('Worker profile rejected.');
      await loadData();
    } catch (err) {
      console.error(err);
      setError('Failed to reject worker profile.');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSuccess('');
    setError('');
  };

  
  const getWorkerUser = (workerId) => {
    return users.find(u => u.id === workerId) || {};
  };

  
  const getFilteredWorkers = () => {
    return workers.filter(worker => {
      
      const status = worker.verificationStatus || (worker.verified ? 'APPROVED' : 'PENDING');
      
      switch (tabValue) {
        case 1: 
          return status === 'PENDING' || (!worker.verified && worker.verificationStatus !== 'REJECTED' && worker.verificationStatus !== 'APPROVED');
        case 2: 
          return status === 'APPROVED' || worker.verified === true;
        case 3: 
          return status === 'REJECTED';
        case 0: 
        default:
          return true;
      }
    });
  };

  const filteredWorkers = getFilteredWorkers();

  if (loading) {
    return <Loader message="Accessing credential databases..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      
      <AdminHeader 
        title="Worker Verification Workspace" 
        subtitle="Manage and inspect emergency technician profiles, credentials, and identity verification numbers."
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

      
      <Paper 
        sx={{ 
          mb: 4, 
          borderRadius: 3, 
          boxShadow: 'none', 
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden'
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 700,
              fontSize: '0.85rem',
              py: 2,
              gap: 0.8
            }
          }}
        >
          <Tab icon={<Users size={16} />} iconPosition="start" label="All Workers" />
          <Tab icon={<ShieldAlert size={16} />} iconPosition="start" label="Pending Verification" />
          <Tab icon={<ShieldCheck size={16} />} iconPosition="start" label="Approved" />
          <Tab icon={<UserCheck size={16} />} iconPosition="start" label="Rejected" />
        </Tabs>
      </Paper>

      
      {filteredWorkers.length === 0 ? (
        <EmptyState 
          title={
            tabValue === 1 
              ? "All Clear!" 
              : tabValue === 2 
              ? "No Approved Workers" 
              : tabValue === 3 
              ? "No Rejected Workers" 
              : "No Workers Found"
          }
          description={
            tabValue === 1 
              ? "There are currently no technician profiles awaiting verification."
              : "No workers match the selected verification filter."
          }
          icon={tabValue === 1 ? ShieldCheck : Search}
        />
      ) : (
        <Grid container spacing={3}>
          {filteredWorkers.map(worker => (
            <Grid size={{ xs: 12, md: 6 }} key={worker.id}>
              <WorkerVerificationCard 
                worker={worker}
                workerUser={getWorkerUser(worker.id)}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default WorkerVerificationPage;
