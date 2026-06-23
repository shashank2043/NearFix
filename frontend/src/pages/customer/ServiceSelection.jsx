import React from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Zap, Wrench, Hammer, Car, Wind, ArrowLeft } from 'lucide-react';
import ServiceCard from '../../components/customer/ServiceCard';

/**
 * ServiceSelection Component.
 * Presents a responsive grid of available emergency helper trades.
 */
const ServiceSelection = () => {
  const navigate = useNavigate();

  const services = [
    {
      name: 'Electrician',
      icon: Zap,
      description: 'Urgent repairs for short circuits, power outages, spark outlets, and critical appliance shocks.',
    },
    {
      name: 'Plumber',
      icon: Wrench,
      description: 'Immediate fixes for burst water lines, bathroom leaks, clogged drains, and major pipeline splits.',
    },
    {
      name: 'Carpenter',
      icon: Hammer,
      description: 'Emergency door lock repairs, security latches fix, broken key extraction, and structural lockouts.',
    },
    {
      name: 'Mechanic',
      icon: Car,
      description: 'Roadside battery jumpstarts, tire punctures, engine overheating diagnosis, and critical brake issues.',
    },
    {
      name: 'AC Technician',
      icon: Wind,
      description: 'Emergency fixes for cooling failures, compressor overheating, and toxic refrigerant leakage issues.',
    },
  ];

  const handleSelectService = (name) => {
    navigate(`/customer/request?service=${encodeURIComponent(name)}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Header Navigation */}
      <Box display="flex" alignItems="center" sx={{ gap: 1, mb: 3 }}>
        <Button
          variant="text"
          color="inherit"
          onClick={() => navigate('/customer/dashboard')}
          startIcon={<ArrowLeft size={16} />}
          sx={{ fontWeight: '700' }}
        >
          Back to Dashboard
        </Button>
      </Box>

      {/* Main Header */}
      <Box sx={{ mb: 5, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight="800" color="text.primary" gutterBottom>
          Select Emergency Service
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 620, mx: 'auto' }}>
          Choose the category matching your crisis. A nearby verified technician will be dispatched instantly to your exact coordinates.
        </Typography>
      </Box>

      {/* Services Grid */}
      <Grid container spacing={3} justifyContent="center">
        {services.map((service) => (
          <Grid item xs={12} sm={6} md={4} key={service.name}>
            <ServiceCard
              icon={service.icon}
              name={service.name}
              description={service.description}
              onClick={() => handleSelectService(service.name)}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ServiceSelection;
