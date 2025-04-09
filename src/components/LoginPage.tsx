import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Typography, 
  Link,
  IconButton,
  Stack,
  TextField,
  InputAdornment
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import TrafficIcon from '@mui/icons-material/Traffic';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const validateEmail = (email: string) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Simple validation
    let isValid = true;
    
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    } else {
      setEmailError('');
    }
    
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    if (isValid) {
      console.log({
        email,
        password,
      });
      // Call the onLogin function from props
      onLogin();
      // Navigate to dashboard
      navigate('/');
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100%',
      '@media (max-width: 900px)': {
        flexDirection: 'column'
      }
    }}>
      {/* Left Side - Green Background with Logo and Description */}
      <Box sx={{ 
        flex: '0 0 33.33%',
        bgcolor: '#67AE6E', 
        display: 'flex',
        flexDirection: 'column',
        p: { xs: 4, md: 6 },
        position: 'relative',
        color: 'white',
        justifyContent: 'space-between',
        '@media (max-width: 900px)': {
          flex: '0 0 auto',
          p: 3
        }
      }}>
        {/* Logo */}
        <Box>
          <Box sx={{ mb: 2 }}>
            <Box 
              sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '12px', 
                backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
              }}
            >
              <TrafficIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
          </Box>
          
          <Typography variant="h1" component="h1" sx={{ 
            fontSize: { xs: '2.5rem', md: '3.5rem' }, 
            fontWeight: 700, 
            mb: 1,
            lineHeight: 1.1,
          }}>
            Hello 
            <br />
            TrafficOpt!
            <Box component="span" sx={{ 
              display: 'inline-block', 
              ml: 1,
              transform: 'rotate(10deg)',
              fontSize: '3rem' 
            }}>
              👋
            </Box>
          </Typography>
          
          <Typography sx={{ 
            mt: 3, 
            maxWidth: '500px',
            fontSize: '1rem',
            lineHeight: 1.6
          }}>
            Skip repetitive and manual traffic management tasks. Get highly productive through automation
            and save tons of time!
          </Typography>
        </Box>
        
        {/* Copyright */}
        <Typography variant="body2" sx={{ opacity: 0.7, pt: 2 }}>
          © {new Date().getFullYear()} TrafficOpt. All rights reserved.
        </Typography>
      </Box>
      
      {/* Right Side - Login Form */}
      <Box sx={{ 
        flex: '1 1 auto',
        bgcolor: '#f5f7fa', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 3, md: 4 }
      }}>
        <Box sx={{ 
          width: '100%', 
          maxWidth: '400px',
          mx: 'auto',
          px: { xs: 2, md: 0 }
        }}>
          <Box sx={{ textAlign: 'right', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ 
              fontSize: '1rem', 
              fontWeight: 600,
              color: '#333'
            }}>
              TrafficOpt
            </Typography>
          </Box>
          
          <Typography variant="h4" sx={{ 
            fontSize: '2rem', 
            fontWeight: 600, 
            mt: { xs: 3, md: 8 },
            mb: 1,
            color: '#333'
          }}>
            Welcome Back!
          </Typography>
          
          <Box sx={{ mb: 5 }}>
            <Typography component="div" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
              Don't have an account?{' '}
              <Link 
                href="#" 
                aria-label="Create account"
                sx={{ 
                  fontWeight: 600,
                  color: '#67AE6E',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Create a new account now
              </Link>
              , it's FREE! Takes less than a minute.
            </Typography>
          </Box>
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* Email Input */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                variant="outlined"
                id="email"
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                error={!!emailError}
                helperText={emailError}
                InputProps={{
                  sx: {
                    bgcolor: 'white',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.1)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(103, 174, 110, 0.4)'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#67AE6E',
                      borderWidth: 1
                    }
                  }
                }}
                aria-label="Email address"
                sx={{
                  '& .MuiFormHelperText-root.Mui-error': {
                    color: '#d32f2f'
                  },
                  '& label.Mui-focused': {
                    color: '#67AE6E'
                  }
                }}
              />
            </Box>
            
            {/* Password Input */}
            <Box sx={{ mb: 4 }}>
              <TextField
                fullWidth
                variant="outlined"
                id="password"
                placeholder="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                error={!!passwordError}
                helperText={passwordError}
                InputProps={{
                  sx: {
                    bgcolor: 'white',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.1)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(103, 174, 110, 0.4)'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#67AE6E',
                      borderWidth: 1
                    }
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                aria-label="Password"
                sx={{
                  '& .MuiFormHelperText-root.Mui-error': {
                    color: '#d32f2f'
                  },
                  '& label.Mui-focused': {
                    color: '#67AE6E'
                  }
                }}
              />
            </Box>
            
            {/* Login Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disableElevation
              sx={{ 
                py: 1.5,
                mb: 2,
                bgcolor: '#67AE6E',
                color: 'white',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#559259',
                  boxShadow: '0 4px 8px rgba(103, 174, 110, 0.2)',
                },
              }}
              aria-label="Login Now"
            >
              Login Now
            </Button>
            
            {/* Google Login Button */}
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              sx={{ 
                py: 1.5,
                mb: 4,
                color: '#555',
                borderColor: '#e0e0e0',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  borderColor: '#67AE6E',
                  bgcolor: 'rgba(103, 174, 110, 0.05)',
                },
              }}
              aria-label="Login with Google"
            >
              Login with Google
            </Button>
            
            {/* Forgot Password */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" display="inline">
                Forgot password
              </Typography>
              <Link 
                href="#" 
                aria-label="Reset password"
                sx={{ 
                  ml: 0.5,
                  color: '#67AE6E',
                  fontWeight: 500,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Click here
              </Link>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage; 