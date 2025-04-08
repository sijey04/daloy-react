import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Badge,
  Avatar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';

interface HeaderProps {
  drawerWidth: number;
  handleDrawerToggle: () => void;
  isMobile: boolean;
  isCollapsed?: boolean;
  collapsedWidth?: number;
}

const Header: React.FC<HeaderProps> = ({ 
  drawerWidth, 
  handleDrawerToggle, 
  isMobile, 
  isCollapsed = true,
  collapsedWidth = 72 
}) => {
  // Calculate current drawer width based on collapsed state
  const currentDrawerWidth = isCollapsed && !isMobile ? collapsedWidth : drawerWidth;
  
  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
        ml: { sm: `${currentDrawerWidth}px` },
        backgroundColor: '#f5f7fa',
        color: '#333',
        borderBottom: '1px solid rgba(234, 234, 234, 0.5)',
        boxShadow: 'none',
        transition: theme => theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        zIndex: (theme) => theme.zIndex.drawer - 1
      }}
    >
      <Toolbar sx={{ height: '64px', minHeight: '64px' }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
          Traffic Monitoring System
        </Typography>
        
        <IconButton sx={{ mx: 1 }}>
          <Badge badgeContent={4} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem' } }}>
            <NotificationsIcon sx={{ color: '#555' }} />
          </Badge>
        </IconButton>
        
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
          <Avatar 
            sx={{ 
              width: 38, 
              height: 38, 
              bgcolor: 'rgba(103, 174, 110, 0.1)', 
              color: '#67AE6E',
              border: '2px solid rgba(103, 174, 110, 0.3)'
            }}
          >
            <PersonIcon fontSize="small" />
          </Avatar>
          {!isMobile && (
            <Box sx={{ ml: 1.5, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.1 }}>
                Admin User
              </Typography>
              <Typography variant="caption" color="text.secondary">
                System Administrator
              </Typography>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 