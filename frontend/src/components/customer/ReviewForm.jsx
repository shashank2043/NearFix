import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { Star } from 'lucide-react';

// Form validation schema
const reviewSchema = Yup.object().shape({
  rating: Yup.number()
    .required('Rating is required')
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating cannot exceed 5 stars'),
  comment: Yup.string()
    .required('Comment is required')
    .max(1000, 'Comment must be at most 1000 characters')
});

/**
 * Reusable Feedback and Rating Stars Submission Form.
 * @param {Object} props
 * @param {function} props.onSubmit - Submission callback returning {rating, comment}
 * @param {boolean} props.loading - Form loading lock
 */
const ReviewForm = ({ onSubmit, loading }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const formik = useFormik({
    initialValues: {
      rating: 5,
      comment: '',
    },
    validationSchema: reviewSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

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
    <form onSubmit={formik.handleSubmit}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
        
        {/* Rating Selector */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" fontWeight="700" color="text.secondary">
            How would you rate the technician's speed & quality?
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {[1, 2, 3, 4, 5].map((index) => {
              const isActive = (hoverRating || formik.values.rating) >= index;
              return (
                <IconButton
                  key={index}
                  onClick={() => formik.setFieldValue('rating', index)}
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
            {getRatingDescriptor(hoverRating || formik.values.rating)}
          </Typography>
        </Box>

        {/* Comment field */}
        <TextField
          name="comment"
          label="Your Feedback / Comment"
          placeholder="Share details about the technician's arrival speed, technical skill, or communication style..."
          multiline
          rows={3}
          value={formik.values.comment}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.comment && Boolean(formik.errors.comment)}
          helperText={formik.touched.comment && formik.errors.comment}
          fullWidth
        />

        {/* Action button */}
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          fullWidth
          size="large"
          disabled={loading || formik.isSubmitting || !formik.values.comment.trim()}
          sx={{ py: 1.2 }}
        >
          {loading ? 'Submitting Review...' : 'Submit Rating & Feedback'}
        </Button>
      </Box>
    </form>
  );
};

export default ReviewForm;
