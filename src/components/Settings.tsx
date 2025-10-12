import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Card,
  CardContent,
  Slider,
  Chip,
  Alert
} from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import SaveIcon from '@mui/icons-material/Save';
import TuneIcon from '@mui/icons-material/Tune';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import StorageIcon from '@mui/icons-material/Storage';
import NotificationsIcon from '@mui/icons-material/Notifications';

// Constants for sidebar dimensions
const drawerWidth = 260;
const collapsedWidth = 72;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
      style={{ height: '100%', overflowY: 'auto' }}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Settings: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [cameraSettings, setCameraSettings] = useState({
    resolution: '1080p',
    framerate: 30,
    detection: true,
    nightVision: true,
    reconnectAttempts: 3
  });
  
  const [algorithmSettings, setAlgorithmSettings] = useState({
    minVehicleSize: 20,
    detectionThreshold: 0.6,
    trackerSensitivity: 0.7,
    updateInterval: 5
  });
  
  const [systemSettings, setSystemSettings] = useState({
    dataRetention: 30,
    backupFrequency: 'daily',
    notificationsEnabled: true,
    systemName: 'Traffic Control System',
    autoUpdate: true
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCollapseChange = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
  };
  
  const handleSave = () => {
    // Simulate saving settings
    console.log('Saving settings...');
    console.log('Camera settings:', cameraSettings);
    console.log('Algorithm settings:', algorithmSettings);
    console.log('System settings:', systemSettings);
    
    // Show success message
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Header 
        drawerWidth={drawerWidth} 
        handleDrawerToggle={handleDrawerToggle}
        isMobile={false}
        isCollapsed={isCollapsed}
        collapsedWidth={collapsedWidth}
      />
      
      <Sidebar
        drawerWidth={drawerWidth}
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        onCollapseChange={handleCollapseChange}
      />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: '64px',
          height: '100vh',
          overflow: 'hidden',
          bgcolor: '#f5f7fa'
        }}
      >
        <Box 
          sx={{ 
            p: 3,
            height: 'calc(100vh - 64px)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" component="h1" fontWeight={600}>
              Settings
            </Typography>
            
            <Box>
              {savedSuccess && (
                <Alert 
                  severity="success" 
                  sx={{ 
                    position: 'absolute', 
                    top: '80px', 
                    right: '24px',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  Settings saved successfully!
                </Alert>
              )}
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<SaveIcon />}
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </Box>
          </Box>
          
          <Paper 
            sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              flexDirection: 'column',
              overflow: 'hidden',
              borderRadius: 2
            }}
          >
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                sx={{ px: 2 }}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab icon={<TuneIcon />} label="General" />
                <Tab icon={<CameraAltIcon />} label="Camera" />
                <Tab icon={<StorageIcon />} label="Data & Storage" />
                <Tab icon={<NotificationsIcon />} label="Notifications" />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                System Configuration
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card elevation={0} sx={{ mb: 3, border: '1px solid #eaeaea' }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Traffic Analysis Settings
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Box sx={{ mb: 3 }}>
                        <Typography gutterBottom>Detection Threshold</Typography>
                        <Slider
                          value={algorithmSettings.detectionThreshold}
                          onChange={(_e, value) => setAlgorithmSettings({...algorithmSettings, detectionThreshold: value as number})}
                          min={0.1}
                          max={1}
                          step={0.05}
                          valueLabelDisplay="auto"
                          valueLabelFormat={x => `${(x * 100).toFixed(0)}%`}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="text.secondary">Lower (more detections)</Typography>
                          <Typography variant="caption" color="text.secondary">Higher (fewer false positives)</Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ mb: 3 }}>
                        <Typography gutterBottom>Tracker Sensitivity</Typography>
                        <Slider
                          value={algorithmSettings.trackerSensitivity}
                          onChange={(_e, value) => setAlgorithmSettings({...algorithmSettings, trackerSensitivity: value as number})}
                          min={0.1}
                          max={1}
                          step={0.05}
                          valueLabelDisplay="auto"
                          valueLabelFormat={x => `${(x * 100).toFixed(0)}%`}
                        />
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography gutterBottom>Minimum Vehicle Size (px)</Typography>
                        <TextField
                          fullWidth
                          type="number"
                          value={algorithmSettings.minVehicleSize}
                          onChange={(e) => setAlgorithmSettings({...algorithmSettings, minVehicleSize: parseInt(e.target.value)})}
                          size="small"
                        />
                      </Box>
                      
                      <Box>
                        <Typography gutterBottom>Update Interval (seconds)</Typography>
                        <TextField
                          fullWidth
                          type="number"
                          value={algorithmSettings.updateInterval}
                          onChange={(e) => setAlgorithmSettings({...algorithmSettings, updateInterval: parseInt(e.target.value)})}
                          size="small"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                  
                  <Card elevation={0} sx={{ border: '1px solid #eaeaea' }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        System Information
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">System Name</Typography>
                        <TextField
                          fullWidth
                          value={systemSettings.systemName}
                          onChange={(e) => setSystemSettings({...systemSettings, systemName: e.target.value})}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">Version</Typography>
                        <Typography variant="body1">1.2.4</Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="text.secondary">License</Typography>
                        <Typography variant="body1">MIT License</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card elevation={0} sx={{ mb: 3, border: '1px solid #eaeaea' }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        AI Configuration
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="ai-model-label">AI Model</InputLabel>
                        <Select
                          labelId="ai-model-label"
                          value="yolov5"
                          label="AI Model"
                          size="small"
                        >
                          <MenuItem value="yolov5">YOLOv5</MenuItem>
                          <MenuItem value="yolov8">YOLOv8</MenuItem>
                          <MenuItem value="efficientdet">EfficientDet</MenuItem>
                          <MenuItem value="mobilenet">MobileNet SSD</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <FormControlLabel
                        control={<Switch checked={true} />}
                        label="Enable Vehicle Classification"
                        sx={{ mb: 1, display: 'block' }}
                      />
                      
                      <FormControlLabel
                        control={<Switch checked={true} />}
                        label="Track Vehicle Trajectories"
                        sx={{ mb: 1, display: 'block' }}
                      />
                      
                      <FormControlLabel
                        control={<Switch checked={true} />}
                        label="Enable Congestion Detection"
                        sx={{ mb: 1, display: 'block' }}
                      />
                      
                      <FormControlLabel
                        control={<Switch checked={false} />}
                        label="Enable Anomaly Detection"
                        sx={{ mb: 1, display: 'block' }}
                      />
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Supported Vehicle Types
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        <Chip label="Car" color="primary" />
                        <Chip label="Truck" color="primary" />
                        <Chip label="Bus" color="primary" />
                        <Chip label="Motorcycle" color="primary" />
                        <Chip label="Bicycle" color="primary" />
                        <Chip label="Pedestrian" color="primary" />
                      </Box>
                    </CardContent>
                  </Card>
                  
                  <Card elevation={0} sx={{ border: '1px solid #eaeaea' }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Traffic Light Control
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <FormControlLabel
                        control={<Switch checked={systemSettings.autoUpdate} onChange={(e) => setSystemSettings({...systemSettings, autoUpdate: e.target.checked})} />}
                        label="Enable Automatic Signal Timing"
                        sx={{ mb: 2, display: 'block' }}
                      />
                      
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="optimization-strategy-label">Optimization Strategy</InputLabel>
                        <Select
                          labelId="optimization-strategy-label"
                          value="balanced"
                          label="Optimization Strategy"
                          size="small"
                        >
                          <MenuItem value="throughput">Maximize Throughput</MenuItem>
                          <MenuItem value="balanced">Balanced (Default)</MenuItem>
                          <MenuItem value="waitTime">Minimize Wait Time</MenuItem>
                          <MenuItem value="predictive">Predictive (AI-Based)</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography gutterBottom>Minimum Green Time (seconds)</Typography>
                        <TextField
                          fullWidth
                          type="number"
                          defaultValue={15}
                          size="small"
                        />
                      </Box>
                      
                      <Box>
                        <Typography gutterBottom>Maximum Green Time (seconds)</Typography>
                        <TextField
                          fullWidth
                          type="number"
                          defaultValue={90}
                          size="small"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Camera Configuration
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card elevation={0} sx={{ mb: 3, border: '1px solid #eaeaea' }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Video Settings
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="resolution-label">Resolution</InputLabel>
                        <Select
                          labelId="resolution-label"
                          value={cameraSettings.resolution}
                          label="Resolution"
                          size="small"
                          onChange={(e) => setCameraSettings({...cameraSettings, resolution: e.target.value as string})}
                        >
                          <MenuItem value="720p">720p HD</MenuItem>
                          <MenuItem value="1080p">1080p Full HD</MenuItem>
                          <MenuItem value="1440p">1440p QHD</MenuItem>
                          <MenuItem value="4k">4K UHD</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="framerate-label">Frame Rate</InputLabel>
                        <Select
                          labelId="framerate-label"
                          value={cameraSettings.framerate}
                          label="Frame Rate"
                          size="small"
                          onChange={(e) => setCameraSettings({...cameraSettings, framerate: e.target.value as number})}
                        >
                          <MenuItem value={15}>15 FPS</MenuItem>
                          <MenuItem value={24}>24 FPS</MenuItem>
                          <MenuItem value={30}>30 FPS</MenuItem>
                          <MenuItem value={60}>60 FPS</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={cameraSettings.detection} 
                            onChange={(e) => setCameraSettings({...cameraSettings, detection: e.target.checked})}
                          />
                        }
                        label="Enable Live Detection Overlay"
                        sx={{ mb: 1, display: 'block' }}
                      />
                      
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={cameraSettings.nightVision} 
                            onChange={(e) => setCameraSettings({...cameraSettings, nightVision: e.target.checked})}
                          />
                        }
                        label="Enable Night Vision Mode"
                        sx={{ mb: 1, display: 'block' }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card elevation={0} sx={{ border: '1px solid #eaeaea' }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Camera Connectivity
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography gutterBottom>Reconnection Attempts</Typography>
                        <TextField
                          fullWidth
                          type="number"
                          value={cameraSettings.reconnectAttempts}
                          onChange={(e) => setCameraSettings({...cameraSettings, reconnectAttempts: parseInt(e.target.value)})}
                          size="small"
                        />
                      </Box>
                      
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="protocol-label">Connection Protocol</InputLabel>
                        <Select
                          labelId="protocol-label"
                          value="rtsp"
                          label="Connection Protocol"
                          size="small"
                        >
                          <MenuItem value="rtsp">RTSP</MenuItem>
                          <MenuItem value="http">HTTP</MenuItem>
                          <MenuItem value="onvif">ONVIF</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Auto-Discovery"
                        sx={{ mb: 1, display: 'block' }}
                      />
                      
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Secure Connection (SSL/TLS)"
                        sx={{ display: 'block' }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Data & Storage
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card elevation={0} sx={{ mb: 3, border: '1px solid #eaeaea' }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Data Retention
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography gutterBottom>Keep Data For (days)</Typography>
                        <TextField
                          fullWidth
                          type="number"
                          value={systemSettings.dataRetention}
                          onChange={(e) => setSystemSettings({...systemSettings, dataRetention: parseInt(e.target.value)})}
                          size="small"
                        />
                      </Box>
                      
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="backup-label">Backup Frequency</InputLabel>
                        <Select
                          labelId="backup-label"
                          value={systemSettings.backupFrequency}
                          label="Backup Frequency"
                          size="small"
                          onChange={(e) => setSystemSettings({...systemSettings, backupFrequency: e.target.value as string})}
                        >
                          <MenuItem value="hourly">Hourly</MenuItem>
                          <MenuItem value="daily">Daily</MenuItem>
                          <MenuItem value="weekly">Weekly</MenuItem>
                          <MenuItem value="monthly">Monthly</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="compression-label">Compression Level</InputLabel>
                        <Select
                          labelId="compression-label"
                          defaultValue="medium"
                          label="Compression Level"
                          size="small"
                        >
                          <MenuItem value="none">None</MenuItem>
                          <MenuItem value="low">Low</MenuItem>
                          <MenuItem value="medium">Medium</MenuItem>
                          <MenuItem value="high">High</MenuItem>
                        </Select>
                      </FormControl>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card elevation={0} sx={{ border: '1px solid #eaeaea' }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Storage Locations
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">Video Storage Path</Typography>
                        <TextField
                          fullWidth
                          defaultValue="/data/video"
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">Analytics Storage Path</Typography>
                        <TextField
                          fullWidth
                          defaultValue="/data/analytics"
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">Backup Path</Typography>
                        <TextField
                          fullWidth
                          defaultValue="/backup"
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      
                      <Button 
                        variant="outlined" 
                        color="primary"
                        sx={{ mt: 1 }}
                      >
                        Test Storage Paths
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
            
            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Notification Settings
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card elevation={0} sx={{ border: '1px solid #eaeaea' }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Alert Configuration
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={systemSettings.notificationsEnabled} 
                            onChange={(e) => setSystemSettings({...systemSettings, notificationsEnabled: e.target.checked})}
                          />
                        }
                        label="Enable Notifications"
                        sx={{ mb: 2, display: 'block' }}
                      />
                      
                      <Typography variant="subtitle2" gutterBottom>
                        Notification Types
                      </Typography>
                      
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="System Errors"
                        sx={{ mb: 1, display: 'block' }}
                      />
                      
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Camera Disconnection"
                        sx={{ mb: 1, display: 'block' }}
                      />
                      
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="High Traffic Congestion"
                        sx={{ mb: 1, display: 'block' }}
                      />
                      
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Traffic Light Malfunctions"
                        sx={{ mb: 1, display: 'block' }}
                      />
                      
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Traffic Pattern Anomalies"
                        sx={{ display: 'block' }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card elevation={0} sx={{ border: '1px solid #eaeaea' }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Notification Delivery
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">Email Recipients</Typography>
                        <TextField
                          fullWidth
                          defaultValue="admin@trafficmonitor.com, alerts@trafficmonitor.com"
                          size="small"
                          sx={{ mt: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Separate multiple emails with commas
                        </Typography>
                      </Box>
                      
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="priority-label">Alert Priority</InputLabel>
                        <Select
                          labelId="priority-label"
                          defaultValue="high"
                          label="Alert Priority"
                          size="small"
                        >
                          <MenuItem value="low">Low (Daily Digest)</MenuItem>
                          <MenuItem value="medium">Medium (Hourly Summary)</MenuItem>
                          <MenuItem value="high">High (Immediate)</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <Button 
                        variant="outlined" 
                        color="primary"
                        sx={{ mt: 1 }}
                      >
                        Send Test Notification
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Settings; 