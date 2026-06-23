import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import RatingStars from '../common/RatingStars';
import Chip from '@mui/material/Chip';
import { MapPin, Navigation } from 'lucide-react';

/**
 * Reusable Card component for displaying worker summary details.
 * @param {Object} props
 * @param {string} props.name - Worker name
 * @param {string} props.skill - Service category
 * @param {number} props.rating - User reviews score
 * @param {string} [props.distance='1.2 km'] - Distance from customer
 * @param {string} [props.estimatedArrival='10 mins'] - Estimated ETA
 */
const WorkerCard = ({ 
  name, 
  skill, 
  rating, 
  distance = '1.2 km', 
  estimatedArrival = '10 mins' 
}) => {
  return (
    <Card sx={{ bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
      <CardContent sx={{ py: 2.2, '&:last-child': { pb: 2.2 } }}>
        <Box display="flex" alignItems="center" sx={{ gap: 2 }}>
          <Avatar 
            sx={{ 
              bgcolor: 'secondary.main', 
              color: '#0B192C', 
              fontWeight: 800, 
              width: 48, 
              height: 48 
            }}
          >
            {name?.charAt(0).toUpperCase() || 'W'}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Box display="flex" alignItems="center" sx={{ gap: 1, mb: 0.5 }}>
              <Typography variant="subtitle1" fontWeight="700" color="text.primary">
                {name}
              </Typography>
              <Chip 
                label={skill} 
                size="small" 
                variant="outlined" 
                color="secondary" 
                sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} 
              />
            </Box>
            <RatingStars value={rating} showLabel />
          </Box>
          <Box 
            textAlign="right" 
            display="flex" 
            flexDirection="column" 
            alignItems="flex-end" 
            sx={{ gap: 0.5 }}
          >
            <Box display="flex" alignItems="center" sx={{ gap: 0.5, color: 'text.secondary' }}>
              <MapPin size={14} />
              <Typography variant="caption" fontWeight="600">
                {distance}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" sx={{ gap: 0.5, color: 'success.main' }}>
              <Navigation size={14} />
              <Typography variant="caption" fontWeight="700">
                ETA: {estimatedArrival}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default WorkerCard;
