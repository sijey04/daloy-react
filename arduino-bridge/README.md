# Arduino Bridge Server

This Node.js server acts as a bridge between your React application and the Arduino traffic light system.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd arduino-bridge
npm install
```

### 2. Connect Arduino
- Plug Arduino into USB port
- Make sure `traffic_light_control.ino` is uploaded to Arduino

### 3. Start Server
```bash
npm start
```

Or with auto-reload during development:
```bash
npm run dev
```

### 4. Verify Connection
The server will automatically try to connect to Arduino on startup. You should see:
```
✅ Arduino connected successfully!
✅ Ready to receive commands!
```

## 📡 API Endpoints

### Get Status
```bash
GET http://localhost:3001/api/status
```
Returns current connection status and traffic light states.

**Response:**
```json
{
  "connected": true,
  "status": {
    "northSouth": "RED",
    "eastWest": "RED",
    "road3": "RED",
    "road4": "RED",
    "mode": "STOPPED"
  }
}
```

### Send Raw Command
```bash
POST http://localhost:3001/api/command
Content-Type: application/json

{
  "command": "AUTO"
}
```

### Set Mode
```bash
POST http://localhost:3001/api/mode/AUTO
POST http://localhost:3001/api/mode/STOP
POST http://localhost:3001/api/mode/TEST
```

### Control Specific Light
```bash
POST http://localhost:3001/api/light/north-south/green
POST http://localhost:3001/api/light/east-west/red
POST http://localhost:3001/api/light/road3/yellow
POST http://localhost:3001/api/light/road4/green
```

**Roads:** `north-south`, `east-west`, `road3`, `road4`  
**Colors:** `red`, `yellow`, `green`

### Emergency Stop
```bash
POST http://localhost:3001/api/emergency-stop
```
Sets all lights to RED immediately.

## 🔌 WebSocket Connection

Real-time updates are available via WebSocket on port 3002:

```javascript
const ws = new WebSocket('ws://localhost:3002');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Status update:', data);
};
```

## 🧪 Testing with cURL

### Check Status
```bash
curl http://localhost:3001/api/status
```

### Start Auto Mode
```bash
curl -X POST http://localhost:3001/api/mode/AUTO
```

### Set North-South to Green
```bash
curl -X POST http://localhost:3001/api/light/north-south/green
```

### Stop All (Emergency)
```bash
curl -X POST http://localhost:3001/api/emergency-stop
```

## 🧪 Testing with Browser

Open your browser console (F12) and run:

```javascript
// Test status
fetch('http://localhost:3001/api/status')
  .then(r => r.json())
  .then(console.log);

// Start auto mode
fetch('http://localhost:3001/api/mode/AUTO', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);

// Set light
fetch('http://localhost:3001/api/light/north-south/green', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);
```

## 🔧 Troubleshooting

### Server won't start
- Check if Node.js is installed: `node --version`
- Make sure you ran `npm install`
- Check if port 3001 or 3002 is already in use

### Arduino not connecting
- Check USB connection
- Verify Arduino has `traffic_light_control.ino` uploaded
- Check if Arduino is visible in Device Manager (Windows)
- Try unplugging and reconnecting Arduino
- Check the COM port in Device Manager

### Finding Arduino Port
Run this to list available ports:
```bash
curl http://localhost:3001/api/ports
```

Or in the server logs, it shows:
```
Available ports: [...]
Connecting to: COM3
```

### Permission Errors (Linux/Mac)
You may need to add your user to the dialout group:
```bash
sudo usermod -a -G dialout $USER
```
Then log out and back in.

## 📝 Integration with React

### Install Axios (if not already)
```bash
cd ../
npm install axios
```

### Example React Hook
```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

export function useTrafficLight() {
  const [status, setStatus] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Check status on mount
    checkStatus();
    
    // WebSocket for real-time updates
    const ws = new WebSocket('ws://localhost:3002');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'status') {
        setStatus(data.data);
      }
    };
    
    return () => ws.close();
  }, []);

  const checkStatus = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/status`);
      setConnected(data.connected);
      setStatus(data.status);
    } catch (error) {
      console.error('Failed to check status:', error);
    }
  };

  const setMode = async (mode) => {
    try {
      await axios.post(`${API_BASE}/mode/${mode}`);
    } catch (error) {
      console.error('Failed to set mode:', error);
    }
  };

  const setLight = async (road, color) => {
    try {
      await axios.post(`${API_BASE}/light/${road}/${color}`);
    } catch (error) {
      console.error('Failed to set light:', error);
    }
  };

  const emergencyStop = async () => {
    try {
      await axios.post(`${API_BASE}/emergency-stop`);
    } catch (error) {
      console.error('Failed to emergency stop:', error);
    }
  };

  return {
    status,
    connected,
    setMode,
    setLight,
    emergencyStop,
    checkStatus
  };
}
```

### Example Usage in Component
```javascript
function TrafficControl() {
  const { status, connected, setMode, setLight } = useTrafficLight();

  return (
    <div>
      <h2>Traffic Light Control</h2>
      <p>Status: {connected ? 'Connected' : 'Disconnected'}</p>
      
      <button onClick={() => setMode('AUTO')}>
        Auto Mode
      </button>
      
      <button onClick={() => setMode('STOP')}>
        Stop
      </button>
      
      <button onClick={() => setLight('north-south', 'green')}>
        NS Green
      </button>
    </div>
  );
}
```

## 🎯 Next Steps

1. ✅ Start the bridge server
2. ✅ Test API endpoints with cURL or browser
3. ✅ Integrate with React app
4. ✅ Add UI controls in CameraDetail page
5. ✅ Sync with camera feeds

## 📊 Server Architecture

```
React App (Port 5173)
    ↓ HTTP/WebSocket
Bridge Server (Port 3001/3002)
    ↓ Serial (USB)
Arduino Uno
    ↓ GPIO
Traffic Light LEDs
```

## 🔐 Security Notes

For production:
- Add authentication to API endpoints
- Use environment variables for configuration
- Add rate limiting
- Validate all inputs
- Use HTTPS/WSS

## 📦 Dependencies

- `express` - Web server framework
- `cors` - Cross-origin resource sharing
- `serialport` - Serial communication with Arduino
- `ws` - WebSocket server for real-time updates

## 🐛 Debug Mode

To see all serial communication, modify `server.js`:

```javascript
parser.on('data', (data) => {
  console.log('Arduino:', data);  // This line shows all messages
  parseArduinoMessage(data);
});
```

## 📞 Support

If you encounter issues:
1. Check Arduino is connected and code is uploaded
2. Check server logs for errors
3. Test Arduino directly with Arduino IDE Serial Monitor
4. Verify COM port is not in use by another application
5. Try restarting both server and Arduino
