import React from 'react';
import { Box, IconButton, Slider, Typography } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';

interface PTZControlsProps {
  pan: number;
  tilt: number;
  zoom: number;
  rotationSpeed: number;
  onPanChange: (event: Event, value: number | number[]) => void;
  onTiltChange: (event: Event, value: number | number[]) => void;
  onZoomChange: (event: Event, value: number | number[]) => void;
  onRotationSpeedChange: (event: Event, value: number | number[]) => void;
  onPTZControl: (direction: string) => void;
}

export const PTZControls: React.FC<PTZControlsProps> = ({
  pan,
  tilt,
  zoom,
  rotationSpeed,
  onPanChange,
  onTiltChange,
  onZoomChange,
  onRotationSpeedChange,
  onPTZControl
}) => {
  return (
    <>
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
              onClick={() => onPTZControl('up')}
            >
              ↑
            </IconButton>
            <Box></Box>
            
            <IconButton 
              size="small" 
              sx={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
              onClick={() => onPTZControl('left')}
            >
              ←
            </IconButton>
            
            <IconButton 
              size="small" 
              sx={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
              onClick={() => onPTZControl('home')}
            >
              ⌂
            </IconButton>
            
            <IconButton 
              size="small" 
              sx={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
              onClick={() => onPTZControl('right')}
            >
              →
            </IconButton>
            
            <Box></Box>
            <IconButton 
              size="small" 
              sx={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
              onClick={() => onPTZControl('down')}
            >
              ↓
            </IconButton>
            <Box></Box>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 1 }}>
          <IconButton 
            size="small" 
            sx={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
            onClick={() => onPTZControl('zoomOut')}
          >
            <ZoomOutIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            sx={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
            onClick={() => onPTZControl('zoomIn')}
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
          onChange={onPanChange}
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
          onChange={onTiltChange}
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
          onChange={onZoomChange}
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
          onChange={onRotationSpeedChange}
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
    </>
  );
};
