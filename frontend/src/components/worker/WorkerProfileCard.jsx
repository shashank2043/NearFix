import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Rating from '@mui/material/Rating';
import { Award, ShieldCheck, ShieldAlert, Star } from 'lucide-react';
import RatingStars from '../common/RatingStars';

/**
 * WorkerProfileCard Component
 * Displays a summary of the worker's details: avatar, name, skill, rating, and experience badge.
 * 
 * @param {Object} user - The basic user account info (fullName, email, phone).
 * @param {Object} profile - The worker profile details (skill, experience, rating, verified, status).
 */
const WorkerProfileCard = ({ user, profile }) => {
  if (!user) return null;

  const fullName = user.fullName || 'Worker Profile';
  const skill = profile?.skill || 'Emergency Agent';
  const rating = profile?.rating || 5.0;
  const experience = profile?.experience || 0;
  const verified = profile?.verified || false;

  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
      {/* Visual top gradient banner */}
      <Box sx={{ height: 70, background: 'linear-gradient(90deg, #00F5D4 0%, #00B4D8 100%)' }} />
      
      <CardContent sx={{ pt: 0, px: 3, pb: 3, position: 'relative' }}>
        {/* Large Avatar overlapping top banner */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-end" sx={{ mt: -5, mb: 2 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              border: '4px solid',
              borderColor: 'background.paper',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              fontWeight: 800,
              fontSize: '2rem',
            }}
          >
            {fullName.charAt(0).toUpperCase()}
          </Avatar>

          {/* Verification Badge */}
          <Chip
            icon={verified ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
            label={verified ? 'Verified Pro' : 'Pending Verification'}
            color={verified ? 'success' : 'warning'}
            size="small"
            sx={{
              fontWeight: 800,
              fontSize: '0.7rem',
              height: 24,
            }}
          />
        </Box>

        {/* Worker Info */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="h5" fontWeight="800" color="text.primary" gutterBottom>
            {fullName}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" fontWeight="700" color="primary.main">
              {skill}
            </Typography>
            <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {user.phone || 'No phone number'}
            </Typography>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ p: 2, borderRadius: 3, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
          {/* Experience Badge */}
          <Box display="flex" alignItems="center" gap={1}>
            <Award size={18} className="text-secondary" />
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight="700" display="block">
                EXPERIENCE
              </Typography>
              <Typography variant="body2" fontWeight="800" color="text.primary">
                {experience} {experience === 1 ? 'Year' : 'Years'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ borderRight: '1px solid', borderColor: 'divider', height: 28 }} />

          {/* Rating Section */}
          <Box display="flex" alignItems="center" gap={1}>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight="700" display="block" align="right">
                RATING
              </Typography>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Star size={14} fill="#ffc107" stroke="#ffc107" />
                <Typography variant="body2" fontWeight="800" color="text.primary">
                  {rating.toFixed(1)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Additional Ratings Breakdown */}
        {profile?.rating && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <RatingStars rating={rating} size="small" />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkerProfileCard;
