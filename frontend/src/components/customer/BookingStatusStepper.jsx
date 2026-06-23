import React from 'react';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Box from '@mui/material/Box';

const steps = ['Requested', 'Accepted', 'On The Way', 'Work Started', 'Completed'];

/**
 * MUI Custom Stepper wrapper for booking status tracking.
 * @param {Object} props
 * @param {string} props.status - current booking status
 */
const BookingStatusStepper = ({ status }) => {
  const getStepIndex = (currentStatus) => {
    if (!currentStatus) return 0;
    switch (currentStatus.toUpperCase()) {
      case 'REQUESTED': return 0;
      case 'ACCEPTED': return 1;
      case 'ON_THE_WAY': return 2;
      case 'WORK_STARTED': return 3;
      case 'WORK_COMPLETED':
      case 'PAID': return 4;
      default: return 0;
    }
  };

  return (
    <Box sx={{ width: '100%', py: 2 }}>
      <Stepper activeStep={getStepIndex(status)} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default BookingStatusStepper;
