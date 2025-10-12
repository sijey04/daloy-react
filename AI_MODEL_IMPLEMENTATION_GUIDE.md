# YOLOv11 AI Model Implementation Guide 🤖

## Overview
This guide walks you through implementing Ultralytics YOLOv11 for real-time vehicle detection and traffic analysis in your traffic management system.

---

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Project Structure](#project-structure)
4. [Step-by-Step Implementation](#step-by-step-implementation)
5. [Integration with React](#integration-with-react)
6. [Training Custom Model](#training-custom-model)
7. [Performance Optimization](#performance-optimization)
8. [Testing & Validation](#testing--validation)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Port 5173)                │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │   Camera    │  │   Traffic    │  │   Real-time       │  │
│  │   Feeds     │  │   Analysis   │  │   Dashboard       │  │
│  └──────┬──────┘  └──────┬───────┘  └───────┬───────────┘  │
└─────────┼────────────────┼──────────────────┼───────────────┘
          │                │                  │
          │ WebSocket/REST │                  │
          ▼                ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│              Node.js Bridge Server (Port 3001)               │
│  ┌─────────────────┐        ┌─────────────────────────┐    │
│  │  Arduino Bridge │        │   AI Service Bridge     │    │
│  │   (Existing)    │        │      (NEW)              │    │
│  └─────────┬───────┘        └──────────┬──────────────┘    │
└────────────┼───────────────────────────┼────────────────────┘
             │                           │
             │ Serial (9600)             │ HTTP/WebSocket
             ▼                           ▼
      ┌────────────┐          ┌──────────────────────┐
      │  Arduino   │          │  Python AI Server    │
      │    Uno     │          │  (Flask/FastAPI)     │
      └────────────┘          └──────────┬───────────┘
                                         │
                                         ▼
                              ┌─────────────────────┐
                              │  YOLOv11 Model      │
                              │  - Detection        │
                              │  - Classification   │
                              │  - Tracking         │
                              └─────────────────────┘
```

---

## 📦 Prerequisites

### System Requirements
- **Python**: 3.8 - 3.11 (YOLOv11 compatible)
- **Node.js**: 16+ (already installed)
- **RAM**: Minimum 8GB (16GB recommended)
- **GPU**: NVIDIA GPU with CUDA (optional but highly recommended)
- **Storage**: 5GB+ for models and datasets

### Software Installation
```powershell
# 1. Install Python (if not already installed)
# Download from: https://www.python.org/downloads/

# 2. Verify Python installation
python --version

# 3. Install CUDA Toolkit (for GPU acceleration - optional)
# Download from: https://developer.nvidia.com/cuda-downloads
```

---

## 📁 Project Structure

```
daloy-react/
├── ai-server/                    # NEW: Python AI server
│   ├── app.py                    # Main Flask/FastAPI server
│   ├── models/                   # YOLOv11 model files
│   │   ├── yolov11n.pt          # Nano model (fastest)
│   │   ├── yolov11s.pt          # Small model
│   │   ├── yolov11m.pt          # Medium model
│   │   ├── yolov11l.pt          # Large model
│   │   └── custom_traffic.pt    # Custom trained model
│   ├── config/
│   │   ├── config.yaml          # Model configuration
│   │   └── classes.yaml         # Vehicle classes
│   ├── utils/
│   │   ├── detector.py          # Detection logic
│   │   ├── tracker.py           # Vehicle tracking
│   │   └── analyzer.py          # Traffic analysis
│   ├── data/                     # Training data (optional)
│   │   ├── images/
│   │   ├── labels/
│   │   └── dataset.yaml
│   ├── requirements.txt          # Python dependencies
│   └── README.md
│
├── arduino-bridge/               # Existing Arduino bridge
│   ├── server.js                 # UPDATED: Add AI service proxy
│   └── package.json
│
├── src/
│   ├── services/
│   │   ├── arduinoService.ts    # Existing
│   │   └── aiService.ts         # NEW: AI detection service
│   └── components/
│       └── CameraDetail.tsx     # UPDATED: Real detection data
│
└── docs/
    └── AI_MODEL_IMPLEMENTATION_GUIDE.md  # This file
```

---

## 🚀 Step-by-Step Implementation

### Phase 1: Set Up Python AI Server (Day 1-2)

#### Step 1.1: Create AI Server Directory
```powershell
cd C:\Users\Rei\Documents\daloy-react
mkdir ai-server
cd ai-server
```

#### Step 1.2: Create Virtual Environment
```powershell
# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate

# Your prompt should now show (venv)
```

#### Step 1.3: Install Dependencies
```powershell
# Install Ultralytics YOLOv11
pip install ultralytics

# Install web framework (choose one)
pip install flask flask-cors  # Simpler, recommended for beginners
# OR
pip install fastapi uvicorn python-multipart  # More advanced, better performance

# Install additional libraries
pip install opencv-python
pip install numpy
pip install pillow
pip install pyyaml
pip install torch torchvision  # PyTorch (CPU version)

# For GPU support (if you have NVIDIA GPU)
# pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118

# Save requirements
pip freeze > requirements.txt
```

#### Step 1.4: Create Flask Server (`ai-server/app.py`)
```python
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import cv2
import numpy as np
from ultralytics import YOLO
import threading
import time
from datetime import datetime
import base64

app = Flask(__name__)
CORS(app)  # Enable CORS for React app

# Load YOLOv11 model
model = YOLO('yolov11n.pt')  # Nano model (fastest)
# model = YOLO('yolov11s.pt')  # Small model (balanced)
# model = YOLO('yolov11m.pt')  # Medium model (accurate)

# Vehicle classes (COCO dataset indices)
VEHICLE_CLASSES = {
    2: 'car',
    3: 'motorcycle',
    5: 'bus',
    7: 'truck',
    1: 'bicycle'
}

# Global variables for tracking
detection_data = {
    'total_vehicles': 0,
    'vehicles_by_type': {
        'car': 0,
        'truck': 0,
        'bus': 0,
        'motorcycle': 0,
        'bicycle': 0
    },
    'current_detections': [],
    'last_update': None,
    'fps': 0
}

# Camera streams
camera_streams = {}

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model': 'YOLOv11n',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/detect', methods=['POST'])
def detect_vehicles():
    """
    Detect vehicles in a single image
    Expects: multipart/form-data with 'image' file
    Returns: Detection results with bounding boxes
    """
    try:
        # Get image from request
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        
        # Read image
        img_bytes = file.read()
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Run inference
        results = model(img, conf=0.5)  # 50% confidence threshold
        
        # Process results
        detections = []
        vehicle_counts = {
            'car': 0,
            'truck': 0,
            'bus': 0,
            'motorcycle': 0,
            'bicycle': 0
        }
        
        for result in results:
            boxes = result.boxes
            for box in boxes:
                cls_id = int(box.cls[0])
                
                # Check if it's a vehicle
                if cls_id in VEHICLE_CLASSES:
                    vehicle_type = VEHICLE_CLASSES[cls_id]
                    vehicle_counts[vehicle_type] += 1
                    
                    # Get bounding box coordinates
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    confidence = float(box.conf[0])
                    
                    detections.append({
                        'class': vehicle_type,
                        'confidence': confidence,
                        'bbox': {
                            'x1': x1,
                            'y1': y1,
                            'x2': x2,
                            'y2': y2
                        }
                    })
        
        # Calculate statistics
        total_vehicles = sum(vehicle_counts.values())
        
        response = {
            'success': True,
            'timestamp': datetime.now().isoformat(),
            'total_vehicles': total_vehicles,
            'vehicle_counts': vehicle_counts,
            'detections': detections,
            'image_size': {
                'width': img.shape[1],
                'height': img.shape[0]
            }
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/detect/stream/<camera_id>', methods=['GET'])
def detect_stream(camera_id):
    """
    Real-time detection on video stream
    Returns: Server-Sent Events (SSE) with detection results
    """
    def generate():
        while True:
            # In production, get frame from actual camera
            # For now, we'll wait for frames from the bridge
            if camera_id in camera_streams:
                frame = camera_streams[camera_id]
                
                # Run inference
                results = model(frame, conf=0.5)
                
                # Process and send results
                detections = []
                vehicle_counts = {
                    'car': 0, 'truck': 0, 'bus': 0, 
                    'motorcycle': 0, 'bicycle': 0
                }
                
                for result in results:
                    boxes = result.boxes
                    for box in boxes:
                        cls_id = int(box.cls[0])
                        if cls_id in VEHICLE_CLASSES:
                            vehicle_type = VEHICLE_CLASSES[cls_id]
                            vehicle_counts[vehicle_type] += 1
                            
                            x1, y1, x2, y2 = box.xyxy[0].tolist()
                            confidence = float(box.conf[0])
                            
                            detections.append({
                                'class': vehicle_type,
                                'confidence': confidence,
                                'bbox': {
                                    'x1': x1, 'y1': y1,
                                    'x2': x2, 'y2': y2
                                }
                            })
                
                data = {
                    'timestamp': datetime.now().isoformat(),
                    'camera_id': camera_id,
                    'total_vehicles': sum(vehicle_counts.values()),
                    'vehicle_counts': vehicle_counts,
                    'detections': detections
                }
                
                yield f"data: {jsonify(data).get_data(as_text=True)}\n\n"
            
            time.sleep(0.1)  # 10 FPS
    
    return Response(generate(), mimetype='text/event-stream')

@app.route('/analytics/<intersection_id>', methods=['GET'])
def get_analytics(intersection_id):
    """
    Get traffic analytics for an intersection
    Returns: Aggregated statistics
    """
    # In production, query database for historical data
    # For now, return current detection data
    
    return jsonify({
        'intersection_id': intersection_id,
        'timestamp': datetime.now().isoformat(),
        'current_data': detection_data,
        'analytics': {
            'vehicles_per_hour': detection_data['total_vehicles'] * 60,  # Approximate
            'congestion_level': calculate_congestion_level(detection_data['total_vehicles']),
            'average_speed': 25,  # Placeholder - requires tracking
            'peak_hours': ['7:00-9:00', '16:00-18:00']
        }
    })

def calculate_congestion_level(vehicle_count):
    """Calculate congestion level based on vehicle count"""
    if vehicle_count < 10:
        return 'Low'
    elif vehicle_count < 30:
        return 'Medium'
    else:
        return 'High'

if __name__ == '__main__':
    print("🤖 YOLOv11 AI Server Starting...")
    print("📊 Model: YOLOv11n")
    print("🌐 Server: http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
```

#### Step 1.5: Test the AI Server
```powershell
# Make sure virtual environment is activated
.\venv\Scripts\activate

# Run the server
python app.py

# Server should start on http://localhost:5000
```

Test with curl or browser:
```powershell
# Health check
curl http://localhost:5000/health
```

---

### Phase 2: Update Arduino Bridge Server (Day 2)

#### Step 2.1: Update `arduino-bridge/server.js`

Add AI service proxy to existing server:

```javascript
// Add at the top with other requires
const axios = require('axios');

// AI Server configuration
const AI_SERVER_URL = 'http://localhost:5000';

// Add new route for AI detection
app.post('/api/detect', async (req, res) => {
  try {
    // Forward request to AI server
    const response = await axios.post(`${AI_SERVER_URL}/detect`, req.body, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('AI detection error:', error.message);
    res.status(500).json({ error: 'AI detection failed' });
  }
});

// Add route for analytics
app.get('/api/analytics/:intersectionId', async (req, res) => {
  try {
    const { intersectionId } = req.params;
    const response = await axios.get(`${AI_SERVER_URL}/analytics/${intersectionId}`);
    
    res.json(response.data);
  } catch (error) {
    console.error('Analytics error:', error.message);
    res.status(500).json({ error: 'Analytics fetch failed' });
  }
});

// Health check for AI server
app.get('/api/ai/health', async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVER_URL}/health`);
    res.json(response.data);
  } catch (error) {
    res.status(503).json({ 
      status: 'unavailable',
      error: 'AI server not responding'
    });
  }
});
```

#### Step 2.2: Install Axios
```powershell
cd arduino-bridge
npm install axios
```

---

### Phase 3: Create React AI Service (Day 3)

#### Step 3.1: Create `src/services/aiService.ts`

```typescript
import axios from 'axios';

const BRIDGE_URL = 'http://localhost:3001';

export interface DetectionResult {
  class: string;
  confidence: number;
  bbox: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

export interface VehicleCounts {
  car: number;
  truck: number;
  bus: number;
  motorcycle: number;
  bicycle: number;
}

export interface DetectionResponse {
  success: boolean;
  timestamp: string;
  total_vehicles: number;
  vehicle_counts: VehicleCounts;
  detections: DetectionResult[];
  image_size: {
    width: number;
    height: number;
  };
}

export interface AnalyticsData {
  intersection_id: string;
  timestamp: string;
  current_data: {
    total_vehicles: number;
    vehicles_by_type: VehicleCounts;
    fps: number;
  };
  analytics: {
    vehicles_per_hour: number;
    congestion_level: string;
    average_speed: number;
    peak_hours: string[];
  };
}

class AIService {
  private baseURL: string;

  constructor() {
    this.baseURL = BRIDGE_URL;
  }

  /**
   * Check if AI server is healthy
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/api/ai/health`);
      return response.data.status === 'healthy';
    } catch (error) {
      console.error('AI health check failed:', error);
      return false;
    }
  }

  /**
   * Detect vehicles in an image
   */
  async detectVehicles(imageFile: File): Promise<DetectionResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await axios.post(`${this.baseURL}/api/detect`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Detect vehicles from canvas (camera stream)
   */
  async detectFromCanvas(canvas: HTMLCanvasElement): Promise<DetectionResponse> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          reject(new Error('Failed to convert canvas to blob'));
          return;
        }

        const file = new File([blob], 'frame.jpg', { type: 'image/jpeg' });
        try {
          const result = await this.detectVehicles(file);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, 'image/jpeg', 0.8);
    });
  }

  /**
   * Get traffic analytics for an intersection
   */
  async getAnalytics(intersectionId: string): Promise<AnalyticsData> {
    const response = await axios.get(`${this.baseURL}/api/analytics/${intersectionId}`);
    return response.data;
  }

  /**
   * Start real-time detection (polling)
   */
  startRealtimeDetection(
    canvas: HTMLCanvasElement,
    callback: (result: DetectionResponse) => void,
    interval: number = 1000 // 1 second
  ): number {
    const intervalId = window.setInterval(async () => {
      try {
        const result = await this.detectFromCanvas(canvas);
        callback(result);
      } catch (error) {
        console.error('Real-time detection error:', error);
      }
    }, interval);

    return intervalId;
  }

  /**
   * Stop real-time detection
   */
  stopRealtimeDetection(intervalId: number): void {
    clearInterval(intervalId);
  }
}

export const aiService = new AIService();
export default aiService;
```

---

### Phase 4: Update CameraDetail Component (Day 3-4)

#### Step 4.1: Add Real-time Detection to Camera Feeds

Update `src/components/camera/DynamicCameraStream.tsx`:

```typescript
import { useEffect, useRef, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Camera } from '../../types';
import { aiService, DetectionResponse } from '../../services/aiService';

interface DynamicCameraStreamProps {
  camera: Camera;
  opacity?: number;
  enableDetection?: boolean; // NEW
  onDetection?: (result: DetectionResponse) => void; // NEW
}

export const DynamicCameraStream = ({ 
  camera, 
  opacity = 1,
  enableDetection = false,
  onDetection
}: DynamicCameraStreamProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detectionIntervalId, setDetectionIntervalId] = useState<number | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const initCamera = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Request camera access
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: camera.id ? { exact: camera.id } : undefined,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Camera initialization error:', err);
        setError('Failed to access camera');
        setIsLoading(false);
      }
    };

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (detectionIntervalId) {
        aiService.stopRealtimeDetection(detectionIntervalId);
      }
    };
  }, [camera.id]);

  // Start detection when enabled
  useEffect(() => {
    if (enableDetection && canvasRef.current && videoRef.current && !isLoading) {
      // Draw video to canvas for detection
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      const drawFrame = () => {
        if (videoRef.current && canvasRef.current) {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
          ctx.drawImage(videoRef.current, 0, 0);
        }
      };

      // Update canvas every frame
      const frameInterval = setInterval(drawFrame, 100);

      // Start AI detection
      const intervalId = aiService.startRealtimeDetection(
        canvasRef.current,
        (result) => {
          if (onDetection) {
            onDetection(result);
          }
        },
        2000 // Detect every 2 seconds
      );

      setDetectionIntervalId(intervalId);

      return () => {
        clearInterval(frameInterval);
        if (intervalId) {
          aiService.stopRealtimeDetection(intervalId);
        }
      };
    }
  }, [enableDetection, isLoading, onDetection]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box position="relative" width="100%" height="100%">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity,
        }}
      />
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />
    </Box>
  );
};
```

#### Step 4.2: Update CameraDetail to Use Real Detection Data

Add state for detection results:

```typescript
// Add to imports
import { aiService, DetectionResponse } from '../services/aiService';

// Add state in CameraDetail component
const [detectionEnabled, setDetectionEnabled] = useState(false);
const [detectionResults, setDetectionResults] = useState<Record<number, DetectionResponse>>({});

// Handler for detection updates
const handleDetection = (cameraId: number, result: DetectionResponse) => {
  setDetectionResults(prev => ({
    ...prev,
    [cameraId]: result
  }));
  
  // Update intersection data with real detection
  setIntersectionData((prev: any) => ({
    ...prev,
    trafficAnalysis: {
      ...prev.trafficAnalysis,
      vehiclesPerHour: result.total_vehicles * 30, // Approximate
      vehicleTypes: {
        cars: result.vehicle_counts.car,
        trucks: result.vehicle_counts.truck,
        buses: result.vehicle_counts.bus,
        motorcycles: result.vehicle_counts.motorcycle,
        bicycles: result.vehicle_counts.bicycle,
      },
      totalVehicles: result.total_vehicles,
    },
  }));
};

// Update camera feeds to enable detection
<DynamicCameraStream
  camera={camera}
  enableDetection={detectionEnabled}
  onDetection={(result) => handleDetection(camera.id, result)}
/>

// Add toggle for detection
<FormControlLabel
  control={
    <Switch 
      checked={detectionEnabled}
      onChange={(e) => setDetectionEnabled(e.target.checked)}
    />
  }
  label="Enable AI Detection"
/>
```

---

### Phase 5: Training Custom Model (Optional - Day 5-7)

If you want to train a custom model on your specific traffic scenarios:

#### Step 5.1: Collect Training Data
```powershell
cd ai-server
mkdir -p data/images data/labels
```

Capture images from your cameras and label them using:
- **Roboflow**: https://roboflow.com (recommended, easy to use)
- **CVAT**: https://cvat.org
- **Label Studio**: https://labelstud.io

#### Step 5.2: Train Custom Model
```python
from ultralytics import YOLO

# Load pretrained model
model = YOLO('yolov11n.pt')

# Train on custom dataset
results = model.train(
    data='data/dataset.yaml',  # Your dataset config
    epochs=100,
    imgsz=640,
    batch=16,
    name='traffic_custom',
    patience=50,
    save=True,
    device=0  # GPU (use 'cpu' if no GPU)
)

# Save best model
model.save('models/custom_traffic.pt')
```

---

## 🔧 Configuration Files

### `ai-server/config/config.yaml`
```yaml
model:
  name: yolov11n
  confidence_threshold: 0.5
  iou_threshold: 0.45
  max_detections: 100

server:
  host: 0.0.0.0
  port: 5000
  debug: true
  workers: 4

detection:
  fps: 10
  batch_size: 1
  image_size: 640

classes:
  vehicles:
    - car
    - truck
    - bus
    - motorcycle
    - bicycle
```

### `ai-server/requirements.txt`
```
ultralytics==8.0.200
flask==3.0.0
flask-cors==4.0.0
opencv-python==4.8.1.78
numpy==1.24.3
pillow==10.1.0
pyyaml==6.0.1
torch==2.1.0
torchvision==0.16.0
```

---

## 📊 Performance Optimization

### Model Selection Guide
| Model | Speed (FPS) | Accuracy | Use Case |
|-------|------------|----------|----------|
| YOLOv11n | 45-60 | Good | Real-time, multiple cameras |
| YOLOv11s | 30-45 | Better | Balanced performance |
| YOLOv11m | 20-30 | Best | High accuracy needed |
| YOLOv11l | 10-20 | Excellent | Offline processing |

### Tips for Better Performance
1. **Use GPU**: 10-20x faster than CPU
2. **Lower Resolution**: 640x640 instead of 1280x1280
3. **Batch Processing**: Process multiple frames together
4. **Frame Skipping**: Detect every 2-3 frames instead of all
5. **Model Quantization**: Convert to INT8 for faster inference

---

## 🧪 Testing & Validation

### Test Script (`ai-server/test_detection.py`)
```python
from ultralytics import YOLO
import cv2
import time

