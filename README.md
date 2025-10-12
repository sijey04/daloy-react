# 🚦 Demand-Driven Traffic Light Optimization System

An AI-powered solution with **real-time Arduino integration** designed to revolutionize urban traffic management by replacing costly proprietary systems like SCATS.

## 🌟 Overview

This system leverages computer vision and machine learning to analyze traffic patterns in real-time and optimize traffic signal timings accordingly. By using affordable, open-source technologies, we provide an accessible alternative to expensive proprietary traffic management systems while delivering superior performance.

**NEW: Real-time Arduino integration with live monitoring, WebSocket synchronization, and instant manual control!**

## ✨ Key Features

### Traffic Monitoring & Control
- **Real-Time Traffic Lights**: Live Arduino synchronization via WebSocket
- **Live Countdown Timer**: Real-time display updates every second
- **Manual Control**: Instant red/yellow/green button controls
- **Automatic Mode**: AI-ready autonomous cycling
- **Emergency Override**: One-click all-red safety mode

### Camera & Vision
- **Multi-Camera Support**: Dual USB camera feeds with split-screen
- **Vehicle Detection**: OpenCV and YOLO for accurate detection (Coming Soon)
- **PTZ Controls**: Pan/Tilt/Zoom simulation in fullscreen view
- **Dynamic Resolution**: Auto-adjusts for USB bandwidth

### Hardware Integration
- **Arduino Uno**: Physical LED control (12 LEDs for 4 roads)
- **Node.js Bridge**: Express REST API + WebSocket server
- **Serial Communication**: 9600 baud USB connection
- **Safety Logic**: Only one road green at a time

### User Interface
- **Modern React Dashboard**: TypeScript + Material-UI
- **Fullscreen Monitoring**: Dedicated view for traffic lights
- **Connection Status**: Live Arduino connection indicator
- **Responsive Design**: Works on desktop, tablet, mobile

## 🏗️ Technical Architecture

```
React Web App (Port 5173)
    ↕ REST API & WebSocket
Node.js Bridge (Port 3001 & 3002)
    ↕ Serial Communication (9600 baud)
Arduino Uno
    ↕ Digital Pins 2-13
12 LEDs (4 roads × 3 colors)
```

### Technology Stack

- **Frontend**: React 18 + TypeScript + Vite + Material-UI v6
- **Backend**: Node.js + Express + WebSocket (ws)
- **Hardware**: Arduino Uno + SerialPort library
- **Computer Vision**: OpenCV + YOLO (in development)
- **Real-Time**: WebSocket for instant updates
- **API**: RESTful endpoints for control commands

## Benefits

- **Reduced Congestion**: Intelligent signal timing reduces vehicle wait times
- **Lower Emissions**: Less idling time means reduced vehicle emissions
- **Improved Urban Mobility**: More efficient traffic flow for all road users
- **Cost Savings**: Significant reduction in implementation costs compared to proprietary systems
- **Scalability**: Easily deployable across multiple intersections

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Arduino Uno with USB cable
- 12 LEDs + 220Ω resistors (optional, for visual feedback)
- 2 USB cameras (optional, for video monitoring)

### Installation

```powershell
# 1. Install dependencies
npm install

cd arduino-bridge
npm install
cd ..

# 2. Upload Arduino code
# Open Arduino IDE
# Load: arduino/traffic_light_control/traffic_light_control.ino
# Upload to Arduino Uno

# 3. Start everything (automatic)
.\start-system.ps1

# OR start manually:
# Terminal 1: Bridge server
cd arduino-bridge
node server.js

# Terminal 2: React app
npm run dev
```

### View Real-Time Monitor

1. Open: `http://localhost:5173/camera/1`
2. Click fullscreen button ⛶
3. Select "Traffic Lights" tab
4. Watch live timer and lights! 🎉

## 📚 Documentation

- **[ARDUINO_SETUP_SUMMARY.md](./ARDUINO_SETUP_SUMMARY.md)** - Complete setup guide ⭐ Start here!
- **[REALTIME_SYNC_GUIDE.md](./REALTIME_SYNC_GUIDE.md)** - Real-time synchronization details
- **[ARDUINO_INTEGRATION_GUIDE.md](./ARDUINO_INTEGRATION_GUIDE.md)** - Technical deep dive
- **[DEMO_SCRIPT.md](./DEMO_SCRIPT.md)** - Demo walkthrough
- **[COMPLETE_SYSTEM_OVERVIEW.md](./COMPLETE_SYSTEM_OVERVIEW.md)** - Full feature summary

## 🎯 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `.\start-system.ps1` - Auto-start everything (Windows)
- `.\test-arduino.ps1` - Test Arduino connection (Windows)

## License

[MIT License](LICENSE)

---

## For Developers

### Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```
```