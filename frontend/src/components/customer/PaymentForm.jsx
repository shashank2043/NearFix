import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
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

// Conditional payment validation schema
const paymentSchema = Yup.object().shape({
  method: Yup.string().required('Payment method is required'),
  upiId: Yup.string().when('method', {
    is: 'UPI',
    then: (schema) => schema
      .required('UPI ID is required')
      .matches(/^[a-zA-Z0-9.\-_]+@[a-zA-Z0-9.\-_]+$/, 'Invalid UPI ID format (e.g., username@bank)'),
    otherwise: (schema) => schema.notRequired(),
  }),
  cardNumber: Yup.string().when('method', {
    is: 'CARD',
    then: (schema) => schema
      .required('Card number is required')
      .matches(/^\d{16}$/, 'Card number must be exactly 16 digits'),
    otherwise: (schema) => schema.notRequired(),
  }),
  cardExpiry: Yup.string().when('method', {
    is: 'CARD',
    then: (schema) => schema
      .required('Expiry date is required')
      .matches(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, 'Expiry date must be in MM/YY format'),
    otherwise: (schema) => schema.notRequired(),
  }),
  cardCvv: Yup.string().when('method', {
    is: 'CARD',
    then: (schema) => schema
      .required('CVV is required')
      .matches(/^\d{3}$/, 'CVV must be exactly 3 digits'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

/**
 * Reusable Payment Selection and Details Form.
 * @param {Object} props
 * @param {function} props.onSubmit - Submission callback returning selector credentials
 * @param {boolean} props.loading - Processing state
 * @param {number} props.amount - Price summary total
 */
const PaymentForm = ({ onSubmit, loading, amount }) => {
  const formik = useFormik({
    initialValues: {
      method: 'UPI',
      upiId: '',
      cardNumber: '',
      cardExpiry: '',
      cardCvv: '',
    },
    validationSchema: paymentSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
        <FormLabel 
          component="legend" 
          sx={{ fontWeight: 700, mb: 1.8, color: 'text.secondary', fontSize: '0.9rem' }}
        >
          Select Payment Method
        </FormLabel>
        <RadioGroup 
          name="method"
          value={formik.values.method} 
          onChange={(e) => {
            formik.setFieldValue('method', e.target.value);
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            
            {/* UPI Option */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                border: '1px solid',
                borderColor: formik.values.method === 'UPI' ? 'secondary.main' : 'divider',
                borderRadius: 2,
                bgcolor: formik.values.method === 'UPI' ? 'action.selected' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => formik.setFieldValue('method', 'UPI')}
            >
              <FormControlLabel
                value="UPI"
                control={<Radio color="secondary" checked={formik.values.method === 'UPI'} />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Smartphone size={20} />
                    <Typography variant="body1" fontWeight="600">
                      UPI (GPay / PhonePe / Paytm)
                    </Typography>
                  </Box>
                }
              />
            </Box>

            {formik.values.method === 'UPI' && (
              <Box sx={{ px: 4, py: 0.5 }}>
                <TextField
                  name="upiId"
                  label="Enter UPI ID"
                  placeholder="username@okhdfcbank"
                  value={formik.values.upiId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.upiId && Boolean(formik.errors.upiId)}
                  helperText={formik.touched.upiId && formik.errors.upiId}
                  fullWidth
                  size="small"
                />
              </Box>
            )}

            {/* CARD Option */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                border: '1px solid',
                borderColor: formik.values.method === 'CARD' ? 'secondary.main' : 'divider',
                borderRadius: 2,
                bgcolor: formik.values.method === 'CARD' ? 'action.selected' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => formik.setFieldValue('method', 'CARD')}
            >
              <FormControlLabel
                value="CARD"
                control={<Radio color="secondary" checked={formik.values.method === 'CARD'} />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CreditCard size={20} />
                    <Typography variant="body1" fontWeight="600">
                      Card (Debit or Credit Card)
                    </Typography>
                  </Box>
                }
              />
            </Box>

            {formik.values.method === 'CARD' && (
              <Box sx={{ px: 4, py: 0.5 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      name="cardNumber"
                      label="Card Number"
                      placeholder="4321 8765 9012 3456"
                      value={formik.values.cardNumber}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.cardNumber && Boolean(formik.errors.cardNumber)}
                      helperText={formik.touched.cardNumber && formik.errors.cardNumber}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name="cardExpiry"
                      label="Expiry Date"
                      placeholder="MM/YY"
                      value={formik.values.cardExpiry}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.cardExpiry && Boolean(formik.errors.cardExpiry)}
                      helperText={formik.touched.cardExpiry && formik.errors.cardExpiry}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name="cardCvv"
                      label="CVV"
                      placeholder="***"
                      type="password"
                      value={formik.values.cardCvv}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.cardCvv && Boolean(formik.errors.cardCvv)}
                      helperText={formik.touched.cardCvv && formik.errors.cardCvv}
                      fullWidth
                      size="small"
                      slotProps={{ htmlInput: { maxLength: 3 } }}
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
        sx={{ 
          display: 'flex',
          alignItems: 'center',
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
