import React from 'react';
import { Box, Button, Chip, Divider, FormControlLabel, Paper, Stack, Switch, Typography } from '@mui/material';
import { Camera } from '../../types';

interface CameraSettingsTabProps {
  cameras: Camera[];
}

export const CameraSettingsTab: React.FC<CameraSettingsTabProps> = ({ cameras }) => {
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
                <Typography variant="body2" color="text.secondary">Orientation</Typography>
                <Typography variant="body1">{camera.orientation}°</Typography>
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '50%' }, p: 1 }}>
                <Typography variant="body2" color="text.secondary">Zoom Level</Typography>
                <Typography variant="body1">{camera.zoom}x</Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Camera Details
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1 }}>
              <Box sx={{ width: { xs: '100%', sm: '50%' }, p: 1 }}>
                <Typography variant="body2" color="text.secondary">Model</Typography>
                <Typography variant="body1">{camera.model}</Typography>
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '50%' }, p: 1 }}>
                <Typography variant="body2" color="text.secondary">IP Address</Typography>
                <Typography variant="body1">{camera.ip}</Typography>
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
