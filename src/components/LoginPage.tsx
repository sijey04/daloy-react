import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Container, 
  TextField, 
  Typography, 
  Paper, 
  Link,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
  Stack
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log({
      email,
      password,
    });
    // Call the onLogin function from props
    onLogin();
    // Navigate to dashboard
    navigate('/');
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f9fa',
      }}
    >
      <Container component="main" maxWidth="xs">
        <Paper 
          elevation={0} 
          sx={{ 
            padding: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            borderRadius: 2,
            background: 'white',
            border: '1px solid #eaeaea'
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(103, 174, 110, 0.1)',
              mb: 3
            }}
          >
            <LockIcon sx={{ color: '#67AE6E' }} />
          </Box>
          
          <Typography component="h1" variant="h4" sx={{ fontWeight: 500, mb: 3 }}>
            Welcome Back
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#67AE6E' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  '&.Mui-focused fieldset': {
                    borderColor: '#67AE6E',
                  },
                },
                '& label.Mui-focused': {
                  color: '#67AE6E',
                }
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#67AE6E' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ 
                mb: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  '&.Mui-focused fieldset': {
                    borderColor: '#67AE6E',
                  },
                },
                '& label.Mui-focused': {
                  color: '#67AE6E',
                }
              }}
            />
            
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ my: 2 }}>
              <FormControlLabel
                control={<Checkbox sx={{ 
                  color: '#BDBDBD',
                  '&.Mui-checked': {
                    color: '#67AE6E',
                  },
                }} />}
                label="Remember me"
              />
              <Link href="#" sx={{ color: '#67AE6E', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </Stack>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                py: 1.5, 
                mb: 2,
                mt: 1, 
                backgroundColor: '#67AE6E',
                borderRadius: 1.5,
                textTransform: 'none',
                fontSize: '1rem',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#559259',
                  boxShadow: 'none',
                }
              }}
            >
              Sign In
            </Button>
            
            <Typography align="center" sx={{ mt: 2 }}>
              <Link href="#" sx={{ color: '#67AE6E', textDecoration: 'none' }}>
                Don't have an account? Sign Up
              </Link>
            </Typography>
          </Box>
        </Paper>
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Copyright © Your Website {new Date().getFullYear()}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage; 