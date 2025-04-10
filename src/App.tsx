import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './App.css';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import CameraDetail from './components/CameraDetail';
import Settings from './components/Settings';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#67AE6E',
      light: '#89CE90',
      dark: '#4A9C50',
      contrastText: '#fff',
    },
    secondary: {
      main: '#3f51b5',
      light: '#6573C3',
      dark: '#2C3A9E',
      contrastText: '#fff',
    },
    background: {
      default: '#f5f7fa',
      paper: '#fff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#5BA463',
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          height: '100%',
          width: '100%',
          margin: 0,
          padding: 0,
        },
        body: {
          height: '100%',
          width: '100%',
          margin: 0,
          padding: 0,
          overflow: 'hidden'
        },
        '#root': {
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '100%'
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
          boxShadow: '0 0 16px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiGrid: {
      styleOverrides: {
        root: {
          width: '100%',
          margin: 0,
          boxSizing: 'border-box'
        },
        container: {
          width: '100%',
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
          display: 'flex',
          flexWrap: 'wrap'
        }
      },
    },
  },
});

// Check if user is authenticated
// This is a simple example. In a real application, you would check for a valid token in localStorage or cookies
const isAuthenticated = () => {
  return localStorage.getItem('isAuthenticated') === 'true';
};

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  // Function to handle login
  const handleLogin = () => {
    localStorage.setItem('isAuthenticated', 'true');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/camera/:id" 
            element={
              <ProtectedRoute>
                <CameraDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
