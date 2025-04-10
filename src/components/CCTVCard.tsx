import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Stack,
  CardActionArea
} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TrafficIcon from '@mui/icons-material/Traffic';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

interface IntersectionProps {
  id: number;
  name: string;
  location: string;
  status: string;
  trafficLevel: string;
  vehicleCount: number;
  lastUpdated: string;
  imageUrl?: string;
}

interface CCTVCardProps {
  intersection: IntersectionProps;
}

const CCTVCard: React.FC<CCTVCardProps> = ({ intersection }) => {
  const navigate = useNavigate();
  
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

  const statusColor = getStatusColor(intersection.status);
  const trafficColor = getTrafficLevelColor(intersection.trafficLevel);
  
  const handleCardClick = () => {
    navigate(`/camera/${intersection.id}`);
  };
  
  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid #eaeaea',
        transition: 'all 0.3s ease',
        height: '100%',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      <Box sx={{ position: 'absolute', top: 0, right: 0, zIndex: 1 }}>
        <IconButton 
          size="small" 
          sx={{ color: '#888', m: 1 }}
          onClick={handleMoreClick}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Box>

      <CardActionArea onClick={handleCardClick} sx={{ height: '100%' }}>
        <Box sx={{ position: 'relative' }}>
          {intersection.imageUrl ? (
            <Box
              sx={{
                height: 180,
                width: '100%',
                backgroundColor: '#222',
                position: 'relative',
                backgroundImage: `url(${intersection.imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.1)'
                }
              }}
            />
          ) : (
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
                <TrafficIcon sx={{ fontSize: 28, color: '#aaa' }} />
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
          )}

          <Chip
            label={intersection.name}
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
            label={`${intersection.trafficLevel} Traffic`}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              backgroundColor: trafficColor,
              color: 'white',
              borderRadius: '8px',
              fontWeight: 500,
              fontSize: '0.75rem',
              height: 24
            }}
          />
        </Box>

        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {intersection.name}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {intersection.location}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <DirectionsCarIcon sx={{ color: '#777', fontSize: 16, mr: 0.5 }} />
            <Typography variant="caption" color="text.secondary">
              {intersection.vehicleCount} vehicles • Last Updated: {intersection.lastUpdated}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
            <Chip
              label={`${intersection.trafficLevel} Traffic`}
              size="small"
              sx={{
                backgroundColor: `rgba(${trafficColor === '#67AE6E' ? '103, 174, 110' : trafficColor === '#ff9800' ? '255, 152, 0' : '244, 67, 54'}, 0.1)`,
                color: trafficColor,
                borderRadius: '6px',
                height: 24,
                fontSize: '0.75rem'
              }}
            />
            <Chip
              label={intersection.status}
              size="small"
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                color: statusColor,
                borderRadius: '6px',
                height: 24,
                fontSize: '0.75rem'
              }}
              icon={intersection.status === 'Online' ? <FiberManualRecordIcon sx={{ fontSize: '0.7rem !important', color: `${statusColor} !important` }} /> : undefined}
            />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default CCTVCard; 