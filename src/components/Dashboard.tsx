import React, { useState } from 'react';
import { 
  Box, 
  useTheme,
  useMediaQuery
} from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import CCTVCard from './CCTVCard';

const drawerWidth = 260;
const collapsedWidth = 72;

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCollapseChange = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
  };

  // Sample data for intersection - Only KCC
  const intersectionData = [
    { 
      id: 1, 
      name: 'KCC Intersection', 
      location: 'Main Entrance Intersection', 
      status: 'Online',
      trafficLevel: 'Low',
      vehicleCount: 42,
      lastUpdated: '2 min ago',
      imageUrl: '/images/Intersection_thumbnail.jpg'
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