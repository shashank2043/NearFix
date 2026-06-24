import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import MenuItem from '@mui/material/MenuItem';
import { Eye, EyeOff, Mail, Lock, User, Phone, Briefcase, ShieldAlert } from 'lucide-react';
import { authApi } from '../../api/authApi';


const registerSchema = Yup.object().shape({
  fullName: Yup.string()
    .required('Full name is required')
    .min(3, 'Full name must be at least 3 characters'),
  email: Yup.string()
    .required('Email is required')
    .email('Email should be valid'),
  phone: Yup.string()
    .required('Phone is required')
    .matches(/^\d{10,15}$/, 'Phone number must be between 10 and 15 digits'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  role: Yup.string()
    .required('Role is required')
    .oneOf(['CUSTOMER', 'WORKER'])
});


const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const formik = useFormik({
    initialValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      role: 'CUSTOMER',
    },
    validationSchema: registerSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError('');
      setSuccess('');
      try {
        await authApi.register(values);
        setSuccess('Account created successfully! Redirecting to login page...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Container maxWidth="xs" sx={{ mt: 6, mb: 6 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <ShieldAlert size={32} color="#00F5D4" strokeWidth={2.5} />
          <Typography variant="h4" fontWeight="800" sx={{ color: 'text.primary' }}>
            Near<span style={{ color: '#00B4D8' }}>Fix</span>
          </Typography>
        </Box>

        
        <Card sx={{ width: '100%', p: 2 }}>
          <CardContent>
            <Typography variant="h5" fontWeight="700" sx={{ textAlign: 'center' }} gutterBottom>
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
              Join the emergency marketplace
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                {success}
              </Alert>
            )}

            <form onSubmit={formik.handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
                
                <TextField
                  name="fullName"
                  label="Full Name"
                  type="text"
                  fullWidth
                  value={formik.values.fullName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                  helperText={formik.touched.fullName && formik.errors.fullName}
                  disabled={formik.isSubmitting}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start" style={{ marginRight: 8 }}>
                          <User size={18} color="#64748B" />
                        </InputAdornment>
                      ),
                    }
                  }}
                />

                
                <TextField
                  name="email"
                  label="Email Address"
                  type="email"
                  fullWidth
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  disabled={formik.isSubmitting}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start" style={{ marginRight: 8 }}>
                          <Mail size={18} color="#64748B" />
                        </InputAdornment>
                      ),
                    }
                  }}
                />

                
                <TextField
                  name="phone"
                  label="Mobile Number"
                  type="tel"
                  fullWidth
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                  disabled={formik.isSubmitting}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start" style={{ marginRight: 8 }}>
                          <Phone size={18} color="#64748B" />
                        </InputAdornment>
                      ),
                    }
                  }}
                />

                
                <TextField
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  disabled={formik.isSubmitting}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start" style={{ marginRight: 8 }}>
                          <Lock size={18} color="#64748B" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }
                  }}
                />

                
                <TextField
                  select
                  name="role"
                  label="I want to join as a"
                  value={formik.values.role}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.role && Boolean(formik.errors.role)}
                  helperText={formik.touched.role && formik.errors.role}
                  disabled={formik.isSubmitting}
                  fullWidth
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start" style={{ marginRight: 8 }}>
                          <Briefcase size={18} color="#64748B" />
                        </InputAdornment>
                      ),
                    }
                  }}
                >
                  <MenuItem value="CUSTOMER">Customer (Find Helpers)</MenuItem>
                  <MenuItem value="WORKER">Worker (Provide Services)</MenuItem>
                </TextField>

                
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  fullWidth
                  size="large"
                  disabled={formik.isSubmitting}
                  sx={{ py: 1.2, mt: 1 }}
                >
                  {formik.isSubmitting ? 'Registering...' : 'Register'}
                </Button>
              </Box>
            </form>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{
                    color: '#00B4D8',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Login Here
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Register;
