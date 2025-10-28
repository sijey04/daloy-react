import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Switch, 
  FormControlLabel,
  Chip,
  Stack,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { DynamicCameraStream } from './camera/DynamicCameraStream';
import { aiService, DetectionResponse, VehicleCounts } from '../services/aiService';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';

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

interface AIDetectionExampleProps {
  camera: Camera;
}

/**
 * Example component showing how to use AI detection with DynamicCameraStream
 * This can be integrated into CameraDetail.tsx
 */
export const AIDetectionExample: React.FC<AIDetectionExampleProps> = ({ camera }) => {
  const [detectionEnabled, setDetectionEnabled] = useState(false);
  const [aiServerHealthy, setAiServerHealthy] = useState<boolean | null>(null);
  const [latestDetection, setLatestDetection] = useState<DetectionResponse | null>(null);
  const [vehicleCounts, setVehicleCounts] = useState<VehicleCounts>({
    car: 0,
    truck: 0,
    bus: 0,
    motorcycle: 0,
    bicycle: 0,
  });

  // Check AI server health
  useEffect(() => {
    const checkHealth = async () => {
      const healthy = await aiService.checkHealth();
      setAiServerHealthy(healthy);
    };
    
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Handle detection results
  const handleDetection = (result: DetectionResponse) => {
    setLatestDetection(result);
    setVehicleCounts(result.vehicle_counts);
  };

  // Calculate congestion level
  const getCongestionLevel = () => {
    if (!latestDetection) return { level: 'Unknown', color: 'default' as const };
    
    const total = latestDetection.total_vehicles;
    if (total < 10) return { level: 'Low', color: 'success' as const };
    if (total < 30) return { level: 'Medium', color: 'warning' as const };
    return { level: 'High', color: 'error' as const };
  };

  const congestion = getCongestionLevel();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        AI Vehicle Detection - {camera.name}
      </Typography>

      {/* Control Panel */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControlLabel
            control={
              <Switch 
                checked={detectionEnabled}
                onChange={(e) => setDetectionEnabled(e.target.checked)}
                disabled={aiServerHealthy === false}
                color="primary"
              />
            }
            label="Enable AI Detection"
          />
          
          {aiServerHealthy === true && (
            <Chip 
              label="AI Server Online" 
              color="success" 
              size="small" 
              variant="outlined"
            />
          )}
          
          {aiServerHealthy === false && (
            <Chip 
              label="AI Server Offline" 
              color="error" 
              size="small" 
              variant="outlined"
            />
          )}
          
          {aiServerHealthy === null && (
            <Chip 
              label="Checking..." 
              color="default" 
              size="small" 
              variant="outlined"
            />
          )}

          {detectionEnabled && latestDetection && (
            <Chip 
              label={`Congestion: ${congestion.level}`}
              color={congestion.color}
              size="small"
            />
          )}
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        {/* Camera Feed */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ height: 600, position: 'relative', overflow: 'hidden', bgcolor: '#000' }}>
            <DynamicCameraStream
              camera={camera}
              enableDetection={detectionEnabled}
              onDetection={handleDetection}
            />
            
            {/* Detection Status Overlay */}
            {detectionEnabled && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  zIndex: 100
                }}
              >
                <Typography variant="body2">
                  🤖 AI Detection Active
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Detection Statistics */}
        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            {/* Total Vehicles */}
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Vehicles Detected
                </Typography>
                <Typography variant="h3" component="div">
                  {latestDetection?.total_vehicles || 0}
                </Typography>
                {latestDetection && (
                  <Typography variant="caption" color="text.secondary">
                    Last updated: {new Date(latestDetection.timestamp).toLocaleTimeString()}
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Vehicle Breakdown */}
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Vehicle Breakdown
                </Typography>
                
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DirectionsCarIcon sx={{ color: '#4caf50' }} />
                      <Typography>Cars</Typography>
                    </Box>
                    <Chip label={vehicleCounts.car} size="small" color="success" />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalShippingIcon sx={{ color: '#f44336' }} />
                      <Typography>Trucks</Typography>
                    </Box>
                    <Chip label={vehicleCounts.truck} size="small" color="error" />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DirectionsBusIcon sx={{ color: '#2196f3' }} />
                      <Typography>Buses</Typography>
                    </Box>
                    <Chip label={vehicleCounts.bus} size="small" color="info" />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TwoWheelerIcon sx={{ color: '#ff9800' }} />
                      <Typography>Motorcycles</Typography>
                    </Box>
                    <Chip label={vehicleCounts.motorcycle} size="small" color="warning" />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DirectionsBikeIcon sx={{ color: '#9c27b0' }} />
                      <Typography>Bicycles</Typography>
                    </Box>
                    <Chip label={vehicleCounts.bicycle} size="small" sx={{ bgcolor: '#9c27b0', color: 'white' }} />
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Detection Info */}
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Detection Details
                </Typography>
                {latestDetection ? (
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      Confidence: High
                    </Typography>
                    <Typography variant="body2">
                      Objects Tracked: {latestDetection.detections.length}
                    </Typography>
                    <Typography variant="body2">
                      Resolution: {latestDetection.image_size.width}x{latestDetection.image_size.height}
                    </Typography>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {detectionEnabled ? 'Waiting for first detection...' : 'Enable detection to see data'}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AIDetectionExample;
