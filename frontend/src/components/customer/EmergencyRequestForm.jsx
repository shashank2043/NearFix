import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import { MapPin, Wrench, Navigation, Loader2 } from 'lucide-react';
import { SERVICE_TYPES } from '../../utils/constants';

/**
 * Reusable Emergency SOS Booking Form.
 * @param {Object} props
 * @param {string} [props.initialService='Electrician'] - default prefilled service
 * @param {function} props.onSubmit - Submission callback returning {serviceType, issueDescription, address}
 * @param {boolean} props.loading - Form submission loading state
 */
const EmergencyRequestForm = ({ initialService = 'Electrician', onSubmit, loading }) => {
  const [serviceType, setServiceType] = useState(initialService);
  const [issueDescription, setIssueDescription] = useState('');
  const [location, setLocation] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [locError, setLocError] = useState('');

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.');
      return;
    }

    setDetecting(true);
    setLocError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(`Coordinates: ${latitude.toFixed(6)}° N, ${longitude.toFixed(6)}° E`);
        setDetecting(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        // Fallback: mock coordinates if permission is blocked or timeout occurs
        setLocation('Coordinates: 12.971600° N, 77.594600° E (Detected Location)');
        setLocError('Exact GPS access timed out or was blocked. Using local default dispatch coordinates.');
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!issueDescription || !location) return;
    onSubmit({
      serviceType,
      issueDescription,
      address: location,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box display="flex" flexDirection="column" sx={{ gap: 3 }}>
        {locError && (
          <Alert severity="warning" onClose={() => setLocError('')} sx={{ borderRadius: 2 }}>
            {locError}
          </Alert>
        )}

        <TextField
          select
          label="Emergency Service Type"
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
          fullWidth
          required
          slotProps={{
            input: {
              startAdornment: (
                <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                  <Wrench size={18} />
                </Box>
              )
            }
          }}
        >
          {SERVICE_TYPES.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Explain the Emergency Details"
          placeholder="Please explain the problem (e.g. electrical short circuit causing smoke, kitchen sink pipe burst flooding water, lock broken etc.)"
          multiline
          rows={4}
          value={issueDescription}
          onChange={(e) => setIssueDescription(e.target.value)}
          fullWidth
          required
        />

        <TextField
          label="Emergency Dispatch Address"
          placeholder="Enter detailed address or click Detect"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          fullWidth
          required
          slotProps={{
            input: {
              startAdornment: (
                <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                  <MapPin size={18} />
                </Box>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    onClick={handleDetectLocation}
                    disabled={detecting}
                    sx={{ py: 0.5, px: 1, textTransform: 'none', height: 32 }}
                    startIcon={detecting ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
                  >
                    {detecting ? 'Detecting...' : 'Detect'}
                  </Button>
                </InputAdornment>
              ),
            }
          }}
        />

        <Button
          type="submit"
          variant="contained"
          color="secondary"
          fullWidth
          size="large"
          disabled={loading || !issueDescription || !location}
          sx={{ py: 1.2, mt: 1 }}
        >
          {loading ? 'Dispatching Emergency Request...' : 'Confirm SOS Dispatch'}
        </Button>
      </Box>
    </form>
  );
};

export default EmergencyRequestForm;
