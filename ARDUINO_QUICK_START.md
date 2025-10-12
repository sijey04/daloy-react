# 🚦 Arduino Traffic Light Integration - Quick Start

## What's Been Set Up

Your React application is now fully integrated with Arduino traffic light control! Here's what's ready:

### ✅ Components Created:

1. **Arduino Service** (`src/services/arduinoService.ts`)
   - TypeScript service for communicating with Arduino
   - WebSocket support for real-time updates
   - Methods for controlling lights, modes, and getting status

2. **Bridge Server** (`arduino-bridge/server.js`)
   - Node.js server that bridges React ↔ Arduino
   - REST API on port 3001
   - WebSocket server on port 3002
   - Auto-connects to Arduino on startup

3. **Arduino Code** (`arduino/traffic_light_control/traffic_light_control.ino`)
   - Controls 12 LEDs (4 roads × 3 colors)
   - Serial command interface
   - Safety features (only one road green at a time)
   - Modes: AUTO, MANUAL, TEST, STOP

4. **React Integration**
   - Traffic Light Settings Tab now sends commands to Arduino
   - Mode selector controls Arduino modes
   - "Apply All Changes" button configures Arduino
   - Built-in status checker and LED tester

## 🚀 Quick Start (3 Steps!)

### Step 1: Upload Arduino Code

```
1. Open Arduino IDE
2. Open: arduino/traffic_light_control/traffic_light_control.ino
3. Select: Tools → Board → Arduino Uno
4. Select: Tools → Port → COM3 (or your Arduino's port)
5. Click Upload (→)
6. Wait for "Done uploading"
7. CLOSE Arduino Serial Monitor!
```

### Step 2: Start the System

**Option A - Automatic (Recommended):**
```powershell
# Double-click or run in PowerShell:
.\start-system.ps1
```

This will start both the bridge server and React app automatically!

**Option B - Manual:**
```powershell
# Terminal 1: Start Bridge Server
cd arduino-bridge
node server.js

# Terminal 2: Start React App  
npm run dev
```

### Step 3: Test It!

```powershell
# Run the test script
.\test-arduino.ps1
```

Or open your browser to `http://localhost:5173` and:
1. Go to any intersection (e.g., Camera 1)
2. Click the **Traffic Lights** tab
3. Try the buttons:
   - **🔍 Check Arduino Status** - See if Arduino is connected
   - **🔆 Test All LEDs** - Flash all your LEDs
4. Change the mode dropdown to **"AI-Optimized (Automatic)"**
5. Watch your LEDs start cycling! 🎉

## 🎮 How to Control Traffic Lights

### From React UI:

1. **Navigate** to any intersection page
2. **Click** the "Traffic Lights" tab
3. **Select Mode**:
   - **AI-Optimized (Automatic)**: LEDs cycle automatically
   - **Manual Control**: You control each light
   - **Emergency Override**: All red immediately

4. **Adjust Timings** with sliders:
   - Green: 15-60 seconds
   - Yellow: 3-8 seconds  
   - Red: 30-80 seconds

5. **Click** "Apply All Changes (Sequence + Timing)"
6. **Watch** your physical LEDs respond!

### From API (PowerShell):

```powershell
# Auto mode
Invoke-RestMethod -Uri http://localhost:3001/api/mode/AUTO -Method Post

# Stop mode (all red)
Invoke-RestMethod -Uri http://localhost:3001/api/mode/STOP -Method Post

# Set North-South to Green
Invoke-RestMethod -Uri http://localhost:3001/api/light/north-south/green -Method Post

# Emergency stop
Invoke-RestMethod -Uri http://localhost:3001/api/emergency-stop -Method Post

# Get status
Invoke-RestMethod -Uri http://localhost:3001/api/status -Method Get
```

## 🔧 Troubleshooting

### "Arduino not connected"
```powershell
1. Check USB cable is plugged in
2. Verify Arduino shows in Device Manager
3. Close Arduino IDE Serial Monitor
4. Restart bridge server: cd arduino-bridge; node server.js
5. Check COM port in Device Manager
```

### "Bridge server not responding"
```powershell
# Install dependencies
cd arduino-bridge
npm install

# Start server
node server.js

# Should see: "✅ Arduino connected successfully!"
```

### LEDs not working
```powershell
1. Check wiring (see ARDUINO_INTEGRATION_GUIDE.md)
2. Verify 220Ω resistors are used
3. Test with Arduino IDE blink example
4. Send TEST command: click "Test All LEDs" button
```

## 📊 For AI Control (Future)

Your setup is ready for AI integration! When you're ready:

1. **Create AI service** that analyzes traffic patterns
2. **Call Arduino API** with optimized commands
3. **Train model** using historical traffic data
4. **Deploy** AI to automatically adjust timings

Example AI integration flow:
```javascript
// Analyze camera feed
const trafficData = analyzeCameraFeed();

// AI decides optimal timing
const optimalSettings = aiModel.predict(trafficData);

// Send to Arduino
await arduinoService.applyTimingConfiguration(optimalSettings);
```

## 📁 File Structure

```
daloy-react/
├── src/
│   └── services/
│       └── arduinoService.ts          ← React ↔ Arduino API
├── arduino/
│   └── traffic_light_control/
│       └── traffic_light_control.ino  ← Arduino control code
├── arduino-bridge/
│   ├── server.js                      ← Bridge server
│   └── package.json
├── ARDUINO_INTEGRATION_GUIDE.md       ← Detailed guide
├── start-system.ps1                   ← Quick start script
└── test-arduino.ps1                   ← Connection test
```

## 🎯 Next Steps

1. ✅ **Upload Arduino code** to your board
2. ✅ **Run** `.\start-system.ps1`
3. ✅ **Test** with `.\test-arduino.ps1`
4. 🎮 **Control** lights from React UI
5. 🎥 **Combine** with camera feeds
6. 🤖 **Add** AI optimization
7. 📈 **Track** traffic metrics

## 📚 Documentation

- **Detailed Setup**: `ARDUINO_INTEGRATION_GUIDE.md`
- **API Reference**: See Integration Guide
- **Arduino Commands**: See Integration Guide
- **Wiring Diagram**: See Integration Guide

## ✨ Features

✅ Real-time LED control from web UI
✅ WebSocket for live status updates
✅ Safety features (only one road green)
✅ Multiple control modes (AUTO/MANUAL/TEST)
✅ Emergency stop button
✅ LED test function
✅ Status monitoring
✅ Ready for AI integration

---

**Need help?** Check the detailed guide: `ARDUINO_INTEGRATION_GUIDE.md`

**Ready to go?** Run: `.\start-system.ps1` 🚀