# Load model
model = YOLO('yolov11n.pt')

# Test image
img_path = 'test_images/traffic.jpg'
img = cv2.imread(img_path)

# Run detection
start_time = time.time()
results = model(img)
inference_time = time.time() - start_time

print(f"Inference time: {inference_time:.3f}s")
print(f"FPS: {1/inference_time:.1f}")

# Display results
for result in results:
    result.show()  # Display with bounding boxes
    result.save('output.jpg')  # Save result
```

Run tests:
```powershell
python test_detection.py
```

---

## 🚀 Deployment Checklist

- [ ] Python environment set up
- [ ] YOLOv11 model downloaded
- [ ] AI server running on port 5000
- [ ] Arduino bridge updated with AI proxy
- [ ] React aiService.ts created
- [ ] CameraDetail updated with detection
- [ ] Health check endpoint working
- [ ] Detection API tested
- [ ] Real-time detection working
- [ ] Performance acceptable (>10 FPS)
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Documentation updated

---

## 🔗 Useful Resources

- **Ultralytics Docs**: https://docs.ultralytics.com
- **YOLOv11 Paper**: https://arxiv.org/abs/2304.00501
- **Training Guide**: https://docs.ultralytics.com/modes/train/
- **Roboflow Tutorial**: https://blog.roboflow.com/how-to-train-yolov8/
- **PyTorch Install**: https://pytorch.org/get-started/locally/

---

## 🆘 Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'ultralytics'"
**Solution**: Activate virtual environment first
```powershell
cd ai-server
.\venv\Scripts\activate
pip install ultralytics
```

### Issue: Slow inference (< 5 FPS)
**Solutions**:
1. Use smaller model (yolov11n instead of yolov11l)
2. Reduce image size (640 instead of 1280)
3. Enable GPU acceleration
4. Process fewer frames (skip frames)

### Issue: "CUDA out of memory"
**Solutions**:
1. Reduce batch size
2. Use smaller model
3. Lower image resolution
4. Close other GPU applications

### Issue: Detection accuracy poor
**Solutions**:
1. Increase confidence threshold
2. Use larger model (yolov11m or yolov11l)
3. Train custom model on your data
4. Improve camera positioning/lighting

---

## 📝 Next Steps

1. **Start with Phase 1**: Set up Python AI server
2. **Test Detection**: Verify model works with test images
3. **Integrate with Bridge**: Connect AI server to Node.js
4. **Update React**: Add real-time detection to UI
5. **Optimize**: Tune for your hardware/requirements
6. **Train Custom**: (Optional) Train on your specific scenarios
7. **Deploy**: Set up for production use

---

**Ready to implement?** Start with Phase 1 and work through each step. Test thoroughly at each phase before moving to the next!

**Questions or issues?** Check the troubleshooting section or refer to Ultralytics documentation.

Good luck with your AI implementation! 🚀🤖
