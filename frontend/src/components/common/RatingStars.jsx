import React from 'react';
import Rating from '@mui/material/Rating';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * Star Rating Display wrapper using Material UI Rating.
 * @param {Object} props
 * @param {number} props.value
 * @param {boolean} [props.readOnly=true]
 * @param {function} [props.onChange]
 * @param {number} [props.precision=0.5]
 * @param {boolean} [props.showLabel=false]
 */
const RatingStars = ({ value, readOnly = true, onChange, precision = 0.5, showLabel = false }) => {
  const score = Number(value) || 0;
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Rating
        value={score}
        readOnly={readOnly}
        onChange={onChange ? (event, newValue) => onChange(newValue) : undefined}
        precision={precision}
        size="small"
        sx={{
          color: 'amber.500', // Uses MUI amber color or falls back to default gold
        }}
      />
      {showLabel && (
        <Typography variant="body2" fontWeight="600" color="text.secondary" sx={{ ml: 0.5 }}>
          {score.toFixed(1)}
        </Typography>
      )}
    </Box>
  );
};

export default RatingStars;
