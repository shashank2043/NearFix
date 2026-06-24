import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import { MapPin, Wrench, Navigation, Loader2 } from 'lucide-react';
import { SERVICE_TYPES } from '../../utils/constants';
import { workerApi } from '../../api/workerApi';


const bookingSchema = Yup.object().shape({
  serviceType: Yup.string()
    .required('Service type is required'),
  issueDescription: Yup.string()
    .required('Issue description is required')
    .min(10, 'Issue description must be at least 10 characters'),
  address: Yup.string()
    .required('Dispatch address is required'),
  city: Yup.string()
    .required('City is required')
});


const EmergencyRequestForm = ({ initialService = 'Electrician', onSubmit, loading }) => {
  const [detecting, setDetecting] = useState(false);
  const [locError, setLocError] = useState('');
  const [cities, setCities] = useState([]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const list = await workerApi.getCities();
        setCities(list);
      } catch (err) {
        console.warn('Could not load operating cities list:', err);
      }
    };
    fetchCities();
  }, []);

  const formik = useFormik({
    initialValues: {
      serviceType: initialService,
      issueDescription: '',
      address: '',
      city: '',
    },
    validationSchema: bookingSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

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
        const coordinatesStr = `Coordinates: ${latitude.toFixed(6)}° N, ${longitude.toFixed(6)}° E`;
        formik.setFieldValue('address', coordinatesStr);
        setDetecting(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        
        const selectedCity = formik.values.city || 'Bangalore';
        let fallbackStr = 'Coordinates: 12.971600° N, 77.594600° E (Detected Location)'; 
        if (selectedCity.toLowerCase() === 'delhi') {
          fallbackStr = 'Coordinates: 28.613900° N, 77.209000° E (Detected Location)';
        } else if (selectedCity.toLowerCase() === 'mumbai') {
          fallbackStr = 'Coordinates: 19.076000° N, 72.877700° E (Detected Location)';
        }
        formik.setFieldValue('address', fallbackStr);
        setLocError(`GPS access was blocked or timed out. Snapped to default dispatch center in ${selectedCity}.`);
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {locError && (
          <Alert severity="warning" onClose={() => setLocError('')} sx={{ borderRadius: 2 }}>
            {locError}
          </Alert>
        )}

        <TextField
          select
          name="serviceType"
          label="Emergency Service Type"
          value={formik.values.serviceType}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.serviceType && Boolean(formik.errors.serviceType)}
          helperText={formik.touched.serviceType && formik.errors.serviceType}
          fullWidth
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
          name="issueDescription"
          label="Explain the Emergency Details"
          placeholder="Please explain the problem (e.g. electrical short circuit causing smoke, kitchen sink pipe burst flooding water, lock broken etc.)"
          multiline
          rows={4}
          value={formik.values.issueDescription}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.issueDescription && Boolean(formik.errors.issueDescription)}
          helperText={formik.touched.issueDescription && formik.errors.issueDescription}
          fullWidth
        />

        <TextField
          name="address"
          label="Emergency Dispatch Address"
          placeholder="Enter detailed address or click Detect"
          value={formik.values.address}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.address && Boolean(formik.errors.address)}
          helperText={formik.touched.address && formik.errors.address}
          fullWidth
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

        <TextField
          select
          name="city"
          label="Dispatch City"
          value={formik.values.city}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.city && Boolean(formik.errors.city)}
          helperText={formik.touched.city && formik.errors.city}
          fullWidth
        >
          {(cities.length > 0 ? cities : [
            { id: 'blr', name: 'Bangalore' },
            { id: 'del', name: 'Delhi' },
            { id: 'mum', name: 'Mumbai' }
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
          disabled={loading || formik.isSubmitting}
          sx={{ py: 1.2, mt: 1 }}
        >
          {loading ? 'Dispatching Emergency Request...' : 'Confirm SOS Dispatch'}
        </Button>
      </Box>
    </form>
  );
};

export default EmergencyRequestForm;
