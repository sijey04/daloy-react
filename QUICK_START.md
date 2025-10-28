# 🚀 Quick Start Guide - AI Detection System

## ✅ System Status

All components are ready and implemented! Here's what's been completed:

### Completed Components
- ✅ **AI Server** (`ai-server/app.py`) - YOLOv11 model running
- ✅ **Arduino Bridge** (`arduino-bridge/server.js`) - AI proxy routes added
- ✅ **AI Service** (`src/services/aiService.ts`) - React service for detection
- ✅ **Camera Component** (`src/components/camera/DynamicCameraStream.tsx`) - Detection enabled
- ✅ **Example Component** (`src/components/AIDetectionExample.tsx`) - Full working example

---

## 🎯 How to Start Everything

### Step 1: Start AI Server (Terminal 1)

```powershell
cd C:\Users\Rei\Documents\daloy-react\ai-server
.\venv\Scripts\Activate.ps1
python app.py
```

**Expected output:**
```
🤖 YOLOv11 AI Server Starting...
📊 Model: YOLOv11n
🌐 Server: http://localhost:5000
 * Running on http://127.0.0.1:5000
```

**Keep this terminal running!**

---

### Step 2: Start Arduino Bridge (Terminal 2)

⚠️ **IMPORTANT**: If the bridge is already running, you need to restart it to load the new AI routes!

```powershell
# Stop the current bridge server (Ctrl+C in its terminal)
# Then start it again:
cd C:\Users\Rei\Documents\daloy-react\arduino-bridge
node server.js
```

**Expected output:**
```
🚀 Arduino Bridge Server running on http://localhost:3001
📡 WebSocket server running on ws://localhost:3002
...
Arduino API Endpoints:
  GET  /api/status              - Get connection status
  ...
AI Service Endpoints:
  GET  /api/ai/health           - Check AI server status
  POST /api/detect              - Detect vehicles in image
  GET  /api/analytics/:id       - Get traffic analytics
  GET  /api/detect/stream/:id   - Stream detection (SSE)
```

**Keep this terminal running!**

---

### Step 3: Start React App (Terminal 3)

```powershell
cd C:\Users\Rei\Documents\daloy-react
npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 🧪 Quick Test

Once all servers are running, test the system:

### Test 1: AI Server Health
Open browser: http://localhost:5000/health

Should see:
```json
{
  "status": "healthy",
  "model": "YOLOv11n",
  "timestamp": "..."
}
```

### Test 2: Bridge AI Health
Open browser: http://localhost:3001/api/ai/health

Should see same response (proxied through bridge).

### Test 3: React App
1. Open http://localhost:5173/
2. Navigate to a camera
3. Look for the detection toggle switch
4. Enable it and watch the AI detect vehicles!

---

## 💡 Using AI Detection in Your Components

### Option 1: Use the Example Component

```tsx
import AIDetectionExample from './components/AIDetectionExample';

// In your component
<AIDetectionExample camera={selectedCamera} />
```

### Option 2: Add Detection to Existing Camera

```tsx
import { DynamicCameraStream } from './components/camera/DynamicCameraStream';

// Add state
const [detectionEnabled, setDetectionEnabled] = useState(false);

// Use the component
<DynamicCameraStream 
  camera={camera}
  enableDetection={detectionEnabled}
  onDetection={(result) => {
    console.log('Detected:', result.total_vehicles, 'vehicles');
    console.log('Cars:', result.vehicle_counts.car);
    console.log('Trucks:', result.vehicle_counts.truck);
    // Update your UI with this data
  }}
/>

// Add a toggle
<Switch 
  checked={detectionEnabled}
  onChange={(e) => setDetectionEnabled(e.target.checked)}
/>
```

---

## 🎨 What You'll See

When detection is enabled:
- 🟢 **Green boxes** around cars
- 🔴 **Red boxes** around trucks
- 🔵 **Blue boxes** around buses
- 🟡 **Yellow boxes** around motorcycles
- 🟣 **Purple boxes** around bicycles
- 📊 **Labels** showing vehicle type and confidence percentage

---

## 🔧 Configuration

### Adjust Detection Speed

In your component:
```tsx
// Detect every 2 seconds (less load)
<DynamicCameraStream 
  camera={camera}
  enableDetection={true}
  detectionInterval={2000}  // milliseconds
/>
```

### Change Model Accuracy

In `ai-server/app.py`:
```python
# Faster but less accurate
model = YOLO('yolo11n.pt')  # Current

