import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  Button,
  Chip,
  Divider,
  IconButton,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  CircularProgress,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import VideocamIcon from '@mui/icons-material/Videocam';
import TrafficIcon from '@mui/icons-material/Traffic';
import PanToolIcon from '@mui/icons-material/PanTool';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RefreshIcon from '@mui/icons-material/Refresh';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import Header from './Header';
import Sidebar from './Sidebar';

// Constants for sidebar dimensions
const drawerWidth = 260;
const collapsedWidth = 72;

// Mock data for a specific intersection
const getIntersectionData = (id: string) => {
  return {
    id: parseInt(id),
    name: `Intersection #${id}`,
    location: `Main St & ${id}th Ave`,
    status: 'Online',
    trafficLevel: ['Low', 'Medium', 'High'][parseInt(id) % 3],
    vehicleCount: 120 + parseInt(id) * 15,
    lastUpdated: '2 mins ago',
    cameras: [
      {
        id: 1,
        name: `360° Camera #1`,
        status: 'Online',
        orientation: 0,
        zoom: 1.0,
        ip: `192.168.1.${id}1`,
        model: 'Xiaomi C300',
        installation: '2023-06-15'
      },
      {
        id: 2,
        name: `360° Camera #2`,
        status: 'Online',
        orientation: 180,
        zoom: 1.0,
        ip: `192.168.1.${id}2`,
        model: 'Xiaomi C300',
        installation: '2023-06-15'
      }
    ],
    trafficLights: [
      {
        id: 1,
        direction: 'North',
        currentState: 'Green',
        timeRemaining: 12,
        cycleTime: {
          green: 30,
          yellow: 5,
          red: 45
        }
      },
      {
        id: 2,
        direction: 'East',
        currentState: 'Red',
        timeRemaining: 18,
        cycleTime: {
          green: 25,
          yellow: 5,
          red: 50
        }
      },
      {
        id: 3,
        direction: 'South',
        currentState: 'Red',
        timeRemaining: 23,
        cycleTime: {
          green: 30,
          yellow: 5,
          red: 45
        }
      },
      {
        id: 4,
        direction: 'West',
        currentState: 'Red',
        timeRemaining: 35,
        cycleTime: {
          green: 25,
          yellow: 5,
          red: 50
        }
      }
    ],
    trafficAnalysis: {
      vehiclesPerHour: 450 + parseInt(id) * 50,
      averageSpeed: 30 + (parseInt(id) % 10),
      congestionLevel: ['Low', 'Medium', 'High'][parseInt(id) % 3],
      peakHours: ['7:00-9:00', '16:00-18:00'],
      vehicleTypes: {
        cars: 78,
        trucks: 12,
        buses: 5,
        motorcycles: 3,
        bicycles: 2
      },
      waitTimes: {
        average: 45 + (parseInt(id) % 15),
        north: 35 + (parseInt(id) % 20),
        east: 55 + (parseInt(id) % 10),
        south: 40 + (parseInt(id) % 15),
        west: 50 + (parseInt(id) % 10)
      }
    }
  };
};

