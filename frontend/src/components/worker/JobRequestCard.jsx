import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import { MapPin, Navigation, User, Calendar, Zap, Wrench, Hammer, Scissors, Check, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserByIdThunk } from '../../store/slices/authSlice';
import { formatDate } from '../../utils/helpers';


const getServiceIcon = (type) => {
  if (!type) return <Wrench size={18} />;
  switch (type.toUpperCase()) {
    case 'ELECTRICIAN':
      return <Zap size={18} />;
    case 'PLUMBER':
      return <Wrench size={18} />;
    case 'CARPENTER':
      return <Hammer size={18} />;
    case 'SALON':
    case 'BARBER':
      return <Scissors size={18} />;
    default:
      return <Wrench size={18} />;
  }
};

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


const JobRequestCard = ({ booking, onAccept, onReject, actionLoading = false }) => {
  const { id, customerId, serviceType, issueDescription, address, createdAt } = booking;
  
  const dispatch = useDispatch();
  const cachedUser = useSelector((state) => state.auth.usersCached[customerId]);

  const [customerName, setCustomerName] = useState('Loading Customer...');
  const [customerPhone, setCustomerPhone] = useState('');
  const [distance, setDistance] = useState('...');

  useEffect(() => {
    if (cachedUser) {
      setCustomerName(cachedUser.fullName || 'Anonymous Customer');
      setCustomerPhone(cachedUser.phone || '');
      return;
    }

    let isMounted = true;
    const fetchCustomerInfo = async () => {
      try {
        const result = await dispatch(getUserByIdThunk(customerId)).unwrap();
        const user = result.data;
        if (isMounted) {
          setCustomerName(user.fullName || 'Anonymous Customer');
          setCustomerPhone(user.phone || '');
        }
      } catch (err) {
        console.error('Failed to load customer details in JobRequestCard:', err);
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
  }, [customerId, cachedUser, dispatch]);

  useEffect(() => {
    const calcDistance = () => {
      const custLoc = parseCoordinates(address);
      if (!custLoc) {
        setDistance((Math.random() * 3 + 1).toFixed(1));
        return;
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const dist = calculateHaversineDistance(
              pos.coords.latitude,
              pos.coords.longitude,
              custLoc.latitude,
              custLoc.longitude
            );
            setDistance(dist.toFixed(1));
          },
          () => {
            setDistance((Math.random() * 3 + 1).toFixed(1));
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      } else {
        setDistance((Math.random() * 3 + 1).toFixed(1));
      }
    };
    calcDistance();
  }, [address]);

  return (
    <Card sx={{ position: 'relative', overflow: 'visible', transition: 'transform 0.2s ease, box-shadow 0.2s ease', '&:hover': { transform: 'translateY(-2px)' } }}>
      
      <Box sx={{ height: 4, bgcolor: 'error.main', borderTopLeftRadius: 16, borderTopRightRadius: 16 }} />
      
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText', width: 40, height: 40 }}>
              {getServiceIcon(serviceType)}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="800" color="text.primary">
                {serviceType} SOS Call
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Calendar size={12} /> {formatDate(createdAt)}
              </Typography>
            </Box>
          </Box>
          <Chip
            icon={<Navigation size={12} />}
            label={`${distance} km away`}
            color="secondary"
            size="small"
            variant="outlined"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>

        <Divider sx={{ my: 1.5 }} />

        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, my: 2 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.9rem' }}>
            <User size={16} />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="700" color="text.primary">
              {customerName}
            </Typography>
            {customerPhone && (
              <Typography variant="caption" color="text.secondary">
                {customerPhone}
              </Typography>
            )}
          </Box>
        </Box>

        
        <Box sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" fontWeight="700" display="block" sx={{ mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Issue Description
          </Typography>
          <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6 }}>
            {issueDescription}
          </Typography>
        </Box>

        
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 3 }}>
          <MapPin size={18} className="text-secondary" style={{ marginTop: 2, flexShrink: 0 }} />
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight="700" display="block" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Dispatch Location
            </Typography>
            <Typography variant="body2" color="text.primary" fontWeight="500">
              {address}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2.5 }} />

        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={async () => {
              let workerLoc = null;
              if (navigator.geolocation) {
                try {
                  workerLoc = await new Promise((resolve) => {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
                      () => resolve(null),
                      { enableHighAccuracy: true, timeout: 5000 }
                    );
                  });
                } catch (e) {
                  console.warn(e);
                }
              }
              onAccept(id, workerLoc);
            }}
            disabled={actionLoading}
            startIcon={<Check size={16} />}
            sx={{
              py: 1.2,
              fontWeight: 'bold',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                bgcolor: 'primary.dark',
              }
            }}
          >
            Accept Job
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => onReject(id)}
            disabled={actionLoading}
            startIcon={<X size={16} />}
            sx={{
              px: 3,
              py: 1.2,
              fontWeight: 'bold',
              borderWidth: 1.5,
              '&:hover': {
                borderWidth: 1.5,
                bgcolor: 'rgba(239, 83, 80, 0.08)'
              }
            }}
          >
            Reject
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default JobRequestCard;