# Slower but more accurate
model = YOLO('yolo11s.pt')  # Better
model = YOLO('yolo11m.pt')  # Best
```

### Adjust Confidence Threshold

In `ai-server/app.py`:
```python
# Line 98
results = model(img, conf=0.5)  # Current (50%)

# Change to:
results = model(img, conf=0.3)  # More detections (30%)
# or
results = model(img, conf=0.7)  # Fewer, more confident detections (70%)
```

---

## 📊 Accessing Detection Data

The `onDetection` callback receives:

```typescript
{
  success: true,
  timestamp: "2025-10-15T12:00:00.000Z",
  total_vehicles: 15,
  vehicle_counts: {
    car: 10,
    truck: 3,
    bus: 1,
    motorcycle: 1,
    bicycle: 0
  },
  detections: [
    {
      class: "car",
      confidence: 0.89,
      bbox: { x1: 100, y1: 150, x2: 300, y2: 400 }
    },
    // ... more detections
  ],
  image_size: {
    width: 1280,
    height: 720
  }
}
```

Use this data to:
- Display vehicle counts
- Calculate congestion levels
- Trigger alerts
- Generate analytics
- Store historical data

---

## 🐛 Troubleshooting

### Problem: "AI Server Offline" message

**Solutions:**
1. Check AI server is running (Terminal 1)
2. Test: http://localhost:5000/health
3. Check for Python errors in terminal

### Problem: Detection not working

**Checklist:**
- ✅ AI server running on :5000
- ✅ Arduino bridge restarted with new code
- ✅ Detection toggle is enabled
- ✅ Camera permissions granted
- ✅ No console errors (F12)

### Problem: Slow performance

**Solutions:**
1. Increase detection interval (2000ms or more)
2. Lower camera resolution
3. Use GPU (install CUDA)
4. Close other programs

### Problem: Arduino bridge doesn't show AI routes

**Solution:**
The bridge needs to be restarted to load the new code:
1. Find the terminal running the bridge
2. Press Ctrl+C to stop it
3. Run `node server.js` again
4. Look for "AI Service Endpoints" in the startup message

---

## 📈 Performance Expectations

### With CPU Only
- Detection Speed: 10-20 FPS
- Best for: 1-2 cameras
- Model: yolo11n (nano)

### With GPU (NVIDIA)
- Detection Speed: 45-60 FPS
- Best for: 4+ cameras
- Model: yolo11s or yolo11m

---

## 🎯 Next Features to Add

1. **Historical Data**: Store detections in database
2. **Analytics Dashboard**: Graph vehicle counts over time
3. **Alerts**: Notify when congestion is high
4. **Heatmaps**: Show traffic density visualization
5. **Custom Training**: Train on your specific intersection
6. **Multi-Camera**: Aggregate data from all cameras
7. **Speed Detection**: Track vehicle speeds
8. **License Plate**: Add OCR for plate recognition

---

## 📚 Files Reference

### Core Files
- `ai-server/app.py` - AI server with YOLOv11
- `arduino-bridge/server.js` - Bridge with AI proxy
- `src/services/aiService.ts` - React AI service
- `src/components/camera/DynamicCameraStream.tsx` - Camera with detection
- `src/components/AIDetectionExample.tsx` - Full example component

### Documentation
- `AI_MODEL_IMPLEMENTATION_GUIDE.md` - Full implementation guide
- `AI_INTEGRATION_COMPLETE.md` - Integration details
- `QUICK_START.md` - This file

---

## ✅ Checklist

Before starting:
- [ ] Python 3.8+ installed
- [ ] Node.js 16+ installed
- [ ] All npm packages installed (`npm install`)
- [ ] AI server dependencies installed (`pip install -r requirements.txt`)
- [ ] YOLOv11 model downloaded (happens automatically on first run)

Starting the system:
- [ ] Terminal 1: AI server running
- [ ] Terminal 2: Arduino bridge running (restarted with new code)
- [ ] Terminal 3: React app running
- [ ] All three showing no errors

Testing:
- [ ] http://localhost:5000/health returns success
- [ ] http://localhost:3001/api/ai/health returns success
- [ ] http://localhost:5173/ opens React app
- [ ] Camera permissions granted
- [ ] Detection toggle appears in UI
- [ ] Enabling detection shows bounding boxes

---

## 🎉 You're Ready!

All the code is implemented and ready to use. Just:
1. Start the three servers
2. Navigate to a camera in your React app
3. Enable the AI detection toggle
4. Watch real-time vehicle detection! 🚗🚙🚚

Need help? Check the troubleshooting section or refer to the detailed guides.

**Happy detecting!** 🤖✨
