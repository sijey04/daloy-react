import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  Typography,
  IconButton,
  Tooltip
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import TrafficIcon from '@mui/icons-material/Traffic';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface SidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
  onCollapseChange?: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ drawerWidth, mobileOpen, handleDrawerToggle, onCollapseChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (onCollapseChange) {
      onCollapseChange(newState);
    }
  };

  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(isCollapsed);
    }
  }, []);

  const collapsedWidth = 72; // Width when collapsed (just enough for icons)

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, active: true },
    { text: 'CCTV Feeds', icon: <VideoLibraryIcon /> },
    { text: 'Analytics', icon: <BarChartIcon /> },
    { text: 'Traffic Management', icon: <TrafficIcon /> },
    { text: 'Settings', icon: <SettingsIcon /> },
  ];

  const drawer = (
    <>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          p: isCollapsed ? 1.5 : 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: isCollapsed ? 'center' : 'space-between',
          height: '64px' 
        }}>
          {!isCollapsed && (
            <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: '#333' }}>
              TrafficMonitor
            </Typography>
          )}
          {isCollapsed ? (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                backgroundColor: 'rgba(103, 174, 110, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrafficIcon sx={{ color: '#67AE6E', fontSize: 24 }} />
            </Box>
          ) : (
            <IconButton onClick={toggleCollapse} sx={{ ml: 1 }}>
              <ChevronLeftIcon />
            </IconButton>
          )}
        </Box>
        
        {isCollapsed && !isMobile && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 1 }}>
            <IconButton 
              onClick={toggleCollapse}
              size="small"
              sx={{ 
                backgroundColor: 'rgba(103, 174, 110, 0.1)',
                color: '#67AE6E',
                '&:hover': { backgroundColor: 'rgba(103, 174, 110, 0.2)' }
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>
        )}
        
        <Divider sx={{ opacity: 0.3 }} />
        <Box sx={{ 
          flexGrow: 1, 
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '0.4em',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,.1)',
            borderRadius: '4px',
          }
        }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <Tooltip title={isCollapsed ? item.text : ""} placement="right">
                  <ListItemButton
                    sx={{
                      py: 1.5,
                      px: isCollapsed ? 1 : 2,
                      minHeight: 48,
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                      backgroundColor: item.active ? 'rgba(103, 174, 110, 0.1)' : 'transparent',
                      borderLeft: item.active ? '4px solid #67AE6E' : '4px solid transparent',
                      '&:hover': {
                        backgroundColor: item.active ? 'rgba(103, 174, 110, 0.15)' : 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: isCollapsed ? 0 : 45,
                        mr: isCollapsed ? 0 : 2,
                        justifyContent: 'center',
                        color: item.active ? '#67AE6E' : 'inherit',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!isCollapsed && (
                      <ListItemText 
                        primary={item.text} 
                        sx={{ 
                          '& .MuiListItemText-primary': {
                            fontWeight: item.active ? 600 : 400,
                            color: item.active ? '#67AE6E' : 'inherit',
                          }
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            ))}
          </List>
        </Box>
        <Divider sx={{ opacity: 0.3 }} />
        <List>
          <ListItem disablePadding>
            <Tooltip title={isCollapsed ? "Help & Support" : ""} placement="right">
              <ListItemButton sx={{ py: 1.5, px: isCollapsed ? 1 : 2, justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                <ListItemIcon sx={{ minWidth: isCollapsed ? 0 : 45, mr: isCollapsed ? 0 : 2, justifyContent: 'center' }}>
                  <HelpOutlineIcon />
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary="Help & Support" />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
          <ListItem disablePadding>
            <Tooltip title={isCollapsed ? "Logout" : ""} placement="right">
              <ListItemButton sx={{ py: 1.5, px: isCollapsed ? 1 : 2, justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                <ListItemIcon sx={{ minWidth: isCollapsed ? 0 : 45, mr: isCollapsed ? 0 : 2, justifyContent: 'center' }}>
                  <LogoutIcon />
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary="Logout" />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        </List>
      </Box>
    </>
  );

  // Calculate current drawer width based on collapsed state
  const currentDrawerWidth = isCollapsed && !isMobile ? collapsedWidth : drawerWidth;

  return (
    <Box
      component="nav"
      sx={{ 
        width: { sm: currentDrawerWidth }, 
        flexShrink: { sm: 0 },
        transition: theme => theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
      aria-label="mailbox folders"
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            borderRight: '1px solid rgba(234, 234, 234, 0.3)',
            backgroundColor: 'transparent',
            boxShadow: 'none',
          },
          zIndex: (theme) => theme.zIndex.drawer,
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: currentDrawerWidth,
            borderRight: '1px solid rgba(234, 234, 234, 0.3)',
            height: '100%',
            overflowX: 'hidden',
            backgroundColor: 'transparent',
            boxShadow: 'none',
            transition: theme => theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
          zIndex: (theme) => theme.zIndex.drawer,
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export { Sidebar, type SidebarProps };
export default Sidebar; 