import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
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
  useMediaQuery,
  Modal,
  Fade,
  Backdrop
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import TrafficIcon from '@mui/icons-material/Traffic';
import PanToolIcon from '@mui/icons-material/PanTool';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RefreshIcon from '@mui/icons-material/Refresh';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import Header from './Header';
import Sidebar from './Sidebar';
import { TrafficLightOverlay } from './shared/TrafficLightOverlay';

// Add pulse animation keyframes
const pulseAnimation = `
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.05);
      opacity: 0.9;
    }
  }
`;

// Inject animation styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = pulseAnimation;
  document.head.appendChild(style);
}

// Constants for sidebar dimensions
const drawerWidth = 260;
const collapsedWidth = 72;

// Type definitions
interface Camera {
  id: number;
  name: string;
  status: string;
  orientation: number;
  zoom: number;
  ip: string;
  model: string;
  installation: string;
}

interface TrafficLight {
  id: number;
  direction: string;
  currentState: string;
  timeRemaining: number;
  cycleTime: {
    green: number;
    yellow: number;
    red: number;
  };
}

interface TrafficAnalysis {
  vehiclesPerHour: number;
  averageSpeed: number;
  congestionLevel: string;
  peakHours: string[];
  vehicleTypes: {
    cars: number;
    trucks: number;
    buses: number;
    motorcycles: number;
    bicycles: number;
  };
  waitTimes: {
    average: number;
    north: number;
    east: number;
    south: number;
    west: number;
  };
}

interface IntersectionData {
  id: number;
  name: string;
  location: string;
  status: string;
  trafficLevel: string;
  vehicleCount: number;
  lastUpdated: string;
  cameras: Camera[];
  trafficLights: TrafficLight[];
  trafficAnalysis: TrafficAnalysis;
}

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

// Arduino Status interface (matching arduinoService.ts)
interface ArduinoStatus {
  connected: boolean;
  status: {
    northSouth: string;
    eastWest: string;
    road3: string;
    road4: string;
    mode: string;
  };
}

// Component to load and display a camera stream dynamically
const DynamicCameraStream = ({ camera, opacity = 1 }: { camera: Camera; opacity?: number }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initCamera = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');

        if (videoDevices.length === 0) {
          throw new Error('No cameras found');
        }

        const deviceIndex = camera.id - 1;
        const selectedDevice = videoDevices[deviceIndex];

        if (!selectedDevice) {
          throw new Error(`Camera #${camera.id} not found`);
        }

        let mediaStream: MediaStream;
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: { exact: selectedDevice.deviceId },
              width: { ideal: 1280 },
              height: { ideal: 720 },
              frameRate: { ideal: 15, max: 20 }
            }
          });
        } catch {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: { exact: selectedDevice.deviceId },
              width: { ideal: 640 },
              height: { ideal: 480 },
              frameRate: { ideal: 15, max: 20 }
            }
          });
        }

        streamRef.current = mediaStream;

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error accessing camera:', error);
        const errorMsg = error instanceof Error ? error.message : 'Failed to access camera';
        setError(errorMsg);
        setIsLoading(false);
      }
    };

    initCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [camera.id]);

  return (
    <>
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 2,
            color: '#fff',
            zIndex: 10
          }}
        >
          <CircularProgress size={60} sx={{ color: '#fff' }} />
          <Typography variant="h6">Connecting...</Typography>
        </Box>
      )}

      {error && (
        <Box
          sx={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 2,
            color: '#fff',
            zIndex: 10
          }}
        >
          <Typography variant="h6" color="error">Error</Typography>
          <Typography variant="body2">{error}</Typography>
        </Box>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          opacity: opacity,
          transition: 'opacity 0.3s ease-in-out',
          display: isLoading || error ? 'none' : 'block'
        }}
      />
    </>
  );
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
const CameraFeed = ({ camera, allCameras, trafficLights }: { camera: Camera; allCameras: Camera[]; trafficLights?: TrafficLight[] }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const [zoom, setZoom] = useState(camera.zoom);
  const [pan, setPan] = useState(camera.orientation);
  const [tilt, setTilt] = useState(0);
  const [rotationSpeed, setRotationSpeed] = useState(5);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(() => 
    allCameras.findIndex(c => c.id === camera.id)
  );
  const [isSplitScreen, setIsSplitScreen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [controlPanelTab, setControlPanelTab] = useState(0);
  
  // Arduino real-time state
  const [arduinoStatus, setArduinoStatus] = useState<ArduinoStatus | null>(null);
  const [syncedTrafficLights, setSyncedTrafficLights] = useState<TrafficLight[]>(trafficLights || []);

  // Initialize camera stream
  useEffect(() => {
    const initCamera = async () => {
      try {
        setIsLoading(true);
        setCameraError(null);

        // Get all available video devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');

        console.log(`Available cameras: ${videoDevices.length}`, videoDevices.map(d => d.label));

        if (videoDevices.length === 0) {
          throw new Error('No cameras found. Please connect your USB cameras.');
        }

        // Select camera based on camera.id (1 for first camera, 2 for second)
        const deviceIndex = camera.id - 1;
        const selectedDevice = videoDevices[deviceIndex];

        if (!selectedDevice) {
          throw new Error(`Camera #${camera.id} not found. Only ${videoDevices.length} camera(s) detected. Check USB hub bandwidth.`);
        }

        console.log(`Requesting camera #${camera.id}:`, selectedDevice.label);

        // Try high quality first, fallback to lower quality if bandwidth is limited
        let mediaStream: MediaStream | null = null;
        
        try {
          // Attempt 1: Full HD with lower framerate (better for USB 2.0 hubs)
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: { exact: selectedDevice.deviceId },
              width: { ideal: 1280 },
              height: { ideal: 720 },
              frameRate: { ideal: 15, max: 20 }
            }
          });
          console.log(`Camera #${camera.id} connected at 720p@15fps`);
        } catch (err) {
          console.warn(`Failed 720p, trying 480p:`, err);
          
          // Attempt 2: SD quality (more reliable on USB 2.0)
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: { exact: selectedDevice.deviceId },
              width: { ideal: 640 },
              height: { ideal: 480 },
              frameRate: { ideal: 15, max: 20 }
            }
          });
          console.log(`Camera #${camera.id} connected at 480p@15fps`);
        }

        streamRef.current = mediaStream;

        // Attach stream to video element
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error accessing camera:', error);
        const errorMsg = error instanceof Error ? error.message : 'Failed to access camera';
        setCameraError(errorMsg);
        setIsLoading(false);
      }
    };

    initCamera();

    // Cleanup function
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [camera.id]);

  // Arduino WebSocket connection for real-time updates
  useEffect(() => {
    let timerInterval: number | null = null;

    const connectWebSocket = async () => {
      try {
        const { arduinoService } = await import('../services/arduinoService');
        
        // Connect to WebSocket for real-time updates
        arduinoService.connectWebSocket((status: ArduinoStatus) => {
          console.log('Arduino status update:', status);
          setArduinoStatus(status);
          
          // Map Arduino status to traffic lights
          if (status.connected && status.status) {
            const roadStatuses = [
              status.status.northSouth,
              status.status.eastWest,
              status.status.road3,
              status.status.road4
            ];
            const directions = ['North', 'East', 'South', 'West'];
            
            setSyncedTrafficLights((prevLights) => {
              return prevLights.map((light, index) => {
                const roadStatus = roadStatuses[index];
                
                if (!roadStatus) return light;
                
                // Parse Arduino status (e.g., "RED", "GREEN", "YELLOW")
                let currentState = 'Red';
                if (roadStatus.toUpperCase().includes('GREEN')) currentState = 'Green';
                else if (roadStatus.toUpperCase().includes('YELLOW')) currentState = 'Yellow';
                else if (roadStatus.toUpperCase().includes('RED')) currentState = 'Red';
                
                // Reset timer based on new state
                let newTimeRemaining = light.timeRemaining;
                if (light.currentState !== currentState) {
                  // State changed, reset timer
                  if (currentState === 'Green') newTimeRemaining = light.cycleTime.green;
                  else if (currentState === 'Yellow') newTimeRemaining = light.cycleTime.yellow;
                  else if (currentState === 'Red') newTimeRemaining = light.cycleTime.red;
                }
                
                return {
                  ...light,
                  currentState,
                  timeRemaining: newTimeRemaining,
                  direction: directions[index]
                };
              });
            });
          }
        });

        // Start timer to countdown time remaining
        timerInterval = window.setInterval(() => {
          setSyncedTrafficLights((prevLights) => {
            return prevLights.map((light) => {
              // Decrease time remaining by 1 second
              let newTimeRemaining = light.timeRemaining - 1;
              let newState = light.currentState;
              
              // When timer reaches 0, cycle to next state
              if (newTimeRemaining <= 0) {
                if (light.currentState === 'Green') {
                  newState = 'Yellow';
                  newTimeRemaining = light.cycleTime.yellow;
                } else if (light.currentState === 'Yellow') {
                  newState = 'Red';
                  newTimeRemaining = light.cycleTime.red;
                } else if (light.currentState === 'Red') {
                  newState = 'Green';
                  newTimeRemaining = light.cycleTime.green;
                }
              }
              
              return {
                ...light,
                currentState: newState,
                timeRemaining: newTimeRemaining
              };
            });
          });
        }, 1000); // Update every second

      } catch (error) {
        console.error('Failed to connect to Arduino WebSocket:', error);
      }
    };

    connectWebSocket();

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
      // WebSocket cleanup is handled by the service itself
    };
  }, []);

  const handleZoomChange = (_event: Event, newValue: number | number[]) => {
    setZoom(newValue as number);
  };

  const handlePanChange = (_event: Event, newValue: number | number[]) => {
    setPan(newValue as number);
  };

  const handleTiltChange = (_event: Event, newValue: number | number[]) => {
    setTilt(newValue as number);
  };

  const handleRotationSpeedChange = (_event: Event, newValue: number | number[]) => {
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
  
  const handleNextCamera = () => {
    if (allCameras.length <= 1 || isSplitScreen) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      const nextIndex = (currentCameraIndex + 1) % allCameras.length;
      setCurrentCameraIndex(nextIndex);
      setIsTransitioning(false);
    }, 300);
  };
  
  const handlePrevCamera = () => {
    if (allCameras.length <= 1 || isSplitScreen) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      const prevIndex = (currentCameraIndex - 1 + allCameras.length) % allCameras.length;
      setCurrentCameraIndex(prevIndex);
      setIsTransitioning(false);
    }, 300);
  };
  
  const toggleSplitScreen = () => {
    setIsSplitScreen(!isSplitScreen);
  };
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Card 
      elevation={0}
      data-camera-id={camera.id}
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
            height: 400,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000',
            overflow: 'hidden'
          }}
        >
          {isLoading && (
            <Box
              sx={{
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 2,
                color: '#fff'
              }}
            >
              <CircularProgress size={40} sx={{ color: '#fff' }} />
              <Typography variant="body2">Connecting to camera...</Typography>
            </Box>
          )}

          {cameraError && (
            <Box
              sx={{
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 1,
                color: '#fff',
                textAlign: 'center',
                p: 2
              }}
            >
              <Typography variant="body2" color="error">
                Camera Error
              </Typography>
              <Typography variant="caption" sx={{ color: '#fff', opacity: 0.8 }}>
                {cameraError}
              </Typography>
            </Box>
          )}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            key="main-video"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(${zoom})`,
              display: isLoading || cameraError ? 'none' : 'block'
            }}
          />

          <Typography 
            variant="caption" 
            sx={{ 
              position: 'absolute', 
              bottom: 5, 
              right: 5, 
              color: 'white', 
              backgroundColor: 'rgba(0,0,0,0.7)',
              padding: '2px 6px',
              borderRadius: 1,
              fontSize: '0.65rem',
              zIndex: 10
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
          <IconButton 
            size="small" 
            data-fullscreen-btn
            sx={{ color: '#fff', backgroundColor: 'rgba(0,0,0,0.6)' }}
            onClick={toggleFullscreen}
          >
            <FullscreenIcon fontSize="small" />
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
      
      {/* Fullscreen Modal */}
      <Modal
        open={isFullscreen}
        onClose={toggleFullscreen}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
            sx: { backgroundColor: 'rgba(0, 0, 0, 0.95)' }
          },
        }}
      >
        <Fade in={isFullscreen}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              display: 'flex',
              outline: 'none'
            }}
          >
            {/* Video Area */}
            <Box
              sx={{
                flex: 1,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#000'
              }}
            >
              {!isSplitScreen ? (
                /* Single Camera View with Smooth Transitions */
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <DynamicCameraStream 
                    camera={allCameras[currentCameraIndex]} 
                    opacity={isTransitioning ? 0 : 1}
                  />
                </Box>
              ) : (
                /* Split Screen View - Both Cameras Side by Side */
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    gap: 0.5
                  }}
                >
                  {allCameras.map((cam, index) => (
                    <Box
                      key={cam.id}
                      sx={{
                        flex: 1,
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#000',
                        border: currentCameraIndex === index ? '3px solid #1976d2' : 'none'
                      }}
                    >
                      <DynamicCameraStream camera={cam} />
                      
                      {/* Camera Label for Split Screen */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 10,
                          left: 10,
                          color: '#fff',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                          zIndex: 10
                        }}
                      >
                        {cam.name}
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}

              {/* LIVE Badge - Only show in single camera mode */}
              {!isSplitScreen && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    padding: '8px 16px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: '#fff',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    zIndex: 10
                  }}
                >
                  <FiberManualRecordIcon sx={{ color: '#f44336', fontSize: '1rem', mr: 1 }} />
                  LIVE
                </Box>
              )}

              {/* Camera Name - Show current camera in single mode */}
              {!isSplitScreen && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                    color: '#fff',
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                    zIndex: 10
                  }}
                >
                  {allCameras[currentCameraIndex]?.name}
                </Box>
              )}

              {/* PTZ Info - Only show in single camera mode */}
              {!isSplitScreen && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 20,
                    right: 380,
                    color: '#fff',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    zIndex: 10
                  }}
                >
                  Pan: {pan}° | Tilt: {tilt}° | Zoom: {zoom.toFixed(1)}x
                </Box>
              )}

              {/* Camera Navigation - Better positioned and only in single camera mode */}
              {allCameras.length > 1 && !isSplitScreen && (
                <>
                  <IconButton
                    sx={{
                      position: 'absolute',
                      left: '50%',
                      bottom: 30,
                      transform: 'translateX(-70px)',
                      color: '#fff',
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      width: 56,
                      height: 56,
                      '&:hover': {
                        backgroundColor: 'rgba(30,136,229,0.9)',
                        transform: 'translateX(-70px) scale(1.1)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                    onClick={handlePrevCamera}
                  >
                    <NavigateBeforeIcon sx={{ fontSize: 36 }} />
                  </IconButton>
                  <IconButton
                    sx={{
                      position: 'absolute',
                      left: '50%',
                      bottom: 30,
                      transform: 'translateX(14px)',
                      color: '#fff',
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      width: 56,
                      height: 56,
                      '&:hover': {
                        backgroundColor: 'rgba(30,136,229,0.9)',
                        transform: 'translateX(14px) scale(1.1)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                    onClick={handleNextCamera}
                  >
                    <NavigateNextIcon sx={{ fontSize: 36 }} />
                  </IconButton>
                </>
              )}

              {/* Top Right Controls - Close and Split Screen */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  display: 'flex',
                  gap: 1,
                  zIndex: 10
                }}
              >
                {/* Split Screen Button - Only show if multiple cameras */}
                {allCameras.length > 1 && (
                  <IconButton
                    onClick={toggleSplitScreen}
                    sx={{
                      color: '#fff',
                      backgroundColor: isSplitScreen ? 'rgba(30,136,229,0.9)' : 'rgba(0,0,0,0.7)',
                      width: 50,
                      height: 50,
                      '&:hover': {
                        backgroundColor: isSplitScreen ? 'rgba(30,136,229,1)' : 'rgba(30,136,229,0.7)'
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '2px',
                        width: 24,
                        height: 24
                      }}
                    >
                      <Box sx={{ backgroundColor: '#fff', borderRadius: '2px' }} />
                      <Box sx={{ backgroundColor: '#fff', borderRadius: '2px' }} />
                    </Box>
                  </IconButton>
                )}
                
                {/* Close Fullscreen Button */}
                <IconButton
                  onClick={toggleFullscreen}
                  sx={{
                    color: '#fff',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    width: 50,
                    height: 50,
                    '&:hover': {
                      backgroundColor: 'rgba(244,67,54,0.8)'
                    }
                  }}
                >
                  <FullscreenExitIcon sx={{ fontSize: 30 }} />
                </IconButton>
              </Box>
            </Box>

            {/* Right Side Controls Panel */}
            <Box
              sx={{
                width: 360,
                height: '100vh',
                backgroundColor: 'rgba(30, 30, 30, 0.95)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Tabs Header */}
              <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                <Tabs
                  value={controlPanelTab}
                  onChange={(_e, newValue) => setControlPanelTab(newValue)}
                  textColor="inherit"
                  sx={{
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#1976d2'
                    },
                    '& .MuiTab-root': {
                      color: 'rgba(255,255,255,0.6)',
                      fontWeight: 600,
                      '&.Mui-selected': {
                        color: '#fff'
                      }
                    }
                  }}
                >
                  <Tab icon={<PanToolIcon />} label="PTZ Control" />
                  <Tab icon={<TrafficIcon />} label="Traffic Lights" />
                </Tabs>
              </Box>

              {/* Tab Content */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  p: 3,
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    borderRadius: '4px',
                  }
                }}
              >
                {/* PTZ Control Tab */}
                {controlPanelTab === 0 && (
                  <Box>
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 3 }}>
                      PTZ Control
                    </Typography>

              {/* PTZ Control Pad */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 1.5,
                    width: '100%',
                    maxWidth: 200
                  }}>
                    <Box></Box>
                    <IconButton 
                      size="large" 
                      sx={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                      onClick={() => handlePTZControl('up')}
                    >
                      <Box component="span" sx={{ transform: 'rotate(-90deg)', fontSize: '1.5rem' }}>→</Box>
                    </IconButton>
                    <Box></Box>
                    
                    <IconButton 
                      size="large" 
                      sx={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                      onClick={() => handlePTZControl('left')}
                    >
                      <Box component="span" sx={{ transform: 'rotate(180deg)', fontSize: '1.5rem' }}>→</Box>
                    </IconButton>
                    
                    <IconButton 
                      size="large" 
                      sx={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                      onClick={() => handlePTZControl('home')}
                    >
                      <Box component="span" sx={{ fontSize: '1.5rem' }}>⌂</Box>
                    </IconButton>
                    
                    <IconButton 
                      size="large" 
                      sx={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                      onClick={() => handlePTZControl('right')}
                    >
                      <Box component="span" sx={{ fontSize: '1.5rem' }}>→</Box>
                    </IconButton>
                    
                    <Box></Box>
                    <IconButton 
                      size="large" 
                      sx={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                      onClick={() => handlePTZControl('down')}
                    >
                      <Box component="span" sx={{ transform: 'rotate(90deg)', fontSize: '1.5rem' }}>→</Box>
                    </IconButton>
                    <Box></Box>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <IconButton 
                    size="large" 
                    sx={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                    onClick={() => handlePTZControl('zoomOut')}
                  >
                    <ZoomOutIcon />
                  </IconButton>
                  <IconButton 
                    size="large" 
                    sx={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                    onClick={() => handlePTZControl('zoomIn')}
                  >
                    <ZoomInIcon />
                  </IconButton>
                </Box>
              </Box>

              <Divider sx={{ my: 3, backgroundColor: 'rgba(255,255,255,0.1)' }} />

              {/* Pan Control */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body1" sx={{ color: '#fff' }}>Pan</Typography>
                  <Typography variant="h6" sx={{ color: '#3f51b5', fontWeight: 600 }}>{pan}°</Typography>
                </Box>
                <Slider
                  value={pan}
                  onChange={handlePanChange}
                  min={0}
                  max={360}
                  sx={{ 
                    color: '#3f51b5',
                    '& .MuiSlider-thumb': {
                      width: 24,
                      height: 24
                    }
                  }}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}°`}
                />
              </Box>

              {/* Tilt Control */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body1" sx={{ color: '#fff' }}>Tilt</Typography>
                  <Typography variant="h6" sx={{ color: '#009688', fontWeight: 600 }}>{tilt}°</Typography>
                </Box>
                <Slider
                  value={tilt}
                  onChange={handleTiltChange}
                  min={-90}
                  max={90}
                  sx={{ 
                    color: '#009688',
                    '& .MuiSlider-thumb': {
                      width: 24,
                      height: 24
                    }
                  }}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}°`}
                />
              </Box>

              {/* Zoom Control */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body1" sx={{ color: '#fff' }}>Zoom</Typography>
                  <Typography variant="h6" sx={{ color: '#e91e63', fontWeight: 600 }}>{zoom.toFixed(1)}x</Typography>
                </Box>
                <Slider
                  value={zoom}
                  onChange={handleZoomChange}
                  min={1}
                  max={5}
                  step={0.1}
                  sx={{ 
                    color: '#e91e63',
                    '& .MuiSlider-thumb': {
                      width: 24,
                      height: 24
                    }
                  }}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}x`}
                />
              </Box>

                    {/* Rotation Speed */}
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body1" sx={{ color: '#fff' }}>Rotation Speed</Typography>
                        <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 600 }}>{rotationSpeed}</Typography>
                      </Box>
                      <Slider
                        value={rotationSpeed}
                        onChange={handleRotationSpeedChange}
                        min={1}
                        max={20}
                        step={1}
                        sx={{ 
                          color: '#ff9800',
                          '& .MuiSlider-thumb': {
                            width: 24,
                            height: 24
                          }
                        }}
                        valueLabelDisplay="auto"
                      />
                    </Box>
                  </Box>
                )}

                {/* Traffic Lights Tab */}
                {controlPanelTab === 1 && syncedTrafficLights && syncedTrafficLights.length > 0 && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                        Real-Time Traffic Signals
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FiberManualRecordIcon 
                          sx={{ 
                            color: arduinoStatus?.connected ? '#67AE6E' : '#f44336',
                            fontSize: 12,
                            animation: arduinoStatus?.connected ? 'pulse 2s infinite' : 'none'
                          }} 
                        />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          {arduinoStatus?.connected ? 'Arduino Connected' : 'Arduino Disconnected'}
                        </Typography>
                      </Box>
                    </Box>

                    <Stack spacing={2}>
                      {syncedTrafficLights.map((light) => (
                        <Paper
                          key={light.id}
                          elevation={3}
                          sx={{
                            p: 2,
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: 2,
                            border: '2px solid',
                            borderColor: light.currentState === 'Green' ? '#67AE6E' :
                                        light.currentState === 'Yellow' ? '#ff9800' :
                                        '#f44336'
                          }}
                        >
                          {/* Direction Header */}
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              {light.direction}
                            </Typography>
                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                backgroundColor: light.currentState === 'Green' ? '#67AE6E' :
                                              light.currentState === 'Yellow' ? '#ff9800' :
                                              '#f44336',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: `0 0 20px ${light.currentState === 'Green' ? 'rgba(103, 174, 110, 0.6)' :
                                                       light.currentState === 'Yellow' ? 'rgba(255, 152, 0, 0.6)' :
                                                       'rgba(244, 67, 54, 0.6)'}`,
                                animation: 'pulse 2s infinite'
                              }}
                            >
                              <FiberManualRecordIcon sx={{ color: 'white', fontSize: 28 }} />
                            </Box>
                          </Box>

                          {/* Current State */}
                          <Chip
                            label={light.currentState}
                            sx={{
                              width: '100%',
                              height: 40,
                              fontSize: '1rem',
                              fontWeight: 700,
                              backgroundColor: light.currentState === 'Green' ? '#67AE6E' :
                                            light.currentState === 'Yellow' ? '#ff9800' :
                                            '#f44336',
                              color: 'white',
                              mb: 2
                            }}
                          />

                          {/* Time Remaining */}
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              p: 1.5,
                              backgroundColor: 'rgba(0, 0, 0, 0.05)',
                              borderRadius: 1
                            }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              Time Remaining
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2' }}>
                              {light.timeRemaining}s
                            </Typography>
                          </Box>

                          <Divider sx={{ my: 1.5 }} />

                          {/* Cycle Times */}
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            Cycle Configuration:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip
                              size="small"
                              label={`🟢 ${light.cycleTime.green}s`}
                              sx={{ backgroundColor: 'rgba(103, 174, 110, 0.1)', color: '#67AE6E', fontWeight: 600 }}
                            />
                            <Chip
                              size="small"
                              label={`🟡 ${light.cycleTime.yellow}s`}
                              sx={{ backgroundColor: 'rgba(255, 152, 0, 0.1)', color: '#ff9800', fontWeight: 600 }}
                            />
                            <Chip
                              size="small"
                              label={`🔴 ${light.cycleTime.red}s`}
                              sx={{ backgroundColor: 'rgba(244, 67, 54, 0.1)', color: '#f44336', fontWeight: 600 }}
                            />
                          </Box>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Card>
  );
};