// TabPanel component for the settings tabs
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      style={{ height: '100%', overflow: 'auto' }}
    >
      {value === index && (
        <Box sx={{ p: 3, height: '100%' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Camera Feed component
const CameraFeed = ({ camera }: { camera: any }) => {
  const [zoom, setZoom] = useState(camera.zoom);
  const [pan, setPan] = useState(camera.orientation);
  const [tilt, setTilt] = useState(0);
  const [rotationSpeed, setRotationSpeed] = useState(5);

  const handleZoomChange = (event: any, newValue: number | number[]) => {
    setZoom(newValue as number);
  };

  const handlePanChange = (event: any, newValue: number | number[]) => {
    setPan(newValue as number);
  };

  const handleTiltChange = (event: any, newValue: number | number[]) => {
    setTilt(newValue as number);
  };

  const handleRotationSpeedChange = (event: any, newValue: number | number[]) => {
    setRotationSpeed(newValue as number);
  };

  const handlePTZControl = (direction: string) => {
    // In a real implementation, this would send the command to the camera
    // Here we just update the local state for simulation
    const step = rotationSpeed;
    
    switch(direction) {
      case 'left':
        setPan((prev: number) => (prev - step + 360) % 360);
        break;
      case 'right':
        setPan((prev: number) => (prev + step) % 360);
        break;
      case 'up':
        setTilt((prev: number) => Math.min(prev + step, 90));
        break;
      case 'down':
        setTilt((prev: number) => Math.max(prev - step, -90));
        break;
      case 'zoomIn':
        setZoom((prev: number) => Math.min(prev + 0.1, 5));
        break;
      case 'zoomOut':
        setZoom((prev: number) => Math.max(prev - 0.1, 1));
        break;
      case 'home':
        setPan(camera.orientation);
        setTilt(0);
        setZoom(1.0);
        break;
      default:
        break;
    }
  };

  return (
    <Card 
      elevation={0} 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        border: '1px solid #eaeaea',
        borderRadius: 2
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <Box
          sx={{
            height: 250,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: camera.id === 1 
              ? 'url("/images/camere1.png")' 
              : 'url("/images/camera2.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.3))',
            }
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              position: 'absolute', 
              bottom: 5, 
              right: 5, 
              color: 'white', 
              backgroundColor: 'rgba(0,0,0,0.5)',
              padding: '2px 4px',
              borderRadius: 1,
              fontSize: '0.65rem'
            }}
          >
            Pan: {pan}° | Tilt: {tilt}° | Zoom: {zoom.toFixed(1)}x
          </Typography>
        </Box>

        <Box
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            color: '#fff',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <FiberManualRecordIcon sx={{ color: '#f44336', fontSize: '0.8rem', mr: 0.5 }} />
          LIVE
        </Box>

        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            color: '#fff',
            fontSize: '0.85rem',
            fontWeight: 600,
            textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
          }}
        >
          {camera.name}
        </Box>

        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            display: 'flex',
            gap: 1
          }}
        >
          <IconButton 
            size="small" 
            sx={{ color: '#fff', backgroundColor: 'rgba(0,0,0,0.4)' }}
            onClick={() => handlePTZControl('zoomIn')}
          >
            <ZoomInIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            sx={{ color: '#fff', backgroundColor: 'rgba(0,0,0,0.4)' }}
            onClick={() => handlePTZControl('zoomOut')}
          >
            <ZoomOutIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" sx={{ color: '#fff', backgroundColor: 'rgba(0,0,0,0.4)' }}>
            <PanToolIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            sx={{ color: '#fff', backgroundColor: 'rgba(0,0,0,0.4)' }}
            onClick={() => handlePTZControl('home')}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          PTZ Control
        </Typography>
        
        {/* PTZ Control Pad */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 1,
              width: '100%',
              maxWidth: 160
            }}>
              <Box></Box>
              <IconButton 
                size="small" 
                sx={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                onClick={() => handlePTZControl('up')}
              >
                <Box component="span" sx={{ transform: 'rotate(-90deg)' }}>→</Box>
              </IconButton>
              <Box></Box>
              
              <IconButton 
                size="small" 
                sx={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                onClick={() => handlePTZControl('left')}
              >
                <Box component="span" sx={{ transform: 'rotate(180deg)' }}>→</Box>
              </IconButton>
              
              <IconButton 
                size="small" 
                sx={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                onClick={() => handlePTZControl('home')}
              >
                ⌂
              </IconButton>
              
              <IconButton 
                size="small" 
                sx={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                onClick={() => handlePTZControl('right')}
              >
                →
              </IconButton>
              
              <Box></Box>
              <IconButton 
                size="small" 
                sx={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                onClick={() => handlePTZControl('down')}
              >
                <Box component="span" sx={{ transform: 'rotate(90deg)' }}>→</Box>
              </IconButton>
              <Box></Box>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 1 }}>
            <IconButton 
              size="small" 
              sx={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
              onClick={() => handlePTZControl('zoomOut')}
            >
              <ZoomOutIcon fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              sx={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
              onClick={() => handlePTZControl('zoomIn')}
            >
              <ZoomInIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        
        {/* Pan Value */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">Pan</Typography>
            <Typography variant="body2" color="text.primary">{pan}°</Typography>
          </Box>
          <Slider
            value={pan}
            onChange={handlePanChange}
            aria-labelledby="pan-slider"
            min={0}
            max={360}
            sx={{ color: '#3f51b5' }}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}°`}
          />
        </Box>
        
        {/* Tilt Value */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">Tilt</Typography>
            <Typography variant="body2" color="text.primary">{tilt}°</Typography>
          </Box>
          <Slider
            value={tilt}
            onChange={handleTiltChange}
            aria-labelledby="tilt-slider"
            min={-90}
            max={90}
            sx={{ color: '#009688' }}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}°`}
          />
        </Box>
        
        {/* Zoom Value */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">Zoom</Typography>
            <Typography variant="body2" color="text.primary">{zoom.toFixed(1)}x</Typography>
          </Box>
          <Slider
            value={zoom}
            onChange={handleZoomChange}
            aria-labelledby="zoom-slider"
            min={1}
            max={5}
            step={0.1}
            sx={{ color: '#e91e63' }}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}x`}
          />
        </Box>
        
        {/* Rotation Speed */}
        <Box sx={{ mb: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">Rotation Speed</Typography>
            <Typography variant="body2" color="text.primary">{rotationSpeed}</Typography>
          </Box>
          <Slider
            value={rotationSpeed}
            onChange={handleRotationSpeedChange}
            aria-labelledby="rotation-speed-slider"
            min={1}
            max={20}
            step={1}
            sx={{ color: '#ff9800' }}
            valueLabelDisplay="auto"
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">Slow</Typography>
            <Typography variant="caption" color="text.secondary">Fast</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// TrafficAnalysisPanel component
const TrafficAnalysisPanel = ({ analysis }: { analysis: any }) => {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        height: '100%',
        width: '100%', 
        border: '1px solid #eaeaea',
        borderRadius: 2
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TrafficIcon sx={{ mr: 1, color: '#67AE6E' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Traffic Analysis
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1 }}>
        <Box sx={{ width: { xs: '100%', md: '33.33%' }, p: 1 }}>
          <Card elevation={0} sx={{ backgroundColor: 'rgba(103, 174, 110, 0.1)', p: 1.5, borderRadius: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Vehicles Per Hour</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#67AE6E', mt: 1 }}>
              {analysis.vehiclesPerHour}
            </Typography>
            <Chip 
              label={`${analysis.congestionLevel} Traffic`} 
              size="small" 
              sx={{ 
                mt: 1, 
                backgroundColor: analysis.congestionLevel === 'Low' ? 'rgba(103, 174, 110, 0.2)' : 
                                analysis.congestionLevel === 'Medium' ? 'rgba(255, 152, 0, 0.2)' : 
                                'rgba(244, 67, 54, 0.2)',
                color: analysis.congestionLevel === 'Low' ? '#67AE6E' : 
                      analysis.congestionLevel === 'Medium' ? '#ff9800' : 
                      '#f44336',
                fontWeight: 500
              }} 
            />
          </Card>
        </Box>
        
        <Box sx={{ width: { xs: '100%', md: '33.33%' }, p: 1 }}>
          <Card elevation={0} sx={{ backgroundColor: 'rgba(63, 81, 181, 0.1)', p: 1.5, borderRadius: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Average Speed</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#3f51b5', mt: 1 }}>
              {analysis.averageSpeed} <Typography component="span" variant="body2">km/h</Typography>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Peak Hours: {analysis.peakHours.join(', ')}
            </Typography>
          </Card>
        </Box>
        
        <Box sx={{ width: { xs: '100%', md: '33.33%' }, p: 1 }}>
          <Card elevation={0} sx={{ backgroundColor: 'rgba(233, 30, 99, 0.1)', p: 1.5, borderRadius: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Average Wait Time</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#e91e63', mt: 1 }}>
              {analysis.waitTimes.average} <Typography component="span" variant="body2">sec</Typography>
            </Typography>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                mt: 1,
                flexWrap: 'wrap'
              }}
            >
              <Chip size="small" label={`N: ${analysis.waitTimes.north}s`} sx={{ backgroundColor: 'rgba(233, 30, 99, 0.2)', color: '#e91e63' }} />
              <Chip size="small" label={`E: ${analysis.waitTimes.east}s`} sx={{ backgroundColor: 'rgba(233, 30, 99, 0.2)', color: '#e91e63' }} />
              <Chip size="small" label={`S: ${analysis.waitTimes.south}s`} sx={{ backgroundColor: 'rgba(233, 30, 99, 0.2)', color: '#e91e63' }} />
              <Chip size="small" label={`W: ${analysis.waitTimes.west}s`} sx={{ backgroundColor: 'rgba(233, 30, 99, 0.2)', color: '#e91e63' }} />
            </Box>
          </Card>
        </Box>
      </Box>
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 600 }}>
          Vehicle Distribution
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
          <Chip 
            icon={<DirectionsCarIcon />} 
            label={`Cars: ${analysis.vehicleTypes.cars}%`} 
            sx={{ backgroundColor: 'rgba(103, 174, 110, 0.1)', color: '#67AE6E' }} 
          />
          <Chip 
            icon={<DirectionsCarIcon />} 
            label={`Trucks: ${analysis.vehicleTypes.trucks}%`} 
            sx={{ backgroundColor: 'rgba(63, 81, 181, 0.1)', color: '#3f51b5' }} 
          />
          <Chip 
            icon={<DirectionsCarIcon />} 
            label={`Buses: ${analysis.vehicleTypes.buses}%`} 
            sx={{ backgroundColor: 'rgba(233, 30, 99, 0.1)', color: '#e91e63' }} 
          />
          <Chip 
            icon={<DirectionsBikeIcon />} 
            label={`Motorcycles: ${analysis.vehicleTypes.motorcycles}%`} 
            sx={{ backgroundColor: 'rgba(255, 152, 0, 0.1)', color: '#ff9800' }} 
          />
          <Chip 
            icon={<DirectionsBikeIcon />} 
            label={`Bicycles: ${analysis.vehicleTypes.bicycles}%`} 
            sx={{ backgroundColor: 'rgba(0, 188, 212, 0.1)', color: '#00bcd4' }} 
          />
        </Box>
      </Box>
    </Paper>
  );
};

// Camera Settings Tab
const CameraSettingsTab = ({ cameras }: { cameras: any[] }) => {
  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Camera Settings
      </Typography>
      
      <Stack spacing={2}>
        {cameras.map((camera) => (
          <Paper key={camera.id} elevation={0} sx={{ p: 2, border: '1px solid #eaeaea', borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              {camera.name}
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1 }}>
              <Box sx={{ width: { xs: '100%', sm: '50%' }, p: 1 }}>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel id={`resolution-label-${camera.id}`}>Resolution</InputLabel>
                  <Select
                    labelId={`resolution-label-${camera.id}`}
                    id={`resolution-${camera.id}`}
                    defaultValue="1080p"
                    label="Resolution"
                  >
                    <MenuItem value="720p">720p HD</MenuItem>
                    <MenuItem value="1080p">1080p Full HD</MenuItem>
                    <MenuItem value="1440p">1440p QHD</MenuItem>
                    <MenuItem value="2160p">2160p 4K</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '50%' }, p: 1 }}>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel id={`fps-label-${camera.id}`}>Frame Rate</InputLabel>
                  <Select
                    labelId={`fps-label-${camera.id}`}
                    id={`fps-${camera.id}`}
                    defaultValue="30"
                    label="Frame Rate"
                  >
                    <MenuItem value="15">15 FPS</MenuItem>
                    <MenuItem value="24">24 FPS</MenuItem>
                    <MenuItem value="30">30 FPS</MenuItem>
                    <MenuItem value="60">60 FPS</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Camera Details
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1 }}>
              <Box sx={{ width: { xs: '100%', sm: '50%' }, p: 1 }}>
                <Typography variant="body2" color="text.secondary">IP Address</Typography>
                <Typography variant="body1">{camera.ip}</Typography>
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '50%' }, p: 1 }}>
                <Typography variant="body2" color="text.secondary">Model</Typography>
                <Typography variant="body1">{camera.model}</Typography>
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '50%' }, p: 1 }}>
                <Typography variant="body2" color="text.secondary">Installation Date</Typography>
                <Typography variant="body1">{camera.installation}</Typography>
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '50%' }, p: 1 }}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Chip 
                  size="small" 
                  label={camera.status} 
                  sx={{ 
                    backgroundColor: camera.status === 'Online' ? 'rgba(103, 174, 110, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                    color: camera.status === 'Online' ? '#67AE6E' : '#f44336'
                  }} 
                />
              </Box>
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <FormControlLabel 
                control={<Switch defaultChecked />} 
                label="Motion Detection" 
              />
              <FormControlLabel 
                control={<Switch defaultChecked />} 
                label="Night Vision" 
              />
              <FormControlLabel 
                control={<Switch defaultChecked />} 
                label="Object Recognition" 
              />
            </Box>
            
            <Button 
              variant="outlined" 
              color="primary" 
              sx={{ mt: 2 }}
            >
              Apply Settings
            </Button>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

// Traffic Light Settings Tab
const TrafficLightSettingsTab = ({ trafficLights }: { trafficLights: any[] }) => {
  const [mode, setMode] = useState('automatic');
  
  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Traffic Light Settings
      </Typography>
      
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          mb: 3, 
          border: '1px solid #eaeaea', 
          borderRadius: 2,
          backgroundColor: mode === 'automatic' ? 'rgba(103, 174, 110, 0.05)' : 'rgba(255, 152, 0, 0.05)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, flexGrow: 1 }}>
            Operation Mode
          </Typography>
          <Chip 
            icon={mode === 'automatic' ? <AutorenewIcon /> : <SettingsIcon />}
            label={mode === 'automatic' ? 'AI-Optimized (Automatic)' : 'Manual Control'} 
            color={mode === 'automatic' ? 'primary' : 'warning'}
            sx={{ fontWeight: 500 }}
          />
        </Box>
        
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel id="mode-label">Mode</InputLabel>
          <Select
            labelId="mode-label"
            id="mode-select"
            value={mode}
            label="Mode"
            onChange={(e) => setMode(e.target.value)}
          >
            <MenuItem value="automatic">AI-Optimized (Automatic)</MenuItem>
            <MenuItem value="manual">Manual Control</MenuItem>
            <MenuItem value="scheduled">Time-Based Schedule</MenuItem>
            <MenuItem value="emergency">Emergency Override</MenuItem>
          </Select>
        </FormControl>
        
        {mode === 'automatic' && (
          <Box sx={{ backgroundColor: 'rgba(103, 174, 110, 0.1)', p: 2, borderRadius: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>AI-Optimized Mode:</strong> The system is automatically adjusting traffic light timings based on current traffic conditions.
            </Typography>
            <Typography variant="body2">
              The algorithm is currently prioritizing North-South traffic due to higher congestion levels.
            </Typography>
          </Box>
        )}
      </Paper>
      
      <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
        Traffic Light Cycle Configuration
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1 }}>
        {trafficLights.map((light) => (
          <Box sx={{ width: { xs: '100%', md: '50%' }, p: 1 }} key={light.id}>
            <Paper elevation={0} sx={{ p: 2, border: '1px solid #eaeaea', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, flexGrow: 1 }}>
                  {light.direction} Signal
                </Typography>
                <Chip 
                  label={light.currentState} 
                  size="small" 
                  sx={{ 
                    backgroundColor: light.currentState === 'Green' ? 'rgba(103, 174, 110, 0.1)' : 
                                    light.currentState === 'Yellow' ? 'rgba(255, 152, 0, 0.1)' : 
                                    'rgba(244, 67, 54, 0.1)',
                    color: light.currentState === 'Green' ? '#67AE6E' : 
                          light.currentState === 'Yellow' ? '#ff9800' : 
                          '#f44336',
                    fontWeight: 500
                  }} 
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Time remaining: <strong>{light.timeRemaining} seconds</strong>
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom>
                Cycle Times (seconds)
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -0.5 }}>
                <Box sx={{ width: '33.33%', p: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">Green</Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={light.cycleTime.green}
                      disabled={mode === 'automatic'}
                    >
                      {[15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map((value) => (
                        <MenuItem key={value} value={value}>{value}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ width: '33.33%', p: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">Yellow</Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={light.cycleTime.yellow}
                      disabled={mode === 'automatic'}
                    >
                      {[3, 4, 5, 6, 7, 8].map((value) => (
                        <MenuItem key={value} value={value}>{value}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ width: '33.33%', p: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">Red</Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={light.cycleTime.red}
                      disabled={mode === 'automatic'}
                    >
                      {[30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80].map((value) => (
                        <MenuItem key={value} value={value}>{value}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              
              <Button 
                variant="outlined" 
                color="primary" 
                fullWidth 
                disabled={mode === 'automatic'}
                sx={{ mt: 2 }}
              >
                Apply Changes
              </Button>
            </Paper>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export const CameraDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [intersectionData, setIntersectionData] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIntersectionData(getIntersectionData(id || '1'));
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [id]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCollapseChange = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!intersectionData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Intersection not found</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

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
            p: { xs: 2, md: 3 },
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
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton onClick={handleBack} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
              {intersectionData.name}
            </Typography>
            <Chip 
              label={intersectionData.status} 
              size="small" 
              sx={{ 
                ml: 2,
                backgroundColor: intersectionData.status === 'Online' ? 'rgba(103, 174, 110, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                color: intersectionData.status === 'Online' ? '#67AE6E' : '#f44336'
              }} 
            />
            <Chip 
              label={`${intersectionData.trafficLevel} Traffic`} 
              size="small" 
              sx={{ 
                ml: 1,
                backgroundColor: intersectionData.trafficLevel === 'Low' ? 'rgba(103, 174, 110, 0.1)' : 
                                intersectionData.trafficLevel === 'Medium' ? 'rgba(255, 152, 0, 0.1)' : 
                                'rgba(244, 67, 54, 0.1)',
                color: intersectionData.trafficLevel === 'Low' ? '#67AE6E' : 
                      intersectionData.trafficLevel === 'Medium' ? '#ff9800' : 
                      '#f44336'
              }} 
            />
          </Box>
          
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
            {intersectionData.location} • Last Updated: {intersectionData.lastUpdated}
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
            {/* Main content area (camera feeds and analysis) */}
            <Box sx={{ width: { xs: '100%', md: '66.67%' }, p: 1.5 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
                {/* Camera Feeds */}
                {intersectionData.cameras.map((camera: any) => (
                  <Box key={camera.id} sx={{ width: { xs: '100%', md: '50%' }, p: 1.5 }}>
                    <CameraFeed camera={camera} />
                  </Box>
                ))}
              </Box>
              
              {/* Traffic Analysis */}
              <Box sx={{ mt: 3 }}>
                <TrafficAnalysisPanel analysis={intersectionData.trafficAnalysis} />
              </Box>
            </Box>
            
            {/* Right side panel with settings tabs */}
            <Box sx={{ width: { xs: '100%', md: '33.33%' }, p: 1.5 }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  height: '100%', 
                  width: '100%',
                  display: 'flex', 
                  flexDirection: 'column',
                  border: '1px solid #eaeaea',
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs 
                    value={tabValue} 
                    onChange={handleChange}
                    variant="fullWidth"
                    textColor="primary"
                    indicatorColor="primary"
                  >
                    <Tab label="Camera Settings" />
                    <Tab label="Traffic Lights" />
                  </Tabs>
                </Box>
                
                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                  <TabPanel value={tabValue} index={0}>
                    <CameraSettingsTab cameras={intersectionData.cameras} />
                  </TabPanel>
                  <TabPanel value={tabValue} index={1}>
                    <TrafficLightSettingsTab trafficLights={intersectionData.trafficLights} />
                  </TabPanel>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CameraDetail;
