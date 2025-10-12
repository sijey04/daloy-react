import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

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
}

export const DynamicCameraStream: React.FC<DynamicCameraStreamProps> = ({ camera, opacity = 1 }) => {
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