// TrafficAnalysisPanel component
const TrafficAnalysisPanel = ({ analysis }: { analysis: TrafficAnalysis }) => {
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
const CameraSettingsTab = ({ cameras }: { cameras: Camera[] }) => {
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
const TrafficLightSettingsTab = ({ trafficLights }: { trafficLights: TrafficLight[] }) => {
  const [mode, setMode] = useState('automatic');
  const [signalOrder, setSignalOrder] = useState<number[]>([1, 2, 3, 4]); // Order of signals (light IDs)
  const [lightTimings, setLightTimings] = useState<Record<number, { green: number; yellow: number; red: number }>>(
    trafficLights.reduce((acc, light) => ({
      ...acc,
      [light.id]: { ...light.cycleTime }
    }), {})
  );
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  
  const handleOrderChange = (lightId: number, newPosition: number) => {
    const currentIndex = signalOrder.indexOf(lightId);
    const newOrder = [...signalOrder];
    newOrder.splice(currentIndex, 1); // Remove from current position
    newOrder.splice(newPosition, 0, lightId); // Insert at new position
    setSignalOrder(newOrder);
  };
  
  const handleTimingChange = (lightId: number, color: 'green' | 'yellow' | 'red', value: number) => {
    setLightTimings(prev => ({
      ...prev,
      [lightId]: {
        ...prev[lightId],
        [color]: value
      }
    }));
  };
  
  const handleApplyAllChanges = () => {
    // Open confirmation modal
    setConfirmModalOpen(true);
  };
  
  const handleConfirmApply = async () => {
    // Send the data to Arduino via bridge server
    console.log('Applying changes:');
    console.log('Signal Order:', signalOrder);
    console.log('Light Timings:', lightTimings);
    
    try {
      // Import the Arduino service
      const { arduinoService } = await import('../services/arduinoService');
      
      // Convert timings to the format expected by Arduino service
      const timingsArray = Object.entries(lightTimings).map(([lightId, timing]) => ({
        lightId: parseInt(lightId),
        direction: trafficLights.find(l => l.id === parseInt(lightId))?.direction || '',
        ...timing
      }));
      
      // Apply configuration to Arduino
      const success = await arduinoService.applyTimingConfiguration(timingsArray, signalOrder);
      
      if (success) {
        console.log('✅ Configuration applied successfully to Arduino');
      } else {
        console.warn('⚠️ Failed to apply configuration to Arduino - check if bridge server is running');
      }
    } catch (error) {
      console.error('Error applying configuration:', error);
    }
    
    // Close confirmation modal and show success feedback
    setConfirmModalOpen(false);
    setFeedbackModalOpen(true);
  };
  
  const handleCancelApply = () => {
    setConfirmModalOpen(false);
  };
  
  const handleCloseFeedback = () => {
    setFeedbackModalOpen(false);
  };
  
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
            onChange={async (e) => {
              const newMode = e.target.value;
              setMode(newMode);
              
              // Send mode command to Arduino
              try {
                const { arduinoService } = await import('../services/arduinoService');
                if (newMode === 'automatic') {
                  await arduinoService.setMode('AUTO');
                  console.log('✅ Arduino set to AUTO mode');
                } else if (newMode === 'emergency') {
                  await arduinoService.emergencyStop();
                  console.log('🚨 Emergency stop activated on Arduino');
                } else {
                  await arduinoService.setMode('STOP');
                  console.log('⏸️ Arduino stopped (manual control)');
                }
              } catch (error) {
                console.error('Error setting Arduino mode:', error);
              }
            }}
          >
            <MenuItem value="automatic">AI-Optimized (Automatic)</MenuItem>
            <MenuItem value="manual">Manual Control</MenuItem>
            <MenuItem value="scheduled">Time-Based Schedule</MenuItem>
            <MenuItem value="emergency">Emergency Override</MenuItem>
          </Select>
        </FormControl>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            color="primary"
            onClick={async () => {
              try {
                const { arduinoService } = await import('../services/arduinoService');
                const status = await arduinoService.getStatus();
                alert(`Arduino Status:\nConnected: ${status.connected}\nMode: ${status.status.mode}\n\nLights:\nNorth-South: ${status.status.northSouth}\nEast-West: ${status.status.eastWest}\nRoad 3: ${status.status.road3}\nRoad 4: ${status.status.road4}`);
              } catch {
                alert('Failed to get Arduino status. Is the bridge server running?');
              }
            }}
          >
            🔍 Check Arduino Status
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="secondary"
            onClick={async () => {
              try {
                const { arduinoService } = await import('../services/arduinoService');
                await arduinoService.testAllLEDs();
                alert('🔆 LED test initiated! Watch your Arduino LEDs.');
              } catch {
                alert('Failed to test LEDs. Is the bridge server running?');
              }
            }}
          >
            🔆 Test All LEDs
          </Button>
        </Box>
        
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
      
      {/* Signal Sequence Order */}
      {mode !== 'automatic' && (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            mt: 3,
            mb: 3, 
            border: '1px solid #eaeaea', 
            borderRadius: 2,
            backgroundColor: 'rgba(63, 81, 181, 0.03)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AutorenewIcon sx={{ mr: 1, color: '#3f51b5' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Signal Sequence Order
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Define the order in which traffic signals will change. Drag or use arrows to reorder.
          </Typography>
          
          <Stack spacing={1.5}>
            {signalOrder.map((lightId, index) => {
              const light = trafficLights.find(l => l.id === lightId);
              if (!light) return null;
              
              return (
                <Box
                  key={lightId}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    backgroundColor: 'white',
                    borderRadius: 2,
                    border: '2px solid #e0e0e0',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: '#3f51b5',
                      boxShadow: '0 2px 8px rgba(63, 81, 181, 0.15)'
                    }
                  }}
                >
                  {/* Order Number */}
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: '#3f51b5',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1.2rem',
                      mr: 2
                    }}
                  >
                    {index + 1}
                  </Box>
                  
                  {/* Direction Name */}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {light.direction} Direction
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Green: {light.cycleTime.green}s • Yellow: {light.cycleTime.yellow}s • Red: {light.cycleTime.red}s
                    </Typography>
                  </Box>
                  
                  {/* Current State Indicator */}
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
                      fontWeight: 600,
                      mr: 2
                    }}
                  />
                  
                  {/* Reorder Controls */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      disabled={index === 0}
                      onClick={() => handleOrderChange(lightId, index - 1)}
                      sx={{
                        backgroundColor: index === 0 ? 'transparent' : 'rgba(63, 81, 181, 0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(63, 81, 181, 0.2)'
                        },
                        '&.Mui-disabled': {
                          backgroundColor: 'transparent',
                          opacity: 0.3
                        }
                      }}
                    >
                      <Box component="span" sx={{ transform: 'rotate(-90deg)', fontSize: '1.2rem' }}>→</Box>
                    </IconButton>
                    <IconButton
                      size="small"
                      disabled={index === signalOrder.length - 1}
                      onClick={() => handleOrderChange(lightId, index + 1)}
                      sx={{
                        backgroundColor: index === signalOrder.length - 1 ? 'transparent' : 'rgba(63, 81, 181, 0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(63, 81, 181, 0.2)'
                        },
                        '&.Mui-disabled': {
                          backgroundColor: 'transparent',
                          opacity: 0.3
                        }
                      }}
                    >
                      <Box component="span" sx={{ transform: 'rotate(90deg)', fontSize: '1.2rem' }}>→</Box>
                    </IconButton>
                  </Box>
                </Box>
              );
            })}
          </Stack>
          
          {/* Sequence Preview */}
          <Box 
            sx={{ 
              mt: 3, 
              p: 2, 
              backgroundColor: 'rgba(63, 81, 181, 0.05)',
              borderRadius: 1,
              border: '1px dashed rgba(63, 81, 181, 0.3)'
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              📋 Sequence Preview:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {signalOrder.map((lightId, index) => {
                const light = trafficLights.find(l => l.id === lightId);
                return light ? (
                  <span key={lightId}>
                    <strong>{light.direction}</strong>
                    {index < signalOrder.length - 1 ? ' → ' : ' → (cycle repeats)'}
                  </span>
                ) : null;
              })}
            </Typography>
          </Box>
          
        </Paper>
      )}
      
      <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
        Traffic Light Cycle Configuration
      </Typography>
      
      <Stack spacing={2}>
        {trafficLights.map((light) => (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2.5, 
              border: '1px solid #eaeaea', 
              borderRadius: 2,
              backgroundColor: mode === 'automatic' ? 'rgba(0, 0, 0, 0.02)' : 'white'
            }} 
            key={light.id}
          >
            {/* Header with Direction and Current State */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem', mb: 0.5 }}>
                  {light.direction} Direction
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current: <strong>{light.currentState}</strong> • {light.timeRemaining}s remaining
                </Typography>
              </Box>
              <Box 
                sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '50%',
                  backgroundColor: light.currentState === 'Green' ? '#67AE6E' : 
                                  light.currentState === 'Yellow' ? '#ff9800' : 
                                  '#f44336',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 20px ${light.currentState === 'Green' ? 'rgba(103, 174, 110, 0.5)' : 
                                         light.currentState === 'Yellow' ? 'rgba(255, 152, 0, 0.5)' : 
                                         'rgba(244, 67, 54, 0.5)'}`,
                  animation: 'pulse 2s infinite'
                }}
              >
                <FiberManualRecordIcon sx={{ color: 'white', fontSize: 28 }} />
              </Box>
            </Box>
            
            {/* Manual Control Buttons - Only show in manual mode */}
            {mode === 'manual' && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Quick Manual Control:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant={light.currentState === 'Red' ? 'contained' : 'outlined'}
                    onClick={async () => {
                      try {
                        const { arduinoService, lightIdToRoad } = await import('../services/arduinoService');
                        const road = lightIdToRoad(light.id);
                        await arduinoService.setLight(road, 'red');
                        console.log(`✅ ${light.direction} set to RED`);
                      } catch (error) {
                        console.error('Error setting light:', error);
                        alert('Failed to set light. Is the bridge server running?');
                      }
                    }}
                    sx={{
                      flex: 1,
                      backgroundColor: light.currentState === 'Red' ? '#f44336' : 'transparent',
                      borderColor: '#f44336',
                      color: light.currentState === 'Red' ? 'white' : '#f44336',
                      '&:hover': {
                        backgroundColor: light.currentState === 'Red' ? '#d32f2f' : 'rgba(244, 67, 54, 0.1)',
                        borderColor: '#d32f2f'
                      }
                    }}
                  >
                    🔴 Red
                  </Button>
                  <Button
                    size="small"
                    variant={light.currentState === 'Yellow' ? 'contained' : 'outlined'}
                    onClick={async () => {
                      try {
                        const { arduinoService, lightIdToRoad } = await import('../services/arduinoService');
                        const road = lightIdToRoad(light.id);
                        await arduinoService.setLight(road, 'yellow');
                        console.log(`✅ ${light.direction} set to YELLOW`);
                      } catch (error) {
                        console.error('Error setting light:', error);
                        alert('Failed to set light. Is the bridge server running?');
                      }
                    }}
                    sx={{
                      flex: 1,
                      backgroundColor: light.currentState === 'Yellow' ? '#ff9800' : 'transparent',
                      borderColor: '#ff9800',
                      color: light.currentState === 'Yellow' ? 'white' : '#ff9800',
                      '&:hover': {
                        backgroundColor: light.currentState === 'Yellow' ? '#f57c00' : 'rgba(255, 152, 0, 0.1)',
                        borderColor: '#f57c00'
                      }
                    }}
                  >
                    🟡 Yellow
                  </Button>
                  <Button
                    size="small"
                    variant={light.currentState === 'Green' ? 'contained' : 'outlined'}
                    onClick={async () => {
                      try {
                        const { arduinoService, lightIdToRoad } = await import('../services/arduinoService');
                        const road = lightIdToRoad(light.id);
                        await arduinoService.setLight(road, 'green');
                        console.log(`✅ ${light.direction} set to GREEN`);
                      } catch (error) {
                        console.error('Error setting light:', error);
                        alert('Failed to set light. Is the bridge server running?');
                      }
                    }}
                    sx={{
                      flex: 1,
                      backgroundColor: light.currentState === 'Green' ? '#67AE6E' : 'transparent',
                      borderColor: '#67AE6E',
                      color: light.currentState === 'Green' ? 'white' : '#67AE6E',
                      '&:hover': {
                        backgroundColor: light.currentState === 'Green' ? '#559259' : 'rgba(103, 174, 110, 0.1)',
                        borderColor: '#559259'
                      }
                    }}
                  >
                    🟢 Green
                  </Button>
                </Box>
              </Box>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            {/* Cycle Times Configuration */}
            <Typography variant="subtitle2" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
              Signal Timing (seconds)
            </Typography>
            
            <Stack spacing={2.5}>
              {/* Green Light Duration */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box 
                    sx={{ 
                      width: 16, 
                      height: 16, 
                      borderRadius: '50%', 
                      backgroundColor: '#67AE6E',
                      mr: 1
                    }} 
                  />
                  <Typography variant="body2" sx={{ fontWeight: 500, flexGrow: 1 }}>
                    Green Light Duration
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#67AE6E' }}>
                    {lightTimings[light.id]?.green || light.cycleTime.green}s
                  </Typography>
                </Box>
                <Slider
                  value={lightTimings[light.id]?.green || light.cycleTime.green}
                  onChange={(_e, value) => handleTimingChange(light.id, 'green', value as number)}
                  disabled={mode === 'automatic'}
                  min={15}
                  max={60}
                  step={5}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}s`}
                  sx={{ 
                    color: '#67AE6E',
                    '& .MuiSlider-thumb': {
                      width: 20,
                      height: 20
                    }
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">15s (Min)</Typography>
                  <Typography variant="caption" color="text.secondary">60s (Max)</Typography>
                </Box>
              </Box>
              
              {/* Yellow Light Duration */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box 
                    sx={{ 
                      width: 16, 
                      height: 16, 
                      borderRadius: '50%', 
                      backgroundColor: '#ff9800',
                      mr: 1
                    }} 
                  />
                  <Typography variant="body2" sx={{ fontWeight: 500, flexGrow: 1 }}>
                    Yellow Light Duration
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#ff9800' }}>
                    {lightTimings[light.id]?.yellow || light.cycleTime.yellow}s
                  </Typography>
                </Box>
                <Slider
                  value={lightTimings[light.id]?.yellow || light.cycleTime.yellow}
                  onChange={(_e, value) => handleTimingChange(light.id, 'yellow', value as number)}
                  disabled={mode === 'automatic'}
                  min={3}
                  max={8}
                  step={1}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}s`}
                  sx={{ 
                    color: '#ff9800',
                    '& .MuiSlider-thumb': {
                      width: 20,
                      height: 20
                    }
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">3s (Min)</Typography>
                  <Typography variant="caption" color="text.secondary">8s (Max)</Typography>
                </Box>
              </Box>
              
              {/* Red Light Duration */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box 
                    sx={{ 
                      width: 16, 
                      height: 16, 
                      borderRadius: '50%', 
                      backgroundColor: '#f44336',
                      mr: 1
                    }} 
                  />
                  <Typography variant="body2" sx={{ fontWeight: 500, flexGrow: 1 }}>
                    Red Light Duration
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#f44336' }}>
                    {lightTimings[light.id]?.red || light.cycleTime.red}s
                  </Typography>
                </Box>
                <Slider
                  value={lightTimings[light.id]?.red || light.cycleTime.red}
                  onChange={(_e, value) => handleTimingChange(light.id, 'red', value as number)}
                  disabled={mode === 'automatic'}
                  min={30}
                  max={80}
                  step={5}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}s`}
                  sx={{ 
                    color: '#f44336',
                    '& .MuiSlider-thumb': {
                      width: 20,
                      height: 20
                    }
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">30s (Min)</Typography>
                  <Typography variant="caption" color="text.secondary">80s (Max)</Typography>
                </Box>
              </Box>
            </Stack>
            
            {/* Total Cycle Time Info */}
            <Box 
              sx={{ 
                mt: 2.5, 
                p: 1.5, 
                backgroundColor: 'rgba(103, 174, 110, 0.05)',
                borderRadius: 1,
                border: '1px solid rgba(103, 174, 110, 0.2)'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Total Cycle Time:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#67AE6E' }}>
                  {(lightTimings[light.id]?.green || light.cycleTime.green) + 
                   (lightTimings[light.id]?.yellow || light.cycleTime.yellow) + 
                   (lightTimings[light.id]?.red || light.cycleTime.red)} seconds
                </Typography>
              </Box>
            </Box>
            
            {mode === 'automatic' && (
              <Box 
                sx={{ 
                  mt: 2, 
                  p: 1.5, 
                  backgroundColor: 'rgba(103, 174, 110, 0.1)',
                  borderRadius: 1,
                  textAlign: 'center'
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  ⚙️ AI is managing this signal automatically
                </Typography>
              </Box>
            )}
          </Paper>
        ))}
      </Stack>
      
      {/* Single Apply All Changes Button */}
      {mode !== 'automatic' && (
        <Box sx={{ mt: 3, position: 'sticky', bottom: 0, backgroundColor: 'white', pt: 2, pb: 1, borderTop: '2px solid #eaeaea' }}>
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleApplyAllChanges}
            sx={{
              backgroundColor: '#67AE6E',
              py: 1.5,
              fontWeight: 700,
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(103, 174, 110, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(103, 174, 110, 0.4)',
                backgroundColor: '#559259'
              }
            }}
          >
            🚦 Apply All Changes (Sequence + Timing)
          </Button>
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ display: 'block', textAlign: 'center', mt: 1 }}
          >
            This will update both the signal sequence order and all timing configurations
          </Typography>
        </Box>
      )}
      
      {/* Confirmation Modal */}
      <Modal
        open={confirmModalOpen}
        onClose={handleCancelApply}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
            sx: { backgroundColor: 'rgba(0, 0, 0, 0.7)' }
          },
        }}
      >
        <Fade in={confirmModalOpen}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: 500 },
              bgcolor: 'background.paper',
              borderRadius: 3,
              boxShadow: 24,
              p: 0,
              outline: 'none'
            }}
          >
            {/* Modal Header */}
            <Box
              sx={{
                backgroundColor: '#ff9800',
                color: 'white',
                p: 3,
                borderRadius: '12px 12px 0 0',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <WarningIcon sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
                  Confirm Changes
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                  Please review before applying
                </Typography>
              </Box>
            </Box>
            
            {/* Modal Content */}
            <Box sx={{ p: 3 }}>
              <Typography variant="body1" sx={{ mb: 2, color: 'text.primary' }}>
                You are about to apply the following changes to the traffic light system:
              </Typography>
              
              {/* Signal Sequence */}
              <Paper elevation={0} sx={{ p: 2, mb: 2, backgroundColor: 'rgba(63, 81, 181, 0.05)', border: '1px solid rgba(63, 81, 181, 0.2)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AutorenewIcon sx={{ fontSize: 18, color: '#3f51b5' }} />
                  Signal Sequence:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {signalOrder.map((id, index) => {
                    const light = trafficLights.find(l => l.id === id);
                    return (
                      <span key={id}>
                        <strong>{light?.direction}</strong>
                        {index < signalOrder.length - 1 ? ' → ' : ''}
                      </span>
                    );
                  })}
                </Typography>
              </Paper>
              
              {/* Timing Changes */}
              <Paper elevation={0} sx={{ p: 2, backgroundColor: 'rgba(103, 174, 110, 0.05)', border: '1px solid rgba(103, 174, 110, 0.2)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrafficIcon sx={{ fontSize: 18, color: '#67AE6E' }} />
                  Timing Configuration:
                </Typography>
                <Stack spacing={1}>
                  {trafficLights.map(light => (
                    <Box key={light.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {light.direction}:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <span style={{ color: '#67AE6E' }}>🟢 {lightTimings[light.id]?.green}s</span>
                        {' • '}
                        <span style={{ color: '#ff9800' }}>🟡 {lightTimings[light.id]?.yellow}s</span>
                        {' • '}
                        <span style={{ color: '#f44336' }}>🔴 {lightTimings[light.id]?.red}s</span>
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                ⚠️ These changes will affect live traffic flow. Make sure you've reviewed all settings carefully.
              </Typography>
            </Box>
            
            {/* Modal Actions */}
            <Box
              sx={{
                p: 2,
                display: 'flex',
                gap: 2,
                justifyContent: 'flex-end',
                borderTop: '1px solid #eaeaea'
              }}
            >
              <Button
                onClick={handleCancelApply}
                variant="outlined"
                sx={{
                  borderColor: '#ccc',
                  color: 'text.secondary',
                  '&:hover': {
                    borderColor: '#999',
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmApply}
                variant="contained"
                sx={{
                  backgroundColor: '#67AE6E',
                  '&:hover': {
                    backgroundColor: '#559259'
                  },
                  fontWeight: 600
                }}
              >
                Confirm & Apply
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
      
      {/* Success Feedback Modal */}
      <Modal
        open={feedbackModalOpen}
        onClose={handleCloseFeedback}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
            sx: { backgroundColor: 'rgba(0, 0, 0, 0.7)' }
          },
        }}
      >
        <Fade in={feedbackModalOpen}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: 450 },
              bgcolor: 'background.paper',
              borderRadius: 3,
              boxShadow: 24,
              p: 0,
              outline: 'none'
            }}
          >
            {/* Success Header */}
            <Box
              sx={{
                backgroundColor: '#67AE6E',
                color: 'white',
                p: 3,
                borderRadius: '12px 12px 0 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 1
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 60 }} />
              <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
                Changes Applied Successfully!
              </Typography>
            </Box>
            
            {/* Success Content */}
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Your traffic light configuration has been updated.
              </Typography>
              
              <Paper elevation={0} sx={{ p: 2, backgroundColor: 'rgba(103, 174, 110, 0.05)', border: '1px solid rgba(103, 174, 110, 0.2)' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>New Sequence:</strong>
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {signalOrder.map((id, index) => {
                    const light = trafficLights.find(l => l.id === id);
                    return (
                      <span key={id}>
                        {light?.direction}
                        {index < signalOrder.length - 1 ? ' → ' : ''}
                      </span>
                    );
                  })}
                </Typography>
              </Paper>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                ✅ All timing configurations have been synchronized with the traffic control system.
              </Typography>
            </Box>
            
            {/* Success Actions */}
            <Box
              sx={{
                p: 2,
                display: 'flex',
                justifyContent: 'center',
                borderTop: '1px solid #eaeaea'
              }}
            >
              <Button
                onClick={handleCloseFeedback}
                variant="contained"
                fullWidth
                sx={{
                  backgroundColor: '#67AE6E',
                  '&:hover': {
                    backgroundColor: '#559259'
                  },
                  fontWeight: 600,
                  py: 1.2
                }}
              >
                Done
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export const CameraDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mainTabValue, setMainTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [intersectionData, setIntersectionData] = useState<IntersectionData | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [trafficLightOverlayOpen, setTrafficLightOverlayOpen] = useState(false);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIntersectionData(getIntersectionData(id || '1'));
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [id]);

  const handleMainTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setMainTabValue(newValue);
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

          {/* Main Tabs */}
          <Paper 
            elevation={0} 
            sx={{ 
              border: '1px solid #eaeaea',
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={mainTabValue} 
                onChange={handleMainTabChange}
                variant="fullWidth"
                textColor="primary"
                indicatorColor="primary"
                sx={{
                  '& .MuiTab-root': {
                    fontSize: '1rem',
                    fontWeight: 600,
                    py: 2
                  }
                }}
              >
                <Tab label="📹 Camera Inputs" />
                <Tab label="⚙️ Camera Settings" />
                <Tab label="🚦 Traffic Lights" />
              </Tabs>
            </Box>
            
            {/* Tab Content */}
            <Box sx={{ minHeight: '70vh' }}>
              {/* Tab 0: Camera Inputs */}
              <TabPanel value={mainTabValue} index={0}>
                {/* Floating Traffic Light Control Button */}
                <Box
                  sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    zIndex: 1000,
                  }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => setTrafficLightOverlayOpen(true)}
                    startIcon={<TrafficIcon />}
                    sx={{
                      backgroundColor: '#67AE6E',
                      color: 'white',
                      py: 1.5,
                      px: 3,
                      borderRadius: 3,
                      fontWeight: 600,
                      fontSize: '1rem',
                      boxShadow: '0 4px 20px rgba(103, 174, 110, 0.4)',
                      '&:hover': {
                        backgroundColor: '#559259',
                        boxShadow: '0 6px 24px rgba(103, 174, 110, 0.5)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Traffic Lights
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
                  {/* Camera Feeds */}
                  {intersectionData.cameras.map((camera: Camera) => (
                    <Box key={camera.id} sx={{ width: { xs: '100%', lg: '50%' }, p: 1.5 }}>
                      <CameraFeed 
                        camera={camera} 
                        allCameras={intersectionData.cameras}
                        trafficLights={intersectionData.trafficLights}
                      />
                    </Box>
                  ))}
                </Box>
                
                {/* Traffic Analysis */}
                <Box sx={{ mt: 3 }}>
                  <TrafficAnalysisPanel analysis={intersectionData.trafficAnalysis} />
                </Box>
              </TabPanel>
              
              {/* Tab 1: Camera Settings */}
              <TabPanel value={mainTabValue} index={1}>
                <CameraSettingsTab cameras={intersectionData.cameras} />
              </TabPanel>
              
              {/* Tab 2: Traffic Lights */}
              <TabPanel value={mainTabValue} index={2}>
                <TrafficLightSettingsTab trafficLights={intersectionData.trafficLights} />
              </TabPanel>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Traffic Light Overlay - Sliding panel from right */}
      <TrafficLightOverlay
        open={trafficLightOverlayOpen}
        onClose={() => setTrafficLightOverlayOpen(false)}
        trafficLights={intersectionData.trafficLights}
      >
        <TrafficLightSettingsTab trafficLights={intersectionData.trafficLights} />
      </TrafficLightOverlay>
    </Box>
  );
};

export default CameraDetail;
