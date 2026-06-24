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
import { Eye, EyeOff, Mail, Lock, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

// Login validation schema
const loginSchema = Yup.object().shape({
  email: Yup.string()
    .required('Email is required')
    .email('Email should be valid'),
  password: Yup.string()
    .required('Password is required')
});

/**
 * Unified Login Page for CUSTOMER, WORKER, and ADMIN roles.
 */
const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError('');
      try {
        const user = await login(values.email, values.password);
        if (!user || !user.role) {
          setError('Login failed: User role is missing.');
          return;
        }
        // Redirect based on user role
        if (user.role === 'CUSTOMER') {
          navigate('/customer/dashboard');
        } else if (user.role === 'WORKER') {
          navigate('/worker/dashboard');
        } else if (user.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          setError('Unknown role. Please contact support.');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Container maxWidth="xs" sx={{ mt: 10, mb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Brand Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <ShieldAlert size={32} color="#00F5D4" strokeWidth={2.5} />
          <Typography variant="h4" fontWeight="800" sx={{ color: 'text.primary' }}>
            Near<span style={{ color: '#00B4D8' }}>Fix</span>
          </Typography>
        </Box>

        {/* Login Form Card */}
        <Card sx={{ width: '100%', p: 2 }}>
          <CardContent>
            <Typography variant="h5" fontWeight="700" sx={{ textAlign: 'center' }} gutterBottom>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
              Enter your credentials to access your account
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={formik.handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Email Input */}
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

                {/* Password Input */}
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

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={formik.isSubmitting}
                  sx={{ py: 1.2, mt: 1 }}
                >
                  {formik.isSubmitting ? 'Logging in...' : 'Login'}
                </Button>
              </Box>
            </form>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  style={{
                    color: '#00B4D8',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Register Here
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Login;
