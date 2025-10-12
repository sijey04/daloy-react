# Arduino Traffic Light Integration Guide

This guide will help you connect your React application to the Arduino traffic light system.

## Architecture Overview

```
React App (Port 5173) 
    ↕ HTTP/WebSocket
Arduino Bridge Server (Port 3001/3002)
    ↕ Serial (USB)
Arduino Uno (Traffic Lights)
```

## Prerequisites

✅ You already have:
- Arduino code (`arduino/traffic_light_control/traffic_light_control.ino`)
- Bridge server (`arduino-bridge/server.js`)
- React application

## Step-by-Step Setup

### 1. Install Bridge Server Dependencies

```powershell
cd arduino-bridge
npm install
```

If `package.json` is missing dependencies, install them:

```powershell
npm install express cors serialport @serialport/parser-readline ws
```

### 2. Upload Arduino Code

1. Open Arduino IDE
2. Open `arduino/traffic_light_control/traffic_light_control.ino`
3. Connect Arduino Uno via USB
4. Select correct board: **Tools → Board → Arduino Uno**
5. Select correct port: **Tools → Port → COM3** (or your Arduino's port)
6. Click **Upload** button (→)
7. Wait for "Done uploading" message

**Important**: Close Arduino IDE's Serial Monitor before running the bridge server (only one program can use the serial port at a time).

### 3. Wire Your LEDs

Connect 12 LEDs (4 roads × 3 colors) to Arduino:

**North-South Road:**
- Pin 2 → Red LED → 220Ω resistor → GND
- Pin 3 → Yellow LED → 220Ω resistor → GND
- Pin 4 → Green LED → 220Ω resistor → GND

**East-West Road:**
- Pin 5 → Red LED → 220Ω resistor → GND
- Pin 6 → Yellow LED → 220Ω resistor → GND
- Pin 7 → Green LED → 220Ω resistor → GND

**Road 3:**
- Pin 8 → Red LED → 220Ω resistor → GND
- Pin 9 → Yellow LED → 220Ω resistor → GND
- Pin 10 → Green LED → 220Ω resistor → GND

**Road 4:**
- Pin 11 → Red LED → 220Ω resistor → GND
- Pin 12 → Yellow LED → 220Ω resistor → GND
- Pin 13 → Green LED → 220Ω resistor → GND

### 4. Start the Bridge Server

Open a new terminal in VS Code (keep your React dev server running):

```powershell
cd arduino-bridge
node server.js
```

You should see:
```
🚀 Arduino Bridge Server running on http://localhost:3001
📡 WebSocket server running on ws://localhost:3002
Attempting to connect to Arduino...
✅ Arduino connected successfully!
✅ Ready to receive commands!
```

### 5. Start Your React App

In another terminal:

```powershell
npm run dev
```

Your app should start on `http://localhost:5173`

### 6. Test the Connection

#### Method 1: Using the React UI
1. Navigate to an intersection (e.g., `http://localhost:5173/camera/1`)
2. Go to the **Traffic Lights** tab
3. Change the mode or timings
4. Click **Apply All Changes**
5. Watch your physical LEDs change!

#### Method 2: Using API directly
Open PowerShell and test endpoints:

```powershell
# Get status
Invoke-RestMethod -Uri http://localhost:3001/api/status -Method Get

# Set AUTO mode
Invoke-RestMethod -Uri http://localhost:3001/api/mode/AUTO -Method Post

# Set specific light (North-South to Green)
Invoke-RestMethod -Uri http://localhost:3001/api/light/north-south/green -Method Post

# Emergency stop (all red)
Invoke-RestMethod -Uri http://localhost:3001/api/emergency-stop -Method Post
```

## API Endpoints Reference

### GET `/api/status`
Get connection status and current light states

**Response:**
```json
{
  "connected": true,
  "status": {
    "northSouth": "GREEN",
    "eastWest": "RED",
    "road3": "RED",
    "road4": "RED",
    "mode": "AUTO"
  }
}
```

### POST `/api/mode/:mode`
Set traffic light mode

**Parameters:**
- `mode`: AUTO, STOP, or TEST

**Example:**
```powershell
curl -X POST http://localhost:3001/api/mode/AUTO
```

### POST `/api/light/:road/:color`
Set specific traffic light

**Parameters:**
- `road`: north-south, east-west, road3, or road4
- `color`: red, yellow, or green

**Example:**
```powershell
curl -X POST http://localhost:3001/api/light/north-south/green
```

### POST `/api/command`
Send raw Arduino command

**Body:**
```json
{
  "command": "NS_GREEN"
}
```

### POST `/api/emergency-stop`
Set all lights to red immediately

## Arduino Serial Commands

You can also control Arduino directly via Serial Monitor (9600 baud):

- `AUTO` - Start automatic cycling
- `STOP` - Stop and set all red
- `TEST` - Test all LEDs
- `NS_GREEN` - North-South green
- `NS_YELLOW` - North-South yellow
- `NS_RED` - North-South red
- `EW_GREEN` - East-West green
- `EW_YELLOW` - East-West yellow
- `EW_RED` - East-West red
- `R3_GREEN` - Road 3 green
- `R3_YELLOW` - Road 3 yellow
- `R3_RED` - Road 3 red
- `R4_GREEN` - Road 4 green
- `R4_YELLOW` - Road 4 yellow
- `R4_RED` - Road 4 red
- `ALL_RED` - All lights red
- `STATUS` - Get current status
- `HELP` - Show command list

## Troubleshooting

### Arduino Not Connecting

**Problem**: "No Arduino found" or "Serial port error"

**Solutions:**
1. Check USB cable is connected
2. Verify Arduino shows up in Device Manager (Windows)
3. Close Arduino IDE Serial Monitor
4. Try different USB port
5. Restart bridge server
6. Check COM port in Device Manager and update `server.js` if needed

### LEDs Not Working

**Problem**: Commands send but LEDs don't respond

**Solutions:**
1. Check wiring (refer to wiring diagram above)
2. Verify resistors are correct (220Ω)
3. Test LEDs with Arduino blink example
4. Check Arduino code is uploaded correctly
5. Send `TEST` command to verify all LEDs work

### Port Permission Denied (COM3)

**Problem**: "Access is denied" when uploading or connecting

**Solutions:**
1. Close Arduino Serial Monitor
2. Close any other programs using the port
3. Restart Arduino IDE
4. Unplug and replug Arduino USB cable

### Bridge Server Won't Start

**Problem**: Module not found or other errors

**Solutions:**
```powershell
cd arduino-bridge
rm -r node_modules
rm package-lock.json
npm install
node server.js
```

## For AI Control (Future Implementation)

When you're ready to add AI control:

1. **Create AI Service** (`arduino-bridge/ai-service.js`):
   ```javascript
   // Analyze traffic data and send optimized commands
   async function optimizeTrafficFlow(trafficData) {
     // Your AI/ML logic here
     // Can use TensorFlow.js, decision trees, etc.
     const commands = analyzeAndDecide(trafficData);
     return commands;
   }
   ```

2. **Connect to Bridge Server**:
   - AI service calls same API endpoints
   - Can run on interval (every 30 seconds)
   - Adjusts timings based on traffic patterns

3. **Training Data**:
   - Log traffic patterns from camera detection
   - Store wait times, vehicle counts
   - Use for training your AI model

## Real-Time Updates via WebSocket

The bridge server broadcasts real-time status updates via WebSocket on port 3002.

**Connect from React:**
```javascript
const ws = new WebSocket('ws://localhost:3002');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'status') {
    console.log('Traffic light status:', data.data);
    // Update UI
  }
};
```

## Next Steps

1. ✅ **Test Manual Control**: Use the React UI to control lights
2. ✅ **Test AUTO Mode**: Watch lights cycle automatically
3. 📊 **Add Real-Time Display**: Show current light states in UI
4. 🎥 **Integrate with Cameras**: Combine camera feeds with light control
5. 🤖 **Add AI Logic**: Train model to optimize traffic flow
6. 📈 **Add Analytics**: Track efficiency metrics

## Support

If you encounter issues:
1. Check all terminals are running (React, Bridge Server)
2. Verify Arduino is connected and code is uploaded
3. Test with curl commands first
4. Check browser console for errors
5. Review bridge server logs

Happy coding! 🚦🚗💡
