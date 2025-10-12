import React from 'react';
import { Box, Card, Chip, Paper, Typography } from '@mui/material';
import TrafficIcon from '@mui/icons-material/Traffic';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';

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

interface TrafficAnalysisPanelProps {
  analysis: TrafficAnalysis;
}

export const TrafficAnalysisPanel: React.FC<TrafficAnalysisPanelProps> = ({ analysis }) => {
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
