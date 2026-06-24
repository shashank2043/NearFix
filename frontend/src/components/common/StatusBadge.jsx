import React from 'react';
import Chip from '@mui/material/Chip';
import { getStatusColor } from '../../utils/helpers';
import { STATUS_LABELS } from '../../utils/constants';


const StatusBadge = ({ status, size = 'small' }) => {
  const color = getStatusColor(status);
  const label = STATUS_LABELS[status] || status;

  return (
    <Chip
      label={label}
      color={color}
      size={size}
      sx={{
        fontWeight: 700,
        textTransform: 'uppercase',
        fontSize: size === 'small' ? '0.7rem' : '0.8rem',
        borderRadius: '6px',
        px: 0.5,
      }}
    />
  );
};

export default StatusBadge;
