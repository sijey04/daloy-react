import React, { useState, useEffect, useRef } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { aiService, DetectionResponse } from '../../services/aiService';

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

interface DynamicCameraStreamProps {
  camera: Camera;
  opacity?: number;
  enableDetection?: boolean;
  onDetection?: (result: DetectionResponse) => void;
}

export const DynamicCameraStream: React.FC<DynamicCameraStreamProps> = ({ 
  camera, 
  opacity = 1,
  enableDetection = false,
  onDetection
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize camera
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

  // Handle AI detection
  useEffect(() => {
    if (!enableDetection || !videoRef.current || !canvasRef.current || isLoading || error) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const detectionCanvas = detectionCanvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas size to match video
    const updateCanvasSize = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      if (detectionCanvas) {
        detectionCanvas.width = video.videoWidth;
        detectionCanvas.height = video.videoHeight;
      }
    };

    video.addEventListener('loadedmetadata', updateCanvasSize);
    updateCanvasSize();

    // Start detection
    const intervalId = aiService.startRealtimeDetection(
      canvas,
      (result) => {
        // Draw current frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Draw detections on overlay canvas
        if (detectionCanvas) {
          aiService.drawDetections(detectionCanvas, result.detections);
        }
        
        // Callback to parent
        if (onDetection) {
          onDetection(result);
        }
      },
      (error) => {
        console.error('Detection error:', error);
      },
      1000 // Detect every 1 second
    );

    detectionIntervalRef.current = intervalId;

    return () => {
      if (detectionIntervalRef.current !== null) {
        aiService.stopRealtimeDetection(detectionIntervalRef.current);
      }
      video.removeEventListener('loadedmetadata', updateCanvasSize);
    };
  }, [enableDetection, isLoading, error, onDetection]);

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

      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
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
            display: isLoading || error ? 'none' : 'block',
            transform: 'rotate(180deg)' // Rotate camera 180 degrees (upside down)
          }}
        />
        
        {/* Hidden canvas for detection processing */}
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />
        
        {/* Overlay canvas for detection visualization */}
        {enableDetection && (
          <canvas
            ref={detectionCanvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              pointerEvents: 'none',
              transform: 'rotate(180deg)' // Match video rotation
            }}
          />
        )}
      </Box>
    </>
  );
};
