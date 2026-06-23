import React, { useState } from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { CreditCard, Smartphone, ShieldCheck } from 'lucide-react';

/**
 * Reusable Payment Selection and Details Form.
 * @param {Object} props
 * @param {function} props.onSubmit - Submission callback returning selector credentials
 * @param {boolean} props.loading - Processing state
 * @param {number} props.amount - Price summary total
 */
const PaymentForm = ({ onSubmit, loading, amount }) => {
  const [method, setMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      method,
      upiId,
      cardNumber,
      cardExpiry,
      cardCvv,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
        <FormLabel 
          component="legend" 
          sx={{ fontWeight: 700, mb: 1.8, color: 'text.secondary', fontSize: '0.9rem' }}
        >
          Select Payment Method
        </FormLabel>
        <RadioGroup value={method} onChange={(e) => setMethod(e.target.value)}>
          <Box display="flex" flexDirection="column" sx={{ gap: 2 }}>
            
            {/* UPI Option */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                p: 2,
                border: '1px solid',
                borderColor: method === 'UPI' ? 'secondary.main' : 'divider',
                borderRadius: 2,
                bgcolor: method === 'UPI' ? 'action.selected' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setMethod('UPI')}
            >
              <FormControlLabel
                value="UPI"
                control={<Radio color="secondary" />}
                label={
                  <Box display="flex" alignItems="center" sx={{ gap: 1.5 }}>
                    <Smartphone size={20} />
                    <Typography variant="body1" fontWeight="600">
                      UPI (GPay / PhonePe / Paytm)
                    </Typography>
                  </Box>
                }
              />
            </Box>

            {method === 'UPI' && (
              <Box sx={{ px: 4, py: 0.5 }}>
                <TextField
                  label="Enter UPI ID"
                  placeholder="username@okhdfcbank"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  fullWidth
                  required
                  size="small"
                />
              </Box>
            )}

            {/* CARD Option */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                p: 2,
                border: '1px solid',
                borderColor: method === 'CARD' ? 'secondary.main' : 'divider',
                borderRadius: 2,
                bgcolor: method === 'CARD' ? 'action.selected' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setMethod('CARD')}
            >
              <FormControlLabel
                value="CARD"
                control={<Radio color="secondary" />}
                label={
                  <Box display="flex" alignItems="center" sx={{ gap: 1.5 }}>
                    <CreditCard size={20} />
                    <Typography variant="body1" fontWeight="600">
                      Card (Debit or Credit Card)
                    </Typography>
                  </Box>
                }
              />
            </Box>

            {method === 'CARD' && (
              <Box sx={{ px: 4, py: 0.5 }}>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <TextField
                      label="Card Number"
                      placeholder="4321 8765 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      fullWidth
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid size={6}>
                    <TextField
                      label="Expiry Date"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      fullWidth
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid size={6}>
                    <TextField
                      label="CVV"
                      placeholder="***"
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      fullWidth
                      required
                      size="small"
                      inputProps={{ maxLength: 3 }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

          </Box>
        </RadioGroup>
      </FormControl>

      {/* Safety Notice */}
      <Box 
        display="flex" 
        alignItems="center" 
        sx={{ 
          gap: 1.5, 
          p: 1.8, 
          bgcolor: 'action.hover', 
          borderRadius: 2, 
          mb: 3, 
          border: '1px solid', 
          borderColor: 'divider' 
        }}
      >
        <ShieldCheck size={20} color="#00F5D4" style={{ flexShrink: 0 }} />
        <Typography variant="caption" color="text.secondary" fontWeight="500">
          Your transactions are encrypted and secured using PCI-DSS standards. We never save raw CVV/UPI passwords.
        </Typography>
      </Box>

      {/* Action Button */}
      <Button
        type="submit"
        variant="contained"
        color="secondary"
        fullWidth
        size="large"
        disabled={loading}
        sx={{ py: 1.2 }}
      >
        {loading ? 'Processing Secure Transaction...' : `Confirm & Pay ₹${amount}`}
      </Button>
    </form>
  );
};

export default PaymentForm;
