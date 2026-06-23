import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { Star } from 'lucide-react';

/**
 * Reusable Feedback and Rating Stars Submission Form.
 * @param {Object} props
 * @param {function} props.onSubmit - Submission callback returning {rating, comment}
 * @param {boolean} props.loading - Form loading lock
 */
const ReviewForm = ({ onSubmit, loading }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    onSubmit({
      rating,
      comment,
    });
  };

  const getRatingDescriptor = (stars) => {
    switch (stars) {
      case 5: return 'Excellent work, highly recommend!';
      case 4: return 'Very good, satisfied with service.';
      case 3: return 'Average service, minor issues encountered.';
      case 2: return 'Poor experience, need improvements.';
      case 1: return 'Extremely poor service, unsatisfactory.';
      default: return '';
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box display="flex" flexDirection="column" sx={{ gap: 3.5 }}>
        
        {/* Rating Selector */}
        <Box display="flex" flexDirection="column" alignItems="center" sx={{ gap: 1 }}>
          <Typography variant="body2" fontWeight="700" color="text.secondary">
            How would you rate the technician's speed & quality?
          </Typography>
          <Box display="flex" sx={{ gap: 0.5 }}>
            {[1, 2, 3, 4, 5].map((index) => {
              const isActive = (hoverRating || rating) >= index;
              return (
                <IconButton
                  key={index}
                  onClick={() => setRating(index)}
                  onMouseEnter={() => setHoverRating(index)}
                  onMouseLeave={() => setHoverRating(0)}
                  color="inherit"
                  sx={{
                    color: isActive ? '#F59E0B' : 'text.disabled',
                    p: 0.5,
                  }}
                >
                  <Star
                    size={36}
                    fill={isActive ? '#F59E0B' : 'transparent'}
                    strokeWidth={1.5}
                    style={{ transition: 'all 0.1s ease' }}
                  />
                </IconButton>
              );
            })}
          </Box>
          <Typography variant="caption" color="text.secondary" fontWeight="700" sx={{ minHeight: 16 }}>
            {getRatingDescriptor(hoverRating || rating)}
          </Typography>
        </Box>

        {/* Comment field */}
        <TextField
          label="Your Feedback / Comment"
          placeholder="Share details about the technician's arrival speed, technical skill, or communication style..."
          multiline
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          fullWidth
          required
        />

        {/* Action button */}
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          fullWidth
          size="large"
          disabled={loading || !comment.trim()}
          sx={{ py: 1.2 }}
        >
          {loading ? 'Submitting Review...' : 'Submit Rating & Feedback'}
        </Button>
      </Box>
    </form>
  );
};

export default ReviewForm;
