import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import { MapPin, Phone, User, CheckCircle2, Navigation, ShieldCheck, AlertCircle, Play, RefreshCw } from 'lucide-react';
import { authApi } from '../../api/authApi';

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


const STEPS = [
  { label: 'Accepted', status: 'ACCEPTED' },
  { label: 'On The Way', status: 'ON_THE_WAY' },
  { label: 'Work Started', status: 'WORK_STARTED' },
  { label: 'Completed', status: 'WORK_COMPLETED' }
];

const getActiveStep = (status) => {
  switch (status) {
    case 'ACCEPTED':
      return 0;
    case 'ON_THE_WAY':
      return 1;
    case 'WORK_STARTED':
      return 2;
    case 'WORK_COMPLETED':
      return 3;
    default:
      return 0;
  }
};


const ActiveJobPanel = ({ booking, onUpdateStatus, actionLoading = false, onRefreshLocation, refreshingLocation = false }) => {
  const { id, customerId, serviceType, issueDescription, address, status, workerLatitude, workerLongitude, distance } = booking;
  const [customerName, setCustomerName] = useState('Loading Customer...');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchCustomerInfo = async () => {
      try {
        const user = await authApi.getUserById(customerId);
        if (isMounted) {
          setCustomerName(user.fullName || 'Anonymous Customer');
          setCustomerPhone(user.phone || 'No phone provided');
          setCustomerEmail(user.email || '');
        }
      } catch (err) {
        console.error('Failed to load customer details in ActiveJobPanel:', err);
        if (isMounted) {
          setCustomerName('Customer');
        }
      }
    };
    if (customerId) {
      fetchCustomerInfo();
    }
    return () => {
      isMounted = false;
    };
  }, [customerId]);

  const [openDialog, setOpenDialog] = useState(false);
  const [amount, setAmount] = useState('300');
  const [validationError, setValidationError] = useState('');

  const handleButtonClick = () => {
    if (nextStatus === 'WORK_COMPLETED') {
      setOpenDialog(true);
    } else {
      onUpdateStatus(id, nextStatus);
    }
  };

  const handleConfirmCompletion = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      setValidationError('Please enter a valid numeric amount.');
      return;
    }
    if (numericAmount < 300) {
      setValidationError('Minimum billing charge is ₹300.');
      return;
    }
    setValidationError('');
    setOpenDialog(false);
    onUpdateStatus(id, 'WORK_COMPLETED', { amount: numericAmount });
  };

  const activeStep = getActiveStep(status);

  
  let buttonText = '';
  let nextStatus = '';
  let buttonColor = 'primary';
  let buttonIcon = null;

  if (status === 'ACCEPTED') {
    buttonText = "I'm on the way";
    nextStatus = 'ON_THE_WAY';
    buttonColor = 'secondary';
    buttonIcon = <Navigation size={18} />;
  } else if (status === 'ON_THE_WAY') {
    buttonText = 'Work Started';
    nextStatus = 'WORK_STARTED';
    buttonColor = 'info';
    buttonIcon = <Play size={18} />;
  } else if (status === 'WORK_STARTED') {
    buttonText = 'Mark Complete';
    nextStatus = 'WORK_COMPLETED';
    buttonColor = 'success';
    buttonIcon = <CheckCircle2 size={18} />;
  }

  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
      
      <Box sx={{ p: 2.5, bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {STEPS.map((step) => (
            <Step key={step.label}>
              <StepLabel
                sx={{
                  '& .MuiStepIcon-root.Mui-active': { color: 'primary.main' },
                  '& .MuiStepIcon-root.Mui-completed': { color: 'success.main' },
                }}
              >
                <Typography variant="caption" fontWeight="bold">
                  {step.label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <CardContent sx={{ p: 4 }}>
        <Grid container spacing={4}>
          
          <Grid size={{ xs: 12 }}>
            <Box>
              <Chip label={`Booking ID: #${id}`} color="primary" size="small" sx={{ fontWeight: 'bold', mb: 1.5 }} />
              <Typography variant="h5" fontWeight="800" gutterBottom>
                {serviceType} Fix Dispatch
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                <strong>Incident:</strong> {issueDescription}
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            
            <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}>
              Customer Details
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ width: 48, height: 48, bgcolor: 'secondary.main', color: 'secondary.contrastText', fontWeight: 'bold' }}>
                {customerName.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="700" color="text.primary">
                  {customerName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {customerEmail}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
              <Phone size={18} className="text-secondary" />
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight="700" display="block">
                  Contact Number
                </Typography>
                <Typography variant="body2" color="text.primary" fontWeight="bold">
                  {customerPhone}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 4 }}>
              <MapPin size={18} className="text-secondary" style={{ marginTop: 2 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight="700" display="block">
                  Service Site Address
                </Typography>
                <Typography variant="body2" color="text.primary" fontWeight="bold">
                  {address}
                </Typography>
                {address && (
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1.5 }}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={() => {
                        const custLoc = parseCoordinates(address);
                        let url = '';
                        if (custLoc && workerLatitude && workerLongitude) {
                          url = `https://www.google.com/maps/dir/?api=1&origin=${workerLatitude},${workerLongitude}&destination=${custLoc.latitude},${custLoc.longitude}`;
                        } else if (custLoc) {
                          url = `https://www.google.com/maps/dir/?api=1&destination=${custLoc.latitude},${custLoc.longitude}`;
                        } else {
                          url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
                        }
                        window.open(url, '_blank');
                      }}
                      startIcon={<Navigation size={14} />}
                      sx={{ fontWeight: 'bold' }}
                    >
                      Get Directions (Google Maps)
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={onRefreshLocation}
                      disabled={refreshingLocation}
                      startIcon={<RefreshCw size={14} className={refreshingLocation ? "animate-spin" : ""} />}
                      sx={{ fontWeight: 'bold' }}
                    >
                      {refreshingLocation ? 'Syncing...' : 'Sync GPS Location'}
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>

            
            {buttonText && (
              <Button
                variant="contained"
                color={buttonColor}
                fullWidth
                size="large"
                onClick={handleButtonClick}
                disabled={actionLoading}
                startIcon={buttonIcon}
                sx={{
                  py: 1.5,
                  fontWeight: 800,
                  fontSize: '1rem',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                  '&:hover': {
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                {actionLoading ? 'Updating Status...' : buttonText}
              </Button>
            )}

            {status === 'WORK_COMPLETED' && (
              <Box sx={{ p: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', border: '1px solid', borderColor: 'success.main', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CheckCircle2 color="#4caf50" size={24} />
                <Box>
                  <Typography variant="body2" color="success.main" fontWeight="bold">
                    Job Successfully Finished!
                  </Typography>
                  <Typography variant="body2" fontWeight="700" sx={{ my: 0.5 }}>
                    Billed Amount: ₹{booking.amount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Wait for payment processing from the customer's end.
                  </Typography>
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>
      </CardContent>

      {/* Dialog for completing job with billing amount */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Job Completion & Billing</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please enter the final amount to charge the customer. 
            The <strong>minimum charge is ₹300</strong>, and it can increase based on the work done.
          </DialogContentText>
          <DialogContentText sx={{ mb: 3, fontStyle: 'italic', fontSize: '0.85rem' }}>
            Note: If you negotiated a different final amount in person with the customer, enter that negotiated amount here.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Total Billing Amount (₹)"
            type="number"
            fullWidth
            variant="outlined"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={!!validationError}
            helperText={validationError || "Enter amount in Rupees (e.g. 350)"}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmCompletion} variant="contained" color="success">
            Complete & Charge
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ActiveJobPanel;
