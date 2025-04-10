import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  Typography, 
  Divider, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  IconButton,
  Paper,
  Grid,
  Avatar,
  Badge,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Stack
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import VideocamIcon from '@mui/icons-material/Videocam';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import TrafficIcon from '@mui/icons-material/Traffic';
import MapIcon from '@mui/icons-material/Map';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import Header from './Header';
import Sidebar from './Sidebar';
import CCTVCard from './CCTVCard';

const drawerWidth = 260;
const collapsedWidth = 72;

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState('Dashboard');
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCollapseChange = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon /> },
    { text: 'Traffic Cameras', icon: <VideocamIcon /> },
    { text: 'Traffic Analysis', icon: <AnalyticsIcon /> },
    { text: 'Traffic Control', icon: <TrafficIcon /> },
    { text: 'Map View', icon: <MapIcon /> },
    { text: 'Settings', icon: <SettingsIcon /> },
  ];

  const drawer = (
    <Box sx={{ overflow: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center' }}>
        <Box 
          sx={{ 
            width: 40, 
            height: 40, 
            borderRadius: '12px', 
            backgroundColor: 'rgba(103, 174, 110, 0.1)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mr: 1.5
          }}
        >
          <TrafficIcon sx={{ color: '#67AE6E', fontSize: 24 }} />
        </Box>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: '#333' }}>
          Traffic Control
        </Typography>
      </Box>
      <Divider sx={{ mt: 1 }} />
      <List sx={{ px: 1, py: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              selected={selectedItem === item.text}
              onClick={() => setSelectedItem(item.text)}
              sx={{
                borderRadius: 2,
                py: 1,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(103, 174, 110, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(103, 174, 110, 0.15)',
                  }
                },
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <ListItemIcon 
                sx={{ 
                  color: selectedItem === item.text ? '#67AE6E' : '#777',
                  minWidth: 45
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  '& .MuiTypography-root': { 
                    fontWeight: selectedItem === item.text ? 600 : 500,
                    color: selectedItem === item.text ? '#67AE6E' : '#555',
                    fontSize: '0.95rem'
                  }
                }}
              />
              {selectedItem === item.text && (
                <Box 
                  sx={{ 
                    width: 4, 
                    height: 24, 
                    borderRadius: 1,
                    backgroundColor: '#67AE6E',
                    ml: 1
                  }} 
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ p: 2, mb: 1 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            borderRadius: 3, 
            backgroundColor: 'rgba(103, 174, 110, 0.08)',
            border: '1px solid rgba(103, 174, 110, 0.15)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <SignalCellularAltIcon sx={{ color: '#67AE6E', mr: 1, fontSize: 20 }} />
            <Typography variant="subtitle2" fontWeight={600} color="#444">
              System Status
            </Typography>
          </Box>
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
              Traffic Flow Efficiency
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={85} 
              sx={{ 
                height: 6, 
                borderRadius: 3,
                backgroundColor: 'rgba(103, 174, 110, 0.15)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#67AE6E'
                }
              }} 
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FiberManualRecordIcon sx={{ color: '#67AE6E', fontSize: 12, mr: 0.5 }} />
            <Typography variant="caption" color="#555">
              All systems operational
            </Typography>
          </Box>
        </Paper>
      </Box>
      <Divider />
      <ListItem disablePadding sx={{ p: 2 }}>
        <ListItemButton sx={{ borderRadius: 2 }}>
          <ListItemIcon sx={{ minWidth: 45 }}>
            <LogoutIcon sx={{ color: '#777' }} />
          </ListItemIcon>
          <ListItemText 
            primary="Logout" 
            sx={{ '& .MuiTypography-root': { fontWeight: 500, color: '#555', fontSize: '0.95rem' } }}
          />
        </ListItemButton>
      </ListItem>
    </Box>
  );

  // Sample data for intersections
  const intersectionData = [
    { 
      id: 1, 
      name: 'North Gate Junction', 
      location: 'Main Entrance Intersection', 
      status: 'Online',
      trafficLevel: 'Low',
      vehicleCount: 42,
      lastUpdated: '2 min ago',
      imageUrl: '/images/camere1.png'
    },
    { 
      id: 2, 
      name: 'South Gate Crossing', 
      location: 'Back Entrance Intersection', 
      status: 'Online',
      trafficLevel: 'Medium',
      vehicleCount: 87,
      lastUpdated: '5 min ago',
      imageUrl: '/images/camera3.jpg'
    },
    { 
      id: 3, 
      name: 'East Highway Junction', 
      location: 'Highway 101 Intersection', 
      status: 'Online',
      trafficLevel: 'High',
      vehicleCount: 153,
      lastUpdated: 'Just now',
      imageUrl: '/images/camera4.jpg'
    }
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Header 
        drawerWidth={drawerWidth} 
        handleDrawerToggle={handleDrawerToggle}
        isMobile={isMobile}
        isCollapsed={isCollapsed}
        collapsedWidth={collapsedWidth}
      />
      
      <Sidebar
        drawerWidth={drawerWidth}
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        onCollapseChange={handleCollapseChange}
      />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: '64px',
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
          bgcolor: '#f5f7fa'
        }}
      >
        <Box 
          sx={{ 
            p: 3, 
            height: 'calc(100vh - 64px)',
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '0.4em',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,.1)',
              borderRadius: '4px',
            }
          }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
            {intersectionData.map(intersection => (
              <Box 
                key={intersection.id} 
                sx={{ 
                  width: { 
                    xs: '100%', 
                    sm: '50%', 
                    md: '33.333%', 
                    lg: '25%' 
                  }, 
                  p: 1.5 
                }}
              >
                <CCTVCard intersection={intersection} />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard; 