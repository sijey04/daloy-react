import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Stack
} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface CameraProps {
  id: number;
  name: string;
  location: string;
  status: string;
}

interface CCTVCardProps {
  camera: CameraProps;
}

const CCTVCard: React.FC<CCTVCardProps> = ({ camera }) => {
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

  const statusColor = getStatusColor(camera.status);

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid #eaeaea',
        transition: 'all 0.3s ease',
        height: '100%',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <Box
          sx={{
            height: 180,
            backgroundColor: '#222',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: 'repeating-linear-gradient(45deg, #333 0, #333 5px, #2a2a2a 5px, #2a2a2a 10px)',
            position: 'relative',
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
          <Box sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1
          }}>
            <VideocamIcon sx={{ fontSize: 28, color: '#aaa' }} />
          </Box>
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
        </Box>

        <Chip
          label={camera.name}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            color: 'white',
            borderRadius: '8px',
            fontWeight: 500,
            fontSize: '0.75rem',
            height: 24
          }}
        />

        <Chip
          label={camera.status}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: statusColor,
            color: 'white',
            borderRadius: '8px',
            fontWeight: 500,
            fontSize: '0.75rem',
            height: 24
          }}
          icon={camera.status === 'Online' ? <FiberManualRecordIcon sx={{ fontSize: '0.7rem !important', color: 'white !important' }} /> : undefined}
        />
      </Box>

      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {camera.name}
          </Typography>
          <IconButton size="small" sx={{ color: '#888' }}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {camera.location}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: statusColor,
              mr: 1
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Status: {camera.status} • Last Updated: Just now
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
          <Chip
            label="Normal Traffic"
            size="small"
            sx={{
              backgroundColor: 'rgba(103, 174, 110, 0.1)',
              color: '#67AE6E',
              borderRadius: '6px',
              height: 24,
              fontSize: '0.75rem'
            }}
          />
          <Chip
            label="HD Quality"
            size="small"
            sx={{
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              color: '#555',
              borderRadius: '6px',
              height: 24,
              fontSize: '0.75rem'
            }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default CCTVCard; 