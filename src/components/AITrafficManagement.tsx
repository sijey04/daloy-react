import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Chip,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { DetectionResponse, aiService } from '../services/aiService';
import { aiServicePretrained } from '../services/aiServicePretrained';

/**
 * AI Traffic Management Component
 * 
 * This component displays a 4-camera grid with real-time AI vehicle detection
 * using the YOLOv11n custom model trained for emergency vehicle detection.
 * 
 * Detection Model: YOLOv11n Custom (best.pt)
 * - Trained on 1,296 emergency vehicle images
 * - Classes: fire_truck, police_car, ambulance, normal_car
 * - Performance: 95.05% mAP50, 98.84% Precision, 93.94% Recall
 * - Detection runs every 3 seconds via aiService
 * 
 * Features:
 * - Real-time YOLO detection on all 4 camera feeds
 * - Directional vehicle counting (East, West, South, North)
 * - Professional traffic light visualization (2x2 grid)
 * - Minimalist, modern design with smooth animations
 */

/**
 * StaticImageStream Component
 * Displays a static image and runs AI detection on it at regular intervals
 */
interface StaticImageStreamProps {
  imagePath: string;
  enableDetection: boolean;
  onDetection?: (result: DetectionResponse) => void;
  usePretrainedModel?: boolean;  // NEW: Toggle between custom and pretrained models
}

const StaticImageStream: React.FC<StaticImageStreamProps> = ({
  imagePath,
  enableDetection,
  onDetection,
  usePretrainedModel = false
}) => {
  const activeService = usePretrainedModel ? aiServicePretrained : aiService;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const detectionIntervalRef = useRef<number | null>(null);
  const frameIntervalRef = useRef<number | null>(null);
  const isProcessingRef = useRef<boolean>(false); // Prevent concurrent detections

  useEffect(() => {
    // Capture canvas ref for cleanup
    const canvas = detectionCanvasRef.current;
    
    // Cleanup function to ensure intervals are cleared
    return () => {
      if (detectionIntervalRef.current) {
        activeService.stopRealtimeDetection(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }
      // Clear detection canvas using captured ref value
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
      isProcessingRef.current = false;
    };
  }, [activeService]);

  useEffect(() => {
    if (!enableDetection || !imgRef.current || !canvasRef.current || !detectionCanvasRef.current) {
      // Clear any existing detection
      if (detectionIntervalRef.current) {
        activeService.stopRealtimeDetection(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }
      // Clear detection canvas
      if (detectionCanvasRef.current) {
        const ctx = detectionCanvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, detectionCanvasRef.current.width, detectionCanvasRef.current.height);
        }
      }
      isProcessingRef.current = false;
      return;
    }

    const processCanvas = canvasRef.current;
    const detectionCanvas = detectionCanvasRef.current;
    const img = imgRef.current;

    const startDetection = () => {
      // Wait for image to load
      if (!img.complete || img.naturalWidth === 0) {
        return;
      }

      // Helper function to draw image to canvas
      const captureFrame = () => {
        if (img.complete && img.naturalWidth > 0) {
          processCanvas.width = img.naturalWidth;
          processCanvas.height = img.naturalHeight;
          const ctx = processCanvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
          }
        }
      };

      // Capture first frame immediately
      captureFrame();

      // Start detection interval with resource-efficient callback
      const intervalId = activeService.startRealtimeDetection(
        processCanvas,
        (result) => {
          // Prevent concurrent processing
          if (isProcessingRef.current) {
            return;
          }
          
          isProcessingRef.current = true;
          
          try {
            // Set detection canvas size to match image (only if changed)
            if (detectionCanvas.width !== img.naturalWidth || detectionCanvas.height !== img.naturalHeight) {
              detectionCanvas.width = img.naturalWidth;
              detectionCanvas.height = img.naturalHeight;
            }
            
            // Draw detections on overlay canvas (skip rotation for static images)
            activeService.drawDetections(detectionCanvas, result.detections, undefined, true);
            
            // Notify parent component
            if (onDetection) {
              onDetection(result);
            }
          } finally {
            isProcessingRef.current = false;
          }
        },
        (error: Error) => {
          console.error('❌ Detection error:', error);
          isProcessingRef.current = false;
        },
        5000 // OPTIMIZED: Detection interval increased to 5 seconds (was 3s)
      );

      // Capture frames periodically - synchronized with detection
      frameIntervalRef.current = window.setInterval(captureFrame, 4900);
      detectionIntervalRef.current = intervalId;

      return () => {
        if (intervalId) {
          activeService.stopRealtimeDetection(intervalId);
        }
        if (frameIntervalRef.current) {
          clearInterval(frameIntervalRef.current);
          frameIntervalRef.current = null;
        }
      };
    };

    // Wait for image to be ready
    if (img.complete && img.naturalWidth > 0) {
      // Image is ready, start immediately
      const cleanup = startDetection();
      return cleanup;
    } else {
      // Wait for image to load
      const onLoad = () => {
        const cleanup = startDetection();
        if (cleanup) {
          return cleanup;
        }
      };
      
      img.addEventListener('load', onLoad);
      
      return () => {
        img.removeEventListener('load', onLoad);
        if (detectionIntervalRef.current) {
          activeService.stopRealtimeDetection(detectionIntervalRef.current);
          detectionIntervalRef.current = null;
        }
        if (frameIntervalRef.current) {
          clearInterval(frameIntervalRef.current);
          frameIntervalRef.current = null;
        }
      };
    }
  }, [enableDetection, onDetection, imagePath, activeService]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000'
      }}
    >
      {/* Static Image */}
      <img
        ref={imgRef}
        src={imagePath}
        alt="Traffic camera view"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />

      {/* Hidden canvas for frame processing */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />
      
      {/* Overlay canvas for detection bounding boxes */}
      <canvas
        ref={detectionCanvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 10,
          objectFit: 'cover'
        }}
      />
    </Box>
  );
};

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

