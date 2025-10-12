# USB Camera Setup Guide

## Overview
The Camera Detail page now displays **live video feeds** from your USB cameras connected via an external powered USB hub.

## How It Works

### Camera Selection
- **Camera #1** (id: 1) - Uses the first detected USB camera
- **Camera #2** (id: 2) - Uses the second detected USB camera

The system automatically detects available cameras and maps them to the camera IDs in your system.

## Browser Permissions

### First Time Setup
When you first access the camera detail page, your browser will ask for camera permissions:

1. Click "Allow" when prompted to access your cameras
2. If you accidentally clicked "Block", you'll need to:
   - Click the lock/info icon in the address bar
   - Change camera permissions to "Allow"
   - Refresh the page

### Supported Browsers
- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari (macOS only)
- ❌ Internet Explorer (Not supported)

## Camera Settings

The system requests the following settings from your cameras:
- **Resolution**: 1920x1080 (Full HD) - ideal setting
- **Frame Rate**: 30 FPS
- **Object Fit**: Cover (fills the video container)

Your camera will use the closest available settings if it doesn't support these exact specifications.

## Features

### Live Video Feed
- Real-time video streaming from USB cameras
- Automatic camera selection based on camera ID
- Loading indicator while connecting
- Error messages if camera connection fails

### PTZ Controls (Simulated)
The current controls are simulated and affect the display:
- **Zoom**: Digital zoom (scales the video)
- **Pan/Tilt**: Visual indicators only (for future hardware integration)
- **PTZ Control Pad**: Arrow buttons for navigation

### Camera Information Overlay
- Live indicator (red dot)
- Camera name
- Current Pan, Tilt, and Zoom values
- Control buttons (Zoom in/out, Pan tool, Refresh)

## Troubleshooting

### "No cameras found" Error
**Causes:**
- USB cameras not connected
- USB hub not powered on
- Cameras not recognized by OS

**Solutions:**
1. Check USB connections
2. Ensure USB hub has power
3. Verify cameras work in other applications (e.g., Camera app on Windows)
4. Try unplugging and reconnecting cameras
5. Restart your browser

### "Permission denied" Error
**Solutions:**
1. Click the lock icon in address bar
2. Reset camera permissions
3. Refresh the page
4. Click "Allow" when prompted

### Video Not Showing
**Solutions:**
1. Check browser console for errors (F12)
2. Verify camera permissions are granted
3. Try accessing camera in another browser
4. Restart your computer if cameras are not detected

### Wrong Camera Showing
The system maps cameras by detection order:
- First detected camera → Camera #1
- Second detected camera → Camera #2

If cameras are swapped:
1. Unplug both cameras
2. Plug them in the desired order
3. Refresh the browser

### Low Frame Rate or Quality
**Solutions:**
1. Ensure USB hub has adequate power
2. Use USB 3.0 hub if available (faster data transfer)
3. Reduce number of applications using cameras
4. Close unnecessary browser tabs
5. Check camera specifications

## Testing Your Setup

### Quick Test
1. Navigate to: `http://localhost:5173`
2. Click on any intersection card
3. You should see two camera feeds loading
4. Allow camera permissions when prompted
5. Both live feeds should appear within a few seconds

### Camera Device Info
To see which cameras are detected, open browser console (F12) and run:
```javascript
navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    devices.filter(d => d.kind === 'videoinput')
      .forEach(camera => console.log(camera.label, camera.deviceId));
  });
```

## Hardware Recommendations

### USB Cameras
- **Resolution**: 1080p or higher
- **Frame Rate**: 30 FPS minimum
- **Connection**: USB 2.0 or higher
- **Format**: UVC (USB Video Class) compatible

### USB Hub
- **Power**: External power supply (5V, 2A minimum)
- **Ports**: USB 3.0 for better performance
- **Capacity**: At least 2 available ports

### Popular Compatible Cameras
- Logitech C920/C922
- Microsoft LifeCam
- Razer Kiyo
- Any UVC-compatible webcam

## Future Enhancements

Potential features for hardware integration:
- [ ] Real PTZ camera control via API
- [ ] Camera recording/snapshot
- [ ] Motion detection alerts
- [ ] Multiple camera view layouts
- [ ] Camera settings (brightness, contrast, etc.)
- [ ] Hardware zoom control
- [ ] Camera presets

## Development Notes

### Code Location
The camera implementation is in:
- File: `src/components/CameraDetail.tsx`
- Component: `CameraFeed`

### Key Technologies
- **MediaDevices API**: Access camera hardware
- **getUserMedia**: Request camera stream
- **Video Element**: Display live feed
- **React Hooks**: Manage camera lifecycle

### Camera Lifecycle
1. Component mounts
2. Request available video devices
3. Select camera by ID
4. Request media stream
5. Attach stream to video element
6. Component unmounts → Stop all tracks (cleanup)

## Security & Privacy

### Important Notes
- ⚠️ Camera access requires HTTPS in production
- ⚠️ Users must explicitly grant camera permissions
- ⚠️ Camera feeds are not recorded or stored
- ⚠️ All processing happens locally in the browser
- ✅ Camera stops when you close the tab/page
- ✅ No data is sent to external servers

### Production Deployment
For production use:
1. Use HTTPS (required for camera access)
2. Add proper privacy policy
3. Inform users about camera usage
4. Implement proper error handling
5. Consider adding camera indicator LED awareness

## Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Verify camera hardware is working
3. Check browser compatibility
4. Review browser console for errors
5. Test with different browsers

---

**Note**: This implementation uses the browser's native camera access. For production use with actual traffic cameras, you'll need to integrate with your camera's API or streaming server.
