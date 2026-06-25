import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import Rating from '@mui/material/Rating';
import Alert from '@mui/material/Alert';
import { Search, MapPin, Zap, Wrench, Hammer, ShieldCheck, Clock, Award, ArrowRight, Star, Car, Wind, HelpCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDispatch, useSelector } from 'react-redux';
import { getCitiesThunk } from '../store/slices/workerSlice';


const SERVICES = [
  { name: 'Electrician', desc: 'Short circuits, wiring repairs, socket fixes', icon: <Zap size={24} />, color: '#00F5D4' },
  { name: 'Plumber', desc: 'Leakages, pipe bursts, tap installations', icon: <Wrench size={24} />, color: '#00B4D8' },
  { name: 'Carpenter', desc: 'Lock repairs, door alignment, furniture fixes', icon: <Hammer size={24} />, color: '#ffb703' },
  { name: 'Mechanic', desc: 'Engine issues, brake failure, flat tires', icon: <Car size={24} />, color: '#ff5722' },
  { name: 'AC Technician', desc: 'Cooling issues, leakages, gas refills', icon: <Wind size={24} />, color: '#4caf50' },
  { name: 'Other', desc: 'Need custom urgent services? Select this to specify', icon: <HelpCircle size={24} />, color: '#9c27b0' },
];


const TRUST_FACTORS = [
  { title: '15-Min SOS Response', desc: 'Our technicians are dispatched instantly to resolve dangerous failures.', icon: <Clock size={28} /> },
  { title: 'Verified Technicians', desc: 'Every professional is background checked and verified by our admins.', icon: <ShieldCheck size={28} /> },
  { title: 'Insured Services', desc: 'Get peace of mind with insured repairs and transparent flat-rate billing.', icon: <Award size={28} /> },
];


const TESTIMONIALS = [
  { name: 'Rohan Sharma', role: 'Homeowner', text: 'Sparks were flying from my distribution board. The electrician arrived in 12 minutes and fixed it safely! Incredible response time.', rating: 5 },
  { name: 'Sanjana Sen', role: 'Apartment Tenant', text: 'Main pipe burst in the kitchen on a Sunday evening. Plumber accepted and solved it immediately. NearFix is a lifesaver.', rating: 5 },
  { name: 'Vikram Mehta', role: 'Property Manager', text: 'Transparent billing and verified professionals. Very easy to handle repairs across my rental buildings.', rating: 4.8 },
];


