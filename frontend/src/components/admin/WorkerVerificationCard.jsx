import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import { Award, MapPin, Shield, FileText, Check, X, ShieldCheck, ShieldAlert, ShieldAlert as PendingIcon } from 'lucide-react';
import { useTheme } from '@mui/material/styles';


const WorkerVerificationCard = ({ worker, workerUser = {}, onApprove, onReject }) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = React.useState(false);
  
  const { id, skill, experience, city, verificationStatus, aadhaarNumber } = worker;
  const fullName = workerUser.fullName || 'Unregistered Worker';
  const email = workerUser.email || 'N/A';
  const phone = workerUser.phone || 'N/A';

  const isApproved = verificationStatus === 'APPROVED' || worker.verified === true;
  const isRejected = verificationStatus === 'REJECTED';
  const isPending = !isApproved && !isRejected;

  React.useEffect(() => {
    setIsEditing(false);
  }, [verificationStatus, worker.verified]);

  const displayAadhaar = aadhaarNumber || worker.aadhaar || 'Not Provided';

  let badgeColor = 'warning';
  let badgeLabel = 'Pending';
  let badgeIcon = <PendingIcon size={14} />;

  if (isApproved) {
    badgeColor = 'success';
    badgeLabel = 'Approved';
    badgeIcon = <ShieldCheck size={14} />;
  } else if (isRejected) {
    badgeColor = 'error';
    badgeLabel = 'Rejected';
    badgeIcon = <ShieldAlert size={14} />;
  }

  return (
    <Card 
      sx={{ 
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.palette.mode === 'light' 
            ? '0 12px 28px rgba(11, 25, 44, 0.06)' 
            : '0 12px 28px rgba(0, 0, 0, 0.3)',
          borderColor: theme.palette.mode === 'light' ? 'rgba(0, 180, 216, 0.4)' : 'rgba(0, 245, 212, 0.4)'
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Avatar 
              sx={{ 
                width: 56, 
                height: 56, 
                bgcolor: theme.palette.mode === 'light' ? 'primary.main' : 'primary.main',
                color: theme.palette.mode === 'light' ? '#FFFFFF' : '#0B192C',
                fontWeight: 800,
                fontSize: '1.25rem',
                border: `2px solid ${theme.palette.divider}`
              }}
            >
              {fullName.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="800" sx={{ mb: 0.2, lineHeight: 1.2 }}>
                {fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <MapPin size={14} /> {city}
              </Typography>
            </Box>
          </Box>
          <Chip 
            icon={badgeIcon}
            label={badgeLabel} 
            color={badgeColor}
            size="small"
            sx={{ fontWeight: 700, borderRadius: '6px' }}
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          <Grid size={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Award size={18} color="#00B4D8" />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Skillset
                </Typography>
                <Typography variant="body2" fontWeight="700">
                  {skill}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid size={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Shield size={18} color="#00B4D8" />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Experience
                </Typography>
                <Typography variant="body2" fontWeight="700">
                  {experience} Years
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Box 
          sx={{ 
            p: 2, 
            borderRadius: 2, 
            bgcolor: theme.palette.mode === 'light' ? '#F8FAFC' : '#070D19',
            border: `1px solid ${theme.palette.divider}`,
            mb: 3
          }}
        >
          <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.8, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <FileText size={16} color={theme.palette.secondary.main} /> Verification Documents
          </Typography>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Aadhaar Number
            </Typography>
            <Typography variant="body2" fontWeight="600" sx={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>
              {displayAadhaar}
            </Typography>
          </Box>
        </Box>

        
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Contact: <span style={{ fontWeight: 600, color: theme.palette.text.primary }}>{phone}</span> | Email: <span style={{ fontWeight: 600, color: theme.palette.text.primary }}>{email}</span>
          </Typography>
        </Box>

        
        {isPending || isEditing ? (
          <Box display="flex" flexDirection="column" sx={{ gap: 1.5 }}>
            <Box display="flex" sx={{ gap: 2 }}>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                startIcon={<X size={18} />}
                onClick={() => {
                  onReject(id);
                  setIsEditing(false);
                }}
                disabled={isRejected && isEditing}
                sx={{ py: 1 }}
              >
                Reject
              </Button>
              <Button
                variant="contained"
                color="success"
                fullWidth
                startIcon={<Check size={18} />}
                onClick={() => {
                  onApprove(id);
                  setIsEditing(false);
                }}
                disabled={isApproved && isEditing}
                sx={{ py: 1, color: '#FFFFFF' }}
              >
                Approve
              </Button>
            </Box>
            {isEditing && (
              <Button
                variant="text"
                color="inherit"
                fullWidth
                onClick={() => setIsEditing(false)}
                sx={{ py: 0.5, fontSize: '0.8rem' }}
              >
                Cancel
              </Button>
            )}
          </Box>
        ) : (
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={() => setIsEditing(true)}
            sx={{ py: 1, fontWeight: '700' }}
          >
            Edit Status
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkerVerificationCard;
