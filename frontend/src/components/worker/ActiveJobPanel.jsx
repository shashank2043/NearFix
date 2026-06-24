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
import { MapPin, Phone, User, CheckCircle2, Navigation, ShieldCheck, AlertCircle, Play } from 'lucide-react';
import { authApi } from '../../api/authApi';

/**
 * Steps mapping for the job status tracker.
 */
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

/**
 * ActiveJobPanel Component
 * Displays the current active job including customer details, a visual progress tracker,
 * an interactive simulated map HUD, and dynamic action buttons for state transitions.
 */
const ActiveJobPanel = ({ booking, onUpdateStatus, actionLoading = false }) => {
  const { id, customerId, serviceType, issueDescription, address, status } = booking;
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

  const activeStep = getActiveStep(status);

  // Determine next action button configuration based on booking status
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
      {/* Visual Indicator of Dispatch Status */}
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
          {/* Left Column: Job & Customer Details */}
          <Grid size={{ xs: 12, md: 7 }}>
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

            {/* Customer Details */}
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
              </Box>
            </Box>

            {/* Status ADVANCE Action Button */}
            {buttonText && (
              <Button
                variant="contained"
                color={buttonColor}
                fullWidth
                size="large"
                onClick={() => onUpdateStatus(id, nextStatus)}
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
                  <Typography variant="caption" color="text.secondary">
                    Wait for payment processing from the customer's end.
                  </Typography>
                </Box>
              </Box>
            )}
          </Grid>

          {/* Right Column: Visual Map HUD */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}>
              Customer Location HUD
            </Typography>
            <Box
              sx={{
                width: '100%',
                height: 320,
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid',
                borderColor: 'divider',
                background: 'radial-gradient(circle, #0B192C 0%, #050B14 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* SVG HUD Grid & Radar Rings */}
              <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                {/* Horizontal Gridlines */}
                <line x1="0" y1="80" x2="100%" y2="80" stroke="#1E293B" strokeWidth="0.5" />
                <line x1="0" y1="160" x2="100%" y2="160" stroke="#1E293B" strokeWidth="0.5" />
                <line x1="0" y1="240" x2="100%" y2="240" stroke="#1E293B" strokeWidth="0.5" />
                {/* Vertical Gridlines */}
                <line x1="25%" y1="0" x2="25%" y2="100%" stroke="#1E293B" strokeWidth="0.5" />
                <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#1E293B" strokeWidth="0.5" />
                <line x1="75%" y1="0" x2="75%" y2="100%" stroke="#1E293B" strokeWidth="0.5" />

                {/* Radar Rings */}
                <circle cx="50%" cy="50%" r="50" fill="none" stroke="rgba(0, 245, 212, 0.15)" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="50%" cy="50%" r="100" fill="none" stroke="rgba(0, 245, 212, 0.08)" strokeWidth="1" />
                
                {/* Ping Radar Sweep Effect */}
                <circle cx="50%" cy="50%" r="75" fill="none" stroke="rgba(0, 245, 212, 0.25)" strokeWidth="1.5">
                  <animate attributeName="r" values="0;120" dur="4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0" dur="4s" repeatCount="indefinite" />
                </circle>

                {/* Map Routes */}
                <path d="M 50 160 Q 110 100 160 160 T 260 210" fill="none" stroke="#00B4D8" strokeWidth="2" strokeDasharray="5 5" opacity="0.6" />
                <path d="M 30 80 L 150 120 L 160 160 L 180 280" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1.5" />
              </svg>

              {/* Ping Marker */}
              <Box
                sx={{
                  position: 'absolute',
                  transform: 'translate(-50%, -50%)',
                  left: '60%',
                  top: '40%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                {/* Marker Glow */}
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: 'rgba(0, 245, 212, 0.3)',
                    position: 'absolute',
                    animation: 'pulse 2s infinite ease-in-out',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(0.8)', opacity: 0.8 },
                      '50%': { transform: 'scale(1.8)', opacity: 0.2 },
                      '100%': { transform: 'scale(0.8)', opacity: 0.8 },
                    }
                  }}
                />
                <Box sx={{ zIndex: 1, bgcolor: '#00F5D4', p: 0.5, borderRadius: '50%', border: '2px solid #0F1A30', boxShadow: '0 4px 10px rgba(0,245,212,0.4)' }}>
                  <MapPin size={14} color="#0B192C" />
                </Box>
                <Chip
                  label="Customer Site"
                  size="small"
                  sx={{
                    mt: 1,
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    fontWeight: 'bold',
                    fontSize: '0.65rem',
                    height: 18,
                    '& .MuiChip-label': { px: 1 },
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              </Box>

              {/* Status HUD Info overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 12,
                  left: 12,
                  right: 12,
                  p: 1.5,
                  borderRadius: 2.5,
                  bgcolor: 'rgba(15, 26, 48, 0.85)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Navigation size={14} color="#00F5D4" />
                  <Typography variant="caption" fontWeight="bold" color="#00F5D4">
                    GPS TRACKING ACTIVE
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" fontWeight="700">
                  ETA: 8-12 MINS
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ActiveJobPanel;
