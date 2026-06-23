import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

/**
 * Account Registration Page.
 * Allows users to register as either a CUSTOMER or a WORKER.
 */
const Register = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER'); // Default role
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !password || !role) {
      setError('Please fill in all required fields');
      return;
    }

    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await authApi.register({
        fullName,
        email,
        phone,
        password,
        role,
      });

      setSuccess('Account created successfully! Redirecting to login page...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      setIsSubmitting(false);
    }
  };

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
        {/* Brand Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <ShieldAlert size={32} color="#00F5D4" strokeWidth={2.5} />
          <Typography variant="h4" fontWeight="800" sx={{ color: 'text.primary' }}>
            Near<span style={{ color: '#00B4D8' }}>Fix</span>
          </Typography>
        </Box>

        {/* Register Form Card */}
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

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
                {/* Full Name Input */}
                <TextField
                  label="Full Name"
                  type="text"
                  fullWidth
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isSubmitting}
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

                {/* Email Input */}
                <TextField
                  label="Email Address"
                  type="email"
                  fullWidth
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
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

                {/* Phone Input */}
                <TextField
                  label="Mobile Number"
                  type="tel"
                  fullWidth
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isSubmitting}
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

                {/* Password Input */}
                <TextField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
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

                {/* Role Selector */}
                <TextField
                  select
                  label="I want to join as a"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={isSubmitting}
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

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  fullWidth
                  size="large"
                  disabled={isSubmitting}
                  sx={{ py: 1.2, mt: 1 }}
                >
                  {isSubmitting ? 'Registering...' : 'Register'}
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
