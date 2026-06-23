import React, { useMemo } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { AlertCircle, Zap } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

/**
 * Price Estimator component calculating dynamic service charges.
 * @param {Object} props
 * @param {string} props.serviceType - e.g. Electrician, Plumber, Carpenter, Mechanic, AC Technician
 * @param {'DAY' | 'NIGHT'} props.timeOfDay - active time of dispatch
 */
const PriceEstimator = ({ serviceType, timeOfDay }) => {
  const estimation = useMemo(() => {
    let min = 200;
    let max = 400;

    switch (serviceType) {
      case 'Electrician':
        min = 250;
        max = 500;
        break;
      case 'Plumber':
        min = 200;
        max = 450;
        break;
      case 'Carpenter':
        min = 300;
        max = 600;
        break;
      case 'Mechanic':
        min = 350;
        max = 700;
        break;
      case 'AC Technician':
        min = 400;
        max = 800;
        break;
      default:
        break;
    }

    const isNightSurge = timeOfDay === 'NIGHT';
    const multiplier = isNightSurge ? 1.5 : 1.0;

    return {
      min: Math.round(min * multiplier),
      max: Math.round(max * multiplier),
      isNightSurge,
    };
  }, [serviceType, timeOfDay]);

  return (
    <Card sx={{ bgcolor: 'action.hover', border: '1px dashed', borderColor: 'divider' }}>
      <CardContent sx={{ py: 2.2, '&:last-child': { pb: 2.2 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          
          {/* Header Row */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" fontWeight="700" color="text.secondary">
              Estimated Service Callout Fee
            </Typography>
            {estimation.isNightSurge && (
              <Chip
                icon={<Zap size={12} />}
                label="SOS Night Surge (1.5x)"
                size="small"
                color="warning"
                sx={{ fontSize: '0.65rem', fontWeight: 800 }}
              />
            )}
          </Box>

          {/* Pricing Estimation Range */}
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
            <Typography variant="h5" fontWeight="800" color="text.primary">
              {formatCurrency(estimation.min)} - {formatCurrency(estimation.max)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              (Flat Callout rate)
            </Typography>
          </Box>

          {/* Guidelines warning */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <Typography variant="caption" color="text.secondary">
              Est. range includes basic fix callout rates. Material/spare costs will be calculated on-site.
            </Typography>
          </Box>

        </Box>
      </CardContent>
    </Card>
  );
};

export default PriceEstimator;