const LandingPage = () => {
  const { role, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cities = useSelector((state) => state.worker.cities);
  const [city, setCity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(getCitiesThunk());
  }, [dispatch]);

  useEffect(() => {
    if (cities && cities.length > 0) {
      setCity(cities[0].name);
    } else {
      setCity('');
    }
  }, [cities]);

  const getDashboardPath = () => {
    if (role === 'CUSTOMER') return '/customer/dashboard';
    if (role === 'WORKER') return '/worker/dashboard';
    if (role === 'ADMIN') return '/admin/dashboard';
    return '/login';
  };

  const handleServiceSelect = (serviceName) => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (role === 'CUSTOMER') {
      navigate(`/customer/request?service=${serviceName}`);
    } else {
      navigate(getDashboardPath());
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    
    const query = searchQuery.toLowerCase();
    const matched = SERVICES.find(s => s.name.toLowerCase().includes(query) || s.desc.toLowerCase().includes(query));
    if (matched) {
      handleServiceSelect(matched.name);
    } else {
      handleServiceSelect('Electrician'); 
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      
      <Box 
        sx={{ 
          pt: { xs: 8, md: 12 }, 
          pb: { xs: 8, md: 12 },
          background: (theme) => theme.palette.mode === 'dark'
            ? 'radial-gradient(circle at 80% 20%, rgba(0, 245, 212, 0.08) 0%, #070D19 100%)'
            : 'radial-gradient(circle at 80% 20%, rgba(0, 180, 216, 0.05) 0%, #F8FAFC 100%)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography 
            variant="caption" 
            fontWeight="800" 
            color="secondary.main" 
            sx={{ letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', mb: 2 }}
          >
            Emergency Local Skills Marketplace
          </Typography>
          <Typography 
            variant="h2" 
            color="text.primary" 
            fontWeight="900" 
            gutterBottom
            sx={{ fontSize: { xs: '2.2rem', md: '3.6rem' }, lineHeight: 1.15, letterSpacing: '-0.025em' }}
          >
            SOS Fixes & Home Services,<br />Dispatched in 15 Minutes.
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ maxWidth: 600, mx: 'auto', mb: 5, fontSize: { xs: '1rem', md: '1.2rem' } }}
          >
            NearFix links you directly with verified local plumbers, electricians, and carpenters to solve home emergencies in real-time.
          </Typography>

          
          <Paper
            component="form"
            onSubmit={handleSearchSubmit}
            sx={{
              p: 0.5,
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              maxWidth: 700,
              mx: 'auto',
              borderRadius: 3,
              boxShadow: (theme) => theme.palette.mode === 'dark'
                ? '0 10px 30px rgba(0,0,0,0.5)'
                : '0 10px 30px rgba(11,25,44,0.06)',
              border: '1px solid',
              borderColor: 'divider',
              flexWrap: { xs: 'wrap', sm: 'nowrap' },
              gap: { xs: 1, sm: 0 }
            }}
          >
            
            <FormControl 
              variant="standard"
              sx={{ 
                minWidth: { xs: '100%', sm: 150 }, 
                borderRight: { sm: '1px solid' }, 
                borderColor: 'divider',
              }}
            >
              <Select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                displayEmpty
                disableUnderline
                startAdornment={
                  <InputAdornment position="start" sx={{ pl: 2, color: 'text.secondary' }}>
                    <MapPin size={18} />
                  </InputAdornment>
                }
                sx={{ 
                  '& .MuiSelect-select': { py: 1.5, pl: 1, textAlign: 'left', fontWeight: 'bold' }
                }}
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
              </Select>
            </FormControl>

            
            <TextField
              fullWidth
              placeholder="Search for 'pipe burst', 'short circuit'..."
              variant="standard"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  disableUnderline: true,
                  startAdornment: (
                    <InputAdornment position="start" sx={{ pl: 2, color: 'text.secondary' }}>
                      <Search size={18} />
                    </InputAdornment>
                  ),
                }
              }}
              sx={{ 
                '& .MuiInput-root': { 
                  border: 'none',
                  '&:before, &:after': { display: 'none' }
                },
                '& input': { 
                  py: 1.5, 
                  px: 2, 
                  fontWeight: 500,
                  border: 'none !important',
                  outline: 'none !important',
                  boxShadow: 'none !important',
                  '&:focus': {
                    border: 'none !important',
                    outline: 'none !important',
                    boxShadow: 'none !important'
                  }
                } 
              }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={cities.length === 0}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2.5,
                fontWeight: 'bold',
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Search
            </Button>
          </Paper>

          {cities.length === 0 && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Alert 
                severity="warning" 
                variant="outlined" 
                sx={{ 
                  maxWidth: 600, 
                  borderRadius: 2.5, 
                  fontWeight: 'bold', 
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 183, 77, 0.05)' : 'rgba(255, 183, 77, 0.02)',
                  borderColor: 'warning.main',
                  color: 'warning.main'
                }}
              >
                Operations are currently halted: No active operating cities are available at this moment.
              </Alert>
            </Box>
          )}

          
          {isAuthenticated && (
            <Box sx={{ mt: 4 }}>
              <Button
                component={Link}
                to={getDashboardPath()}
                variant="outlined"
                color="secondary"
                endIcon={<ArrowRight size={16} />}
                sx={{ border: '1.5px solid', fontWeight: 'bold', borderRadius: 2.5 }}
              >
                Go to Dashboard
              </Button>
            </Box>
          )}
        </Container>
      </Box>

      
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="h4" fontWeight="800" gutterBottom>
            Select SOS Emergency Service
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
            Choose a service category to immediately trigger an emergency dispatch request.
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
          {SERVICES.map((service) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={service.name}>
              <Card 
                onClick={() => handleServiceSelect(service.name)}
                sx={{ 
                  height: '100%', 
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.25s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => theme.palette.mode === 'dark'
                      ? '0 12px 24px rgba(0, 245, 212, 0.08)'
                      : '0 12px 24px rgba(0, 180, 216, 0.08)',
                    borderColor: service.color,
                  }
                }}
              >
                <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: `${service.color}15`, 
                      color: service.color, 
                      width: 52, 
                      height: 52,
                      mb: 3
                    }}
                  >
                    {service.icon}
                  </Avatar>
                  <Typography variant="h5" fontWeight="800" gutterBottom>
                    {service.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 3 }}>
                    {service.desc}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 'auto', color: 'primary.main', fontWeight: 'bold' }}>
                    <Typography variant="body2" fontWeight="bold">Request SOS Dispatch</Typography>
                    <ArrowRight size={14} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Divider />

      
      <Box sx={{ py: 10, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 8, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight="800" gutterBottom>
              Why Trust NearFix?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              A reliable framework designed to prioritize customer safety and service compliance.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {TRUST_FACTORS.map((item, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <Box sx={{ textAlign: 'center', px: { xs: 2, md: 4 } }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'rgba(0, 180, 216, 0.1)', 
                      color: 'secondary.main', 
                      width: 60, 
                      height: 60, 
                      mx: 'auto',
                      mb: 2.5
                    }}
                  >
                    {item.icon}
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 1.5 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {item.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Divider />

      
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <Typography variant="h4" fontWeight="800" gutterBottom>
            Seeded Customer Feedbacks
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Read what other citizens in distress experienced when using NearFix SOS.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {TESTIMONIALS.map((item, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={index}>
              <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                    <Star size={16} fill="#ffc107" stroke="#ffc107" />
                    <Star size={16} fill="#ffc107" stroke="#ffc107" />
                    <Star size={16} fill="#ffc107" stroke="#ffc107" />
                    <Star size={16} fill="#ffc107" stroke="#ffc107" />
                    <Star size={16} fill={index === 2 ? "none" : "#ffc107"} stroke="#ffc107" />
                  </Box>
                  <Typography variant="body2" color="text.primary" sx={{ fontStyle: 'italic', lineHeight: 1.7, mb: 3 }}>
                    "{item.text}"
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 'auto' }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText', width: 36, height: 36, fontWeight: 'bold', fontSize: '0.85rem' }}>
                      {item.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="800">
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.role}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default LandingPage;
