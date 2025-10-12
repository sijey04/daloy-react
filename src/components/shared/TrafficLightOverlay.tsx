import React from 'react';
import { Box, Drawer, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TrafficIcon from '@mui/icons-material/Traffic';
import { TrafficLight } from '../../types';

interface TrafficLightOverlayProps {
  open: boolean;
  onClose: () => void;
  trafficLights: TrafficLight[];
  children?: React.ReactNode;
}

export const TrafficLightOverlay: React.FC<TrafficLightOverlayProps> = ({
  open,
  onClose,
  trafficLights,
  children
}) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 480 },
          boxSizing: 'border-box',
          backgroundColor: '#f5f7fa',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            backgroundColor: 'white',
            borderBottom: '1px solid #eaeaea',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrafficIcon sx={{ color: '#67AE6E', fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                Traffic Light Controls
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {trafficLights.length} signals active
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '4px',
            },
          }}
        >
          {children}
        </Box>
      </Box>
    </Drawer>
  );
};