interface AITrafficManagementProps {
  cameras: Camera[];
  trafficLights: TrafficLight[];
  directionVehicleCounts: {
    east: number;
    west: number;
    south: number;
    north: number;
  };
  detectionEnabled: boolean;
  aiServerHealthy: boolean | null;
  onDirectionDetection: (direction: 'east' | 'west' | 'south' | 'north', result: DetectionResponse) => void;
  lanePriorityQueue?: Array<'east' | 'west' | 'south' | 'north'>;
  // Adaptive Traffic Control Props
  aiControlEnabled?: boolean;
  onAiControlToggle?: (enabled: boolean) => void;
  currentGreenLane?: 'east' | 'west' | 'south' | 'north' | null;
  laneActiveTimeLeft?: number; // Countdown: time left for current green lane
  laneWaitingTimes?: Record<string, number>; // Estimated wait time for each non-green lane
  lastDecisionTime?: Date | null;
}


export const AITrafficManagement: React.FC<AITrafficManagementProps> = ({
  trafficLights,
  directionVehicleCounts,
  detectionEnabled,
  aiServerHealthy,
  onDirectionDetection,
  lanePriorityQueue = ['east', 'west', 'south', 'north'],
  aiControlEnabled = false,
  onAiControlToggle,
  currentGreenLane = null,
  laneActiveTimeLeft = 0,
  laneWaitingTimes = { east: 0, west: 0, south: 0, north: 0 },
  lastDecisionTime = null
}) => {
  // Model selector state - DEFAULT TO PRETRAINED
  const [modelType, setModelType] = useState<'custom' | 'pretrained'>('pretrained');
  // Calculate next priority lane based on vehicle counts
  const calculateNextPriority = (): 'east' | 'west' | 'south' | 'north' => {
    // Simple priority: most vehicles first
    const counts = {
      east: directionVehicleCounts.east,
      west: directionVehicleCounts.west,
      south: directionVehicleCounts.south,
      north: directionVehicleCounts.north
    };
    
    const lanesWithVehicles = lanePriorityQueue.filter(lane => counts[lane] > 0);
    return lanesWithVehicles.length > 0 ? lanesWithVehicles[0] : lanePriorityQueue[0];
  };

  const nextPriorityLane = calculateNextPriority();
  
  // Get priority position for each lane (1 = next, 2 = second, etc.)
  const getLanePriority = (direction: 'east' | 'west' | 'south' | 'north'): number => {
    return lanePriorityQueue.indexOf(direction) + 1;
  };

  // DEBUG: Log detection status
  useEffect(() => {
    console.log('🔍 AI Traffic Management Status:', {
      detectionEnabled,
      aiServerHealthy,
      actuallyEnabled: detectionEnabled && aiServerHealthy === true
    });
  }, [detectionEnabled, aiServerHealthy]);

  return (
    <Box sx={{ display: 'flex', gap: 2, height: '100%', overflow: 'hidden' }}>
      {/* Left Side - 4 Camera Grid (2x2) - Scrollable */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 2,
        overflowY: 'auto',
        paddingRight: 1
      }}>
        {/* Model Selector Banner */}
        <Paper
          elevation={1}
          sx={{
            p: 1.5,
            backgroundColor: modelType === 'custom' ? 'rgba(139, 92, 246, 0.05)' : 'rgba(249, 115, 22, 0.05)',
            border: modelType === 'custom' ? '1px solid rgba(139, 92, 246, 0.2)' : '1px solid rgba(249, 115, 22, 0.2)',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: modelType === 'custom' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(249, 115, 22, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem'
            }}
          >
            {modelType === 'custom' ? '🎯' : '🌐'}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1F2937' }}>
              {modelType === 'custom' ? 'Custom Model (Toy Cars)' : 'Pretrained Model (COCO)'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              {modelType === 'custom' 
                ? 'Classes: ambulance, fire_truck, police_car, normal_car • Port 5000' 
                : 'Classes: car, truck, bus, motorcycle, bicycle • Port 5001'}
            </Typography>
          </Box>
          <ToggleButtonGroup
            value={modelType}
            exclusive
            onChange={(_, newModel) => newModel && setModelType(newModel)}
            size="small"
            sx={{ height: 32 }}
          >
            <ToggleButton value="custom" sx={{ px: 2, fontWeight: 600 }}>
              Custom
            </ToggleButton>
            <ToggleButton value="pretrained" sx={{ px: 2, fontWeight: 600 }}>
              Pretrained
            </ToggleButton>
          </ToggleButtonGroup>
        </Paper>

        {/* Fair Rotation Info Banner */}
        <Paper
          elevation={1}
          sx={{
            p: 1.5,
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem'
            }}
          >
            🔄
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1F2937' }}>
              Fair Lane Rotation Active
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              Next priority: <strong style={{ color: '#3B82F6', textTransform: 'uppercase' }}>{nextPriorityLane}</strong> • No lane repeats
            </Typography>
          </Box>
          <Box
            sx={{
              px: 2,
              py: 0.5,
              borderRadius: 1,
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#059669' }}>
              {lanePriorityQueue.map(l => l.charAt(0).toUpperCase()).join(' → ')}
            </Typography>
          </Box>
        </Paper>

        {/* Adaptive Traffic Control Panel */}
        <Paper
          elevation={1}
          sx={{
            p: 2,
            backgroundColor: aiControlEnabled ? 'rgba(16, 185, 129, 0.05)' : 'rgba(107, 114, 128, 0.05)',
            border: aiControlEnabled ? '2px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(107, 114, 128, 0.2)',
            borderRadius: 2
          }}
        >
          {/* Header with Toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: aiControlEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(107, 114, 128, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem'
                }}
              >
                🧠
              </Box>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1F2937' }}>
                  AI Adaptive Control
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  {aiControlEnabled ? 'Dynamic green time based on traffic' : 'Manual control mode'}
                </Typography>
              </Box>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={aiControlEnabled}
                  onChange={(e) => onAiControlToggle?.(e.target.checked)}
                  disabled={!detectionEnabled}
                  color="success"
                />
              }
              label=""
            />
          </Box>

          {/* Status Grid */}
          {aiControlEnabled && (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
              {/* Current Green Lane */}
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  backgroundColor: currentGreenLane ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.05)',
                  border: '1px solid',
                  borderColor: currentGreenLane ? 'rgba(16, 185, 129, 0.3)' : 'rgba(107, 114, 128, 0.15)'
                }}
              >
                <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 0.5 }}>
                  Current Green
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: currentGreenLane ? '#10B981' : '#9CA3AF' }}>
                  {currentGreenLane ? currentGreenLane.toUpperCase() : '—'}
                </Typography>
              </Box>

              {/* Last Decision Time */}
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  backgroundColor: 'rgba(59, 130, 246, 0.05)',
                  border: '1px solid rgba(59, 130, 246, 0.15)'
                }}
              >
                <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 0.5 }}>
                  Last Decision
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#3B82F6' }}>
                  {lastDecisionTime ? `${Math.floor((Date.now() - lastDecisionTime.getTime()) / 1000)}s ago` : 'None'}
                </Typography>
              </Box>

              {/* Wait Times for Each Lane (or Active Time if green) */}
              {(['east', 'west', 'south', 'north'] as const).map((direction) => {
                const isGreen = currentGreenLane === direction;
                const displayTime = isGreen ? laneActiveTimeLeft : laneWaitingTimes[direction];
                const label = isGreen ? 'Active Time Left' : 'Waiting Time Left';
                const color = isGreen ? '#10B981' : '#F97316'; // Green for active, orange for wait
                const bgColor = isGreen ? 'rgba(16, 185, 129, 0.05)' : 'rgba(249, 115, 22, 0.05)';
                const borderColor = isGreen ? 'rgba(16, 185, 129, 0.15)' : 'rgba(249, 115, 22, 0.15)';

                return (
                  <Box
                    key={direction}
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      backgroundColor: bgColor,
                      border: `1px solid ${borderColor}`
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 0.5 }}>
                      {direction.toUpperCase()} {label}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color }}>
                        {displayTime}s
                      </Typography>
                      {isGreen && (
                        <Chip label="ACTIVE" size="small" sx={{ backgroundColor: '#10B981', color: '#fff', height: 20 }} />
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}

          {/* Disabled State Message */}
          {!aiControlEnabled && (
            <Box
              sx={{
                p: 2,
                textAlign: 'center',
                backgroundColor: 'rgba(107, 114, 128, 0.05)',
                borderRadius: 1
              }}
            >
              <Typography variant="body2" sx={{ color: '#6B7280' }}>
                {detectionEnabled 
                  ? '💡 Enable to activate dynamic green light timing based on real-time traffic detection'
                  : '⚠️ AI Detection must be enabled first'}
              </Typography>
            </Box>
          )}
        </Paper>
        
        {/* Top Row */}
        <Box sx={{ flex: 1, display: 'flex', gap: 2 }}>
          {/* East Camera */}
          <Paper 
            elevation={2}
            sx={{ 
              flex: 1, 
              position: 'relative',
              backgroundColor: '#000',
              borderRadius: 2,
              overflow: 'hidden',
              border: '2px solid #e0e0e0'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 10,
                left: 10,
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: '#fff',
                px: 2,
                py: 0.5,
                borderRadius: 1,
                zIndex: 10,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              East
              {getLanePriority('east') === 1 && (
                <Box
                  component="span"
                  sx={{
                    fontSize: '0.7rem',
                    backgroundColor: '#10B981',
                    px: 0.5,
                    borderRadius: 0.5,
                    fontWeight: 700
                  }}
                >
                  NEXT
                </Box>
              )}
            </Box>
            <Box
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                backgroundColor: 'rgba(31, 41, 55, 0.95)',
                color: '#fff',
                px: 2,
                py: 0.5,
                borderRadius: 2,
                zIndex: 10,
                fontWeight: 700,
                fontSize: '1.1rem',
                border: '2px solid rgba(59, 130, 246, 0.5)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(8px)'
              }}
            >
              🚗 {directionVehicleCounts.east}
            </Box>
            <StaticImageStream 
              imagePath="/images/east.jfif"
              enableDetection={detectionEnabled && aiServerHealthy === true}
              onDetection={(result) => onDirectionDetection('east', result)}
              usePretrainedModel={modelType === 'pretrained'}
            />
          </Paper>

          {/* West Camera */}
          <Paper 
            elevation={2}
            sx={{ 
              flex: 1, 
              position: 'relative',
              backgroundColor: '#000',
              borderRadius: 2,
              overflow: 'hidden',
              border: '2px solid #e0e0e0'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 10,
                left: 10,
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: '#fff',
                px: 2,
                py: 0.5,
                borderRadius: 1,
                zIndex: 10,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              West
              {getLanePriority('west') === 1 && (
                <Box
                  component="span"
                  sx={{
                    fontSize: '0.7rem',
                    backgroundColor: '#10B981',
                    px: 0.5,
                    borderRadius: 0.5,
                    fontWeight: 700
                  }}
                >
                  NEXT
                </Box>
              )}
            </Box>
            <Box
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                backgroundColor: 'rgba(31, 41, 55, 0.95)',
                color: '#fff',
                px: 2,
                py: 0.5,
                borderRadius: 2,
                zIndex: 10,
                fontWeight: 700,
                fontSize: '1.1rem',
                border: '2px solid rgba(59, 130, 246, 0.5)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(8px)'
              }}
            >
              🚗 {directionVehicleCounts.west}
            </Box>
            <StaticImageStream 
              imagePath="/images/west.jfif"
              enableDetection={detectionEnabled && aiServerHealthy === true}
              onDetection={(result) => onDirectionDetection('west', result)}
              usePretrainedModel={modelType === 'pretrained'}
            />
          </Paper>
        </Box>

        {/* Bottom Row */}
        <Box sx={{ flex: 1, display: 'flex', gap: 2 }}>
          {/* South Camera */}
          <Paper 
            elevation={2}
            sx={{ 
              flex: 1, 
              position: 'relative',
              backgroundColor: '#000',
              borderRadius: 2,
              overflow: 'hidden',
              border: '2px solid #e0e0e0'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 10,
                left: 10,
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: '#fff',
                px: 2,
                py: 0.5,
                borderRadius: 1,
                zIndex: 10,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              South
              {getLanePriority('south') === 1 && (
                <Box
                  component="span"
                  sx={{
                    fontSize: '0.7rem',
                    backgroundColor: '#10B981',
                    px: 0.5,
                    borderRadius: 0.5,
                    fontWeight: 700
                  }}
                >
                  NEXT
                </Box>
              )}
            </Box>
            <Box
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                backgroundColor: 'rgba(31, 41, 55, 0.95)',
                color: '#fff',
                px: 2,
                py: 0.5,
                borderRadius: 2,
                zIndex: 10,
                fontWeight: 700,
                fontSize: '1.1rem',
                border: '2px solid rgba(59, 130, 246, 0.5)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(8px)'
              }}
            >
              🚗 {directionVehicleCounts.south}
            </Box>
            <StaticImageStream 
              imagePath="/images/south.jfif"
              enableDetection={detectionEnabled && aiServerHealthy === true}
              onDetection={(result) => onDirectionDetection('south', result)}
              usePretrainedModel={modelType === 'pretrained'}
            />
          </Paper>

          {/* North Camera */}
          <Paper 
            elevation={2}
            sx={{ 
              flex: 1, 
              position: 'relative',
              backgroundColor: '#000',
              borderRadius: 2,
              overflow: 'hidden',
              border: '2px solid #e0e0e0'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 10,
                left: 10,
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: '#fff',
                px: 2,
                py: 0.5,
                borderRadius: 1,
                zIndex: 10,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              North
              {getLanePriority('north') === 1 && (
                <Box
                  component="span"
                  sx={{
                    fontSize: '0.7rem',
                    backgroundColor: '#10B981',
                    px: 0.5,
                    borderRadius: 0.5,
                    fontWeight: 700
                  }}
                >
                  NEXT
                </Box>
              )}
            </Box>
            <Box
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                backgroundColor: 'rgba(31, 41, 55, 0.95)',
                color: '#fff',
                px: 2,
                py: 0.5,
                borderRadius: 2,
                zIndex: 10,
                fontWeight: 700,
                fontSize: '1.1rem',
                border: '2px solid rgba(59, 130, 246, 0.5)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(8px)'
              }}
            >
              🚗 {directionVehicleCounts.north}
            </Box>
            <StaticImageStream 
              imagePath="/images/north.jfif"
              enableDetection={detectionEnabled && aiServerHealthy === true}
              onDetection={(result) => onDirectionDetection('north', result)}
              usePretrainedModel={modelType === 'pretrained'}
            />
          </Paper>
        </Box>
      </Box>

      {/* Right Side - Traffic Light Signals (Sticky) */}
      <Box sx={{ 
        width: 200,
        position: 'sticky',
        top: 0,
        alignSelf: 'flex-start',
        maxHeight: '100vh',
        overflowY: 'auto'
      }}>
        {/* Traffic Light Signals */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Calculate which lights to show */}
          {(() => {
            const directions = [
              { name: 'East', count: directionVehicleCounts.east, light: trafficLights[0] },
              { name: 'West', count: directionVehicleCounts.west, light: trafficLights[1] },
              { name: 'South', count: directionVehicleCounts.south, light: trafficLights[2] },
              { name: 'North', count: directionVehicleCounts.north, light: trafficLights[3] }
            ];

            return (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                {/* Top Row: East and West */}
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3, justifyContent: 'center' }}>
                  {[directions[0], directions[1]].map((dir) => (
                    <Box key={dir.name} sx={{ textAlign: 'center' }}>
                      {/* Direction Label */}
                      <Typography variant="body1" sx={{ fontWeight: 700, mb: 2, color: '#1F2937' }}>
                        {dir.name}
                      </Typography>

                      {/* Traffic Light Circles - Professional Design */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {/* Red Light */}
                        <Box
                          sx={{
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            backgroundColor: dir.light?.currentState === 'Red' ? '#DC2626' : '#1F2937',
                            border: dir.light?.currentState === 'Red' ? '3px solid #991B1B' : '2px solid #374151',
                            boxShadow: dir.light?.currentState === 'Red' 
                              ? '0 0 25px rgba(220, 38, 38, 0.9), inset 0 0 15px rgba(255, 255, 255, 0.2)' 
                              : 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            '&::after': dir.light?.currentState === 'Red' ? {
                              content: '""',
                              position: 'absolute',
                              top: '15%',
                              left: '25%',
                              width: '30%',
                              height: '30%',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(255, 255, 255, 0.4)',
                              filter: 'blur(4px)'
                            } : {}
                          }}
                        />

                        {/* Yellow Light */}
                        <Box
                          sx={{
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            backgroundColor: dir.light?.currentState === 'Yellow' ? '#F59E0B' : '#1F2937',
                            border: dir.light?.currentState === 'Yellow' ? '3px solid #D97706' : '2px solid #374151',
                            boxShadow: dir.light?.currentState === 'Yellow' 
                              ? '0 0 25px rgba(245, 158, 11, 0.9), inset 0 0 15px rgba(255, 255, 255, 0.2)' 
                              : 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            '&::after': dir.light?.currentState === 'Yellow' ? {
                              content: '""',
                              position: 'absolute',
                              top: '15%',
                              left: '25%',
                              width: '30%',
                              height: '30%',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(255, 255, 255, 0.4)',
                              filter: 'blur(4px)'
                            } : {}
                          }}
                        />

                        {/* Green Light */}
                        <Box
                          sx={{
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            backgroundColor: dir.light?.currentState === 'Green' ? '#10B981' : '#1F2937',
                            border: dir.light?.currentState === 'Green' ? '3px solid #059669' : '2px solid #374151',
                            boxShadow: dir.light?.currentState === 'Green' 
                              ? '0 0 25px rgba(16, 185, 129, 0.9), inset 0 0 15px rgba(255, 255, 255, 0.2)' 
                              : 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            '&::after': dir.light?.currentState === 'Green' ? {
                              content: '""',
                              position: 'absolute',
                              top: '15%',
                              left: '25%',
                              width: '30%',
                              height: '30%',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(255, 255, 255, 0.4)',
                              filter: 'blur(4px)'
                            } : {}
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>

                {/* Bottom Row: South and North */}
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3, justifyContent: 'center' }}>
                  {[directions[2], directions[3]].map((dir) => (
                    <Box key={dir.name} sx={{ textAlign: 'center' }}>
                      {/* Direction Label */}
                      <Typography variant="body1" sx={{ fontWeight: 700, mb: 2, color: '#1F2937' }}>
                        {dir.name}
                      </Typography>

                      {/* Traffic Light Circles - Professional Design */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {/* Red Light */}
                        <Box
                          sx={{
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            backgroundColor: dir.light?.currentState === 'Red' ? '#DC2626' : '#1F2937',
                            border: dir.light?.currentState === 'Red' ? '3px solid #991B1B' : '2px solid #374151',
                            boxShadow: dir.light?.currentState === 'Red' 
                              ? '0 0 25px rgba(220, 38, 38, 0.9), inset 0 0 15px rgba(255, 255, 255, 0.2)' 
                              : 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            '&::after': dir.light?.currentState === 'Red' ? {
                              content: '""',
                              position: 'absolute',
                              top: '15%',
                              left: '25%',
                              width: '30%',
                              height: '30%',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(255, 255, 255, 0.4)',
                              filter: 'blur(4px)'
                            } : {}
                          }}
                        />

                        {/* Yellow Light */}
                        <Box
                          sx={{
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            backgroundColor: dir.light?.currentState === 'Yellow' ? '#F59E0B' : '#1F2937',
                            border: dir.light?.currentState === 'Yellow' ? '3px solid #D97706' : '2px solid #374151',
                            boxShadow: dir.light?.currentState === 'Yellow' 
                              ? '0 0 25px rgba(245, 158, 11, 0.9), inset 0 0 15px rgba(255, 255, 255, 0.2)' 
                              : 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            '&::after': dir.light?.currentState === 'Yellow' ? {
                              content: '""',
                              position: 'absolute',
                              top: '15%',
                              left: '25%',
                              width: '30%',
                              height: '30%',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(255, 255, 255, 0.4)',
                              filter: 'blur(4px)'
                            } : {}
                          }}
                        />

                        {/* Green Light */}
                        <Box
                          sx={{
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            backgroundColor: dir.light?.currentState === 'Green' ? '#10B981' : '#1F2937',
                            border: dir.light?.currentState === 'Green' ? '3px solid #059669' : '2px solid #374151',
                            boxShadow: dir.light?.currentState === 'Green' 
                              ? '0 0 25px rgba(16, 185, 129, 0.9), inset 0 0 15px rgba(255, 255, 255, 0.2)' 
                              : 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            '&::after': dir.light?.currentState === 'Green' ? {
                              content: '""',
                              position: 'absolute',
                              top: '15%',
                              left: '25%',
                              width: '30%',
                              height: '30%',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(255, 255, 255, 0.4)',
                              filter: 'blur(4px)'
                            } : {}
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            );
          })()}
        </Box>
      </Box>
    </Box>
  );
};
