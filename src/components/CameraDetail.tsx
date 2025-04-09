import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid as MuiGrid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Button,
  Stack,
  Chip,
  Slider,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Tab,
  Tabs,
  FormControl,
  Select,
  MenuItem,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SpeedIcon from '@mui/icons-material/Speed';
import TrafficIcon from '@mui/icons-material/Traffic';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import SettingsIcon from '@mui/icons-material/Settings';
import Header from './Header';
import Sidebar from './Sidebar';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import VideocamIcon from '@mui/icons-material/Videocam';
import InsightsIcon from '@mui/icons-material/Insights';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

// Mock data for the selected intersection
const mockIntersectionData = [
  { 
    id: 1, 
    name: 'North Gate Junction', 
    location: 'Main Entrance Intersection', 
    status: 'Online',
    trafficLevel: 'Low',
    vehicleCount: 42,
    lastUpdated: '2 min ago',
    description: 'Major intersection connecting north campus entrance with the main road'
  },
  { 
    id: 2, 
    name: 'South Gate Crossing', 
    location: 'Back Entrance Intersection', 
    status: 'Online',
    trafficLevel: 'Medium',
    vehicleCount: 87,
    lastUpdated: '5 min ago',
    description: 'Four-way intersection at the southern entrance of the campus'
  },
  { 
    id: 3, 
    name: 'East Highway Junction', 
    location: 'Highway 101 Intersection', 
    status: 'Online',
    trafficLevel: 'High',
    vehicleCount: 153,
    lastUpdated: 'Just now',
    description: 'High traffic intersection connecting to Highway 101'
  },
  { 
    id: 4, 
    name: 'West City Center', 
    location: 'Downtown Crossing', 
    status: 'Offline',
    trafficLevel: 'Low',
    vehicleCount: 0,
    lastUpdated: '1 hr ago',
    description: 'Downtown intersection with pedestrian crossing'
  },
];

// Create a styled Grid component to fix TypeScript errors
const Grid = styled(MuiGrid)(({ theme }) => ({
  // Base styling here if needed
}));

// Create separate items to avoid type errors
const GridItem = styled(MuiGrid)`
  padding: ${({ theme }) => theme.spacing(1.5)};
` as typeof MuiGrid;

// And for container
const GridContainer = styled(MuiGrid)`
  width: 100%;
  margin: 0;
` as typeof MuiGrid;

// Create a styled Paper for consistent card styling
const StyledCard = styled(Paper)(({ theme }) => ({
  borderRadius: 12,
  overflow: 'hidden',
  border: '1px solid #eaeaea',
  height: '100%',
  backgroundColor: '#fff',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
  width: '100%'
}));

// Direct control pad styling
const ControlPad = styled(Box)(({ theme }) => ({
  width: 140,
  height: 140,
  position: 'relative',
  border: '2px solid #eaeaea',
  borderRadius: '50%',
  margin: '0 auto',
  backgroundColor: 'rgba(103, 174, 110, 0.05)'
}));

// Control button styling
const ControlButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'white',
  border: '1px solid #eaeaea',
  '&:hover': {
    backgroundColor: 'rgba(103, 174, 110, 0.1)',
  }
}));

// Section title styling
const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  '& > svg': {
    marginRight: theme.spacing(1),
    color: '#67AE6E'
  }
}));

// Styled components for better UI organization
const ControlSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: 'rgba(243, 246, 249, 0.6)',
  borderRadius: theme.shape.borderRadius,
  border: '1px solid #eaeaea',
}));

const ControlLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  '& svg': {
    marginRight: theme.spacing(1),
    fontSize: '1.2rem',
  },
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'white',
  border: '1px solid #eaeaea',
  boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
  '&:hover': {
    backgroundColor: theme.palette.grey[100],
  },
}));

const CameraDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  // Camera control states
  const [zoomLevel, setZoomLevel] = useState<number[]>([1, 1]);
  const [panTiltSpeed, setPanTiltSpeed] = useState<number>(50);
  const [isPlaying, setIsPlaying] = useState<boolean[]>([true, true]);
  const [isFullscreen, setIsFullscreen] = useState<boolean[]>([false, false]);
  const [videoMode, setVideoMode] = useState<string>('live');
  const [selectedCamera, setSelectedCamera] = useState<number>(0);
  const [activeTab, setActiveTab] = useState(0);
  
  // Find intersection data based on ID
  const intersectionId = parseInt(id || '1');
  const intersection = mockIntersectionData.find(item => item.id === intersectionId) || mockIntersectionData[0];
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCollapseChange = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const drawerWidth = 260;
  const collapsedWidth = 72;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Online':
        return '#67AE6E';
      case 'Offline':
        return '#f44336';
      case 'Maintenance':
        return '#ff9800';
      default:
        return '#777';
    }
  };

  const getTrafficLevelColor = (level: string) => {
    switch (level) {
      case 'Low':
        return '#67AE6E';
      case 'Medium':
        return '#ff9800';
      case 'High':
        return '#f44336';
      default:
        return '#777';
    }
  };
  
  const handleZoomChange = (index: number, newValue: number | number[]) => {
    const newZoomLevels = [...zoomLevel];
    newZoomLevels[index] = newValue as number;
    setZoomLevel(newZoomLevels);
  };
  
  const handlePlayPause = (index: number) => {
    const newPlayingState = [...isPlaying];
    newPlayingState[index] = !newPlayingState[index];
    setIsPlaying(newPlayingState);
  };
  
  const handleFullscreen = (index: number) => {
    const newFullscreenState = [...isFullscreen];
    newFullscreenState[index] = !newFullscreenState[index];
    setIsFullscreen(newFullscreenState);
  };
  
  const handleVideoModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: string,
  ) => {
    if (newMode !== null) {
      setVideoMode(newMode);
    }
  };
  
  const handleBackToList = () => {
    navigate(-1);
  };

  const handleSelectCamera = (index: number) => {
    setSelectedCamera(index);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100%',
      overflow: 'hidden'
    }}>
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
          height: '100vh',
          overflow: 'hidden',
          bgcolor: '#f5f7fa',
          width: {
            sm: `calc(100% - ${isCollapsed ? collapsedWidth : drawerWidth}px)`,
            xs: '100%'
          },
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box 
          sx={{ 
            p: { xs: 2, sm: 3 },
            height: 'calc(100vh - 64px)',
            overflow: 'auto',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,.1)',
              borderRadius: '10px',
            }
          }}
        >
          {/* Header section with back button and intersection info */}
          <Box sx={{ mb: 4 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ArrowBackIcon />}
              onClick={handleBackToList}
              sx={{ 
                mb: 2, 
                borderRadius: '50px',
                borderColor: '#e0e0e0',
                color: '#67AE6E',
                '&:hover': {
                  borderColor: '#67AE6E',
                  backgroundColor: 'rgba(103, 174, 110, 0.04)',
                }
              }}
            >
              Back to Dashboard
            </Button>
            
            <StyledCard sx={{ mb: 3, p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5, color: '#333' }}>
                    {intersection.name}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {intersection.location}
                  </Typography>
                  
                  <Typography variant="body1" sx={{ my: 2 }}>
                    {intersection.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                      <DirectionsCarIcon sx={{ fontSize: 20, color: '#67AE6E', mr: 1 }} />
                      <Typography variant="body2" fontWeight={500}>
                        {intersection.vehicleCount} vehicles
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TimelapseIcon sx={{ fontSize: 20, color: '#67AE6E', mr: 1 }} />
                      <Typography variant="body2" fontWeight={500}>
                        Last updated: {intersection.lastUpdated}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Stack direction="column" spacing={1} sx={{ mt: { xs: 2, sm: 0 } }}>
                  <Chip
                    label={`${intersection.trafficLevel} Traffic`}
                    sx={{
                      backgroundColor: `rgba(${intersection.trafficLevel === 'Low' ? '103, 174, 110' : intersection.trafficLevel === 'Medium' ? '255, 152, 0' : '244, 67, 54'}, 0.1)`,
                      color: getTrafficLevelColor(intersection.trafficLevel),
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      borderRadius: '16px',
                      padding: '20px 10px',
                      height: 'auto'
                    }}
                  />
                  <Chip
                    label={intersection.status}
                    sx={{
                      backgroundColor: `rgba(${intersection.status === 'Online' ? '103, 174, 110' : intersection.status === 'Maintenance' ? '255, 152, 0' : '244, 67, 54'}, 0.1)`,
                      color: getStatusColor(intersection.status),
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      borderRadius: '16px',
                      padding: '20px 10px',
                      height: 'auto'
                    }}
                  />
                </Stack>
              </Box>
            </StyledCard>
            
            {/* Tabs for Camera Feeds and Traffic Analysis */}
            <Tabs 
              value={activeTab}
              onChange={handleTabChange}
              sx={{ 
                mb: 3,
                borderBottom: '1px solid #e0e0e0',
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  minWidth: 'unset',
                  px: 3,
                  py: 1,
                },
                '& .Mui-selected': {
                  color: '#67AE6E'
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#67AE6E',
                  height: 3
                }
              }}
            >
              <Tab label="Camera Feeds" icon={<VisibilityIcon />} iconPosition="start" />
              <Tab label="Traffic Analysis" icon={<TrafficIcon />} iconPosition="start" />
            </Tabs>
          </Box>
          
          {/* Camera Feeds Tab */}
          {activeTab === 0 && (
            <>
              <Box sx={{ 
                display: 'flex', 
                mb: 3, 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                width: '100%',
                backgroundColor: 'white',
                borderRadius: 2,
                p: 2,
                border: '1px solid #eaeaea'
              }}>
                <SectionTitle sx={{ m: 0 }}>
                  <VisibilityIcon />
                  Camera Feeds
                </SectionTitle>
                
                <ToggleButtonGroup
                  value={videoMode}
                  exclusive
                  onChange={handleVideoModeChange}
                  size="small"
                  aria-label="video mode"
                  sx={{
                    '.MuiToggleButtonGroup-grouped': {
                      border: '1px solid #e0e0e0',
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(103, 174, 110, 0.1)',
                        color: '#67AE6E',
                        fontWeight: 500
                      }
                    }
                  }}
                >
                  <ToggleButton value="live" aria-label="live mode" sx={{ textTransform: 'none' }}>
                    Live
                  </ToggleButton>
                  <ToggleButton value="recording" aria-label="recording mode" sx={{ textTransform: 'none' }}>
                    Recordings
                  </ToggleButton>
                  <ToggleButton value="analytics" aria-label="analytics mode" sx={{ textTransform: 'none' }}>
                    Analytics
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
              
              {/* Camera display section */}
              <GridContainer container spacing={3}>
                {/* Left section - Camera displays */}
                <GridItem item xs={12} md={isFullscreen[selectedCamera] ? 12 : 8}>
                  <GridContainer container spacing={3}>
                    {/* Main camera view */}
                    <GridItem item xs={12}>
                      <StyledCard>
                        <Box sx={{ position: 'relative' }}>
                          <Box
                            sx={{
                              height: isFullscreen[selectedCamera] ? 600 : 420,
                              backgroundColor: '#222',
                              position: 'relative',
                              backgroundImage: 'repeating-linear-gradient(45deg, #333 0, #333 5px, #2a2a2a 5px, #2a2a2a 10px)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0) 50%, rgba(0,0,0,0.5) 100%)',
                              }
                            }}
                          >
                            {!isPlaying[selectedCamera] && (
                              <Box sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                zIndex: 2,
                                backgroundColor: 'rgba(0,0,0,0.6)',
                                borderRadius: '50%',
                                width: 60,
                                height: 60,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <PauseIcon sx={{ color: 'white', fontSize: 32 }} />
                              </Box>
                            )}
                            
                            <TrafficIcon sx={{ fontSize: 48, color: '#aaa' }} />
                            
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                opacity: 0.03,
                                backgroundSize: '3px 3px',
                                backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)'
                              }}
                            />
                            
                            {/* Camera controls overlay */}
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                                padding: '30px 16px 12px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <Typography variant="subtitle2" color="white">
                                Camera {selectedCamera + 1} - {selectedCamera === 0 ? 'North' : 'South'} View
                              </Typography>
                              
                              <Box>
                                <IconButton 
                                  size="small" 
                                  sx={{ color: 'white', marginRight: 1 }}
                                  onClick={() => handlePlayPause(selectedCamera)}
                                >
                                  {isPlaying[selectedCamera] ? <PauseIcon /> : <PlayArrowIcon />}
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  sx={{ color: 'white' }}
                                  onClick={() => handleFullscreen(selectedCamera)}
                                >
                                  {isFullscreen[selectedCamera] ? <FullscreenExitIcon /> : <FullscreenIcon />}
                                </IconButton>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                        
                        {/* Camera preview strip */}
                        {!isFullscreen[selectedCamera] && (
                          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                            <Box 
                              onClick={() => handleSelectCamera(0)}
                              sx={{ 
                                width: 100, 
                                height: 60, 
                                backgroundColor: '#333',
                                borderRadius: 1,
                                cursor: 'pointer',
                                position: 'relative',
                                border: selectedCamera === 0 ? '2px solid #67AE6E' : '2px solid transparent',
                                opacity: selectedCamera === 0 ? 1 : 0.7,
                                '&:hover': { opacity: 1 }
                              }}
                            >
                              <Typography variant="caption" sx={{ position: 'absolute', bottom: 5, left: 5, color: 'white' }}>
                                Camera 1
                              </Typography>
                            </Box>
                            <Box 
                              onClick={() => handleSelectCamera(1)}
                              sx={{ 
                                width: 100, 
                                height: 60, 
                                backgroundColor: '#333',
                                borderRadius: 1,
                                cursor: 'pointer',
                                position: 'relative',
                                border: selectedCamera === 1 ? '2px solid #67AE6E' : '2px solid transparent',
                                opacity: selectedCamera === 1 ? 1 : 0.7,
                                '&:hover': { opacity: 1 }
                              }}
                            >
                              <Typography variant="caption" sx={{ position: 'absolute', bottom: 5, left: 5, color: 'white' }}>
                                Camera 2
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </StyledCard>
                    </GridItem>
                  </GridContainer>
                </GridItem>
                
                {/* Right section - Camera controls */}
                {!isFullscreen[selectedCamera] && (
                  <GridItem item xs={12} md={4}>
                    <StyledCard sx={{ p: 3 }}>
                      <SectionTitle>
                        <SettingsIcon />
                        Camera Controls
                      </SectionTitle>
                      
                      {/* Camera selector */}
                      <ControlSection>
                        <ControlLabel variant="body2">
                          <DirectionsCarIcon fontSize="small" /> Camera Selection
                        </ControlLabel>
                        <FormControl fullWidth size="small">
                          <Select
                            value={selectedCamera}
                            onChange={(e) => setSelectedCamera(e.target.value as number)}
                            variant="outlined"
                          >
                            {mockIntersectionData.map((camera, index) => (
                              <MenuItem key={index} value={index}>
                                Camera {index + 1} - {camera.location}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </ControlSection>
                      
                      {/* PTZ controls */}
                      <ControlSection>
                        <ControlLabel variant="body2">
                          <ExpandMoreIcon fontSize="small" /> PTZ Controls
                        </ControlLabel>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                          <Box sx={{ 
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 1,
                            width: 'fit-content' 
                          }}>
                            {/* Top row */}
                            <Box></Box> {/* Empty space */}
                            <StyledIconButton size="medium">
                              <ArrowUpwardIcon />
                            </StyledIconButton>
                            <Box></Box> {/* Empty space */}
                            
                            {/* Middle row */}
                            <StyledIconButton size="medium">
                              <ArrowBackIcon />
                            </StyledIconButton>
                            <StyledIconButton size="medium" sx={{ backgroundColor: 'rgba(25, 118, 210, 0.08)' }}>
                              <CenterFocusStrongIcon />
                            </StyledIconButton>
                            <StyledIconButton size="medium">
                              <ArrowForwardIcon />
                            </StyledIconButton>
                            
                            {/* Bottom row */}
                            <Box></Box> {/* Empty space */}
                            <StyledIconButton size="medium">
                              <ArrowDownwardIcon />
                            </StyledIconButton>
                            <Box></Box> {/* Empty space */}
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                          <Tooltip title="Zoom In">
                            <StyledIconButton>
                              <ZoomInIcon />
                            </StyledIconButton>
                          </Tooltip>
                          <Tooltip title="Zoom Out">
                            <StyledIconButton>
                              <ZoomOutIcon />
                            </StyledIconButton>
                          </Tooltip>
                        </Box>
                      </ControlSection>
                      
                      {/* Video mode controls */}
                      <ControlSection>
                        <ControlLabel variant="body2">
                          <VideocamIcon fontSize="small" /> Video Mode
                        </ControlLabel>
                        <ToggleButtonGroup
                          value={videoMode}
                          exclusive
                          onChange={(e, val) => {
                            if (val) setVideoMode(val);
                          }}
                          size="small"
                          fullWidth
                          aria-label="video mode"
                          sx={{
                            '.MuiToggleButtonGroup-grouped': {
                              border: '1px solid #e0e0e0',
                              '&.Mui-selected': {
                                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                color: '#1976d2',
                                fontWeight: 500
                              }
                            }
                          }}
                        >
                          <ToggleButton value="live" aria-label="live view" sx={{ textTransform: 'none' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <VideocamIcon fontSize="small" sx={{ mr: 0.5 }} />
                              Live View
                            </Box>
                          </ToggleButton>
                          <ToggleButton value="analytics" aria-label="analytics view" sx={{ textTransform: 'none' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <InsightsIcon fontSize="small" sx={{ mr: 0.5 }} />
                              Analytics
                            </Box>
                          </ToggleButton>
                        </ToggleButtonGroup>
                      </ControlSection>
                      
                      {/* View controls */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button 
                          variant="outlined" 
                          startIcon={<FullscreenIcon />}
                          onClick={() => {
                            setIsFullscreen({
                              ...isFullscreen,
                              [selectedCamera]: !isFullscreen[selectedCamera]
                            });
                          }}
                          sx={{ flex: 1, mr: 1 }}
                        >
                          {isFullscreen[selectedCamera] ? 'Exit Fullscreen' : 'Fullscreen'}
                        </Button>
                        
                        <Button 
                          variant="outlined"
                          color="error"
                          startIcon={<FiberManualRecordIcon sx={{ color: 'red' }} />}
                          sx={{ flex: 1 }}
                        >
                          Record
                        </Button>
                      </Box>
                    </StyledCard>
                  </GridItem>
                )}
              </GridContainer>
            </>
          )}
          
          {/* Traffic Analysis Tab */}
          {activeTab === 1 && (
            <>
              <Box sx={{ 
                display: 'flex', 
                mb: 3, 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                width: '100%',
                backgroundColor: 'white',
                borderRadius: 2,
                p: 2,
                border: '1px solid #eaeaea'
              }}>
                <SectionTitle sx={{ m: 0 }}>
                  <TrafficIcon />
                  Traffic Analysis
                </SectionTitle>
              </Box>
              
              <GridContainer container spacing={3}>
                {/* Current Traffic Metrics */}
                <GridItem item xs={12} md={6}>
                  <StyledCard sx={{ p: 3 }}>
                    <SectionTitle>
                      <SpeedIcon />
                      Current Traffic Metrics
                    </SectionTitle>
                    
                    <GridContainer container spacing={3}>
                      <GridItem item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 2, 
                          backgroundColor: 'rgba(103, 174, 110, 0.05)', 
                          borderRadius: 2,
                          height: '100%'
                        }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Vehicle Count
                          </Typography>
                          <Typography variant="h3" fontWeight={600} color="#333">
                            {intersection.vehicleCount}
                          </Typography>
                        </Box>
                      </GridItem>
                      
                      <GridItem item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 2, 
                          backgroundColor: 'rgba(103, 174, 110, 0.05)', 
                          borderRadius: 2,
                          height: '100%' 
                        }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Traffic Level
                          </Typography>
                          <Typography variant="h5" fontWeight={600} sx={{ 
                            color: getTrafficLevelColor(intersection.trafficLevel),
                            display: 'flex',
                            alignItems: 'center',
                            '& .chip': {
                              ml: 1,
                              fontSize: '0.75rem',
                              borderRadius: '12px',
                              padding: '4px 8px',
                              backgroundColor: `rgba(${intersection.trafficLevel === 'Low' ? '103, 174, 110' : intersection.trafficLevel === 'Medium' ? '255, 152, 0' : '244, 67, 54'}, 0.1)`,
                            }
                          }}>
                            {intersection.trafficLevel}
                            <span className="chip">{intersection.trafficLevel === 'Low' ? 'Normal Flow' : intersection.trafficLevel === 'Medium' ? 'Moderate' : 'Congested'}</span>
                          </Typography>
                        </Box>
                      </GridItem>
                      
                      <GridItem item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 2, 
                          backgroundColor: 'rgba(103, 174, 110, 0.05)', 
                          borderRadius: 2,
                          height: '100%'
                        }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Average Speed
                          </Typography>
                          <Typography variant="h4" fontWeight={600} color="#333">
                            {intersection.trafficLevel === 'Low' ? '35' : intersection.trafficLevel === 'Medium' ? '28' : '15'} <span style={{ fontSize: '1rem' }}>mph</span>
                          </Typography>
                        </Box>
                      </GridItem>
                      
                      <GridItem item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 2, 
                          backgroundColor: 'rgba(103, 174, 110, 0.05)', 
                          borderRadius: 2,
                          height: '100%'
                        }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Wait Time
                          </Typography>
                          <Typography variant="h4" fontWeight={600} color="#333">
                            {intersection.trafficLevel === 'Low' ? '45' : intersection.trafficLevel === 'Medium' ? '90' : '180'} <span style={{ fontSize: '1rem' }}>sec</span>
                          </Typography>
                        </Box>
                      </GridItem>
                    </GridContainer>
                  </StyledCard>
                </GridItem>
                
                {/* Traffic Light Control */}
                <GridItem item xs={12} md={6}>
                  <StyledCard sx={{ p: 3 }}>
                    <SectionTitle>
                      <SettingsIcon />
                      Traffic Light Control
                    </SectionTitle>
                    
                    <GridContainer container spacing={3}>
                      <GridItem item xs={12}>
                        <Typography variant="body2" fontWeight={500} color="text.secondary" gutterBottom>
                          Signal Timing Mode
                        </Typography>
                        <ToggleButtonGroup
                          value={videoMode === 'analytics' ? 'manual' : 'automatic'}
                          exclusive
                          onChange={(e, val) => {
                            if (val) setVideoMode(val === 'automatic' ? 'live' : 'analytics');
                          }}
                          size="small"
                          fullWidth
                          aria-label="signal timing mode"
                          sx={{
                            '.MuiToggleButtonGroup-grouped': {
                              border: '1px solid #e0e0e0',
                              py: 1,
                              '&.Mui-selected': {
                                backgroundColor: 'rgba(103, 174, 110, 0.1)',
                                color: '#67AE6E',
                                fontWeight: 500
                              }
                            }
                          }}
                        >
                          <ToggleButton value="automatic" aria-label="automatic mode" sx={{ textTransform: 'none' }}>
                            Automatic
                          </ToggleButton>
                          <ToggleButton value="manual" aria-label="manual mode" sx={{ textTransform: 'none' }}>
                            Manual
                          </ToggleButton>
                        </ToggleButtonGroup>
                      </GridItem>
                      
                      <GridItem item xs={12}>
                        <Box sx={{ backgroundColor: 'rgba(103, 174, 110, 0.05)', p: 2, borderRadius: 2 }}>
                          <Typography variant="body2" fontWeight={500} color="text.secondary" gutterBottom>
                            AI Optimization
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Slider
                              value={75}
                              min={0}
                              max={100}
                              step={5}
                              valueLabelDisplay="auto"
                              marks={[
                                { value: 0, label: 'Off' },
                                { value: 50, label: 'Balanced' },
                                { value: 100, label: 'Max' },
                              ]}
                              sx={{ flexGrow: 1, mr: 2, color: '#67AE6E' }}
                              aria-labelledby="ai-optimization-slider"
                              disabled={videoMode === 'analytics'}
                            />
                            <Chip
                              label="Active"
                              size="small"
                              sx={{
                                backgroundColor: 'rgba(103, 174, 110, 0.1)',
                                color: '#67AE6E',
                                fontSize: '0.75rem',
                                fontWeight: 500
                              }}
                            />
                          </Box>
                        </Box>
                      </GridItem>
                      
                      <GridItem item xs={12}>
                        <Button 
                          variant="contained" 
                          fullWidth
                          sx={{ 
                            backgroundColor: '#67AE6E',
                            '&:hover': {
                              backgroundColor: '#5a9c60',
                            },
                            mt: 1,
                            py: 1.5
                          }}
                          disabled={videoMode !== 'analytics'}
                        >
                          Apply Changes
                        </Button>
                      </GridItem>
                    </GridContainer>
                  </StyledCard>
                </GridItem>
              </GridContainer>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CameraDetail;
