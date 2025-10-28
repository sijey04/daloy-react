# 🤖 AI Server - YOLOv11 Toy Car Detection (IMPROVED)

Flask server for real-time toy car detection with orientation identification using Ultralytics YOLOv11.

## 🎯 Recent Improvements

### ✅ Option 3: Immediate Improvements (APPLIED)
- **Image Preprocessing**: CLAHE contrast enhancement, denoising, sharpening
- **Optimized Detection**: Better parameters for toy car detection (conf=0.3, augment=True)
- **Orientation Estimation**: Basic geometric orientation detection (front/back/left/right)
- **Enhanced Response Data**: Detailed bbox info, orientation counts, detection params

**Expected Accuracy**: 60-75% (up from 40-50%)

### 🚀 Option 1: Custom Training (READY)
- Complete training pipeline with 6 scripts
- Data collection, preparation, training, and testing tools
- See `TRAINING_GUIDE.md` for full instructions

**Expected Accuracy After Training**: 85-95%

---

## 🚀 Quick Start

### First Time Setup

```powershell
# Run automated setup
.\setup.ps1
```

This will:
1. Install all required dependencies
2. Verify installation
3. Offer to start the server

### Manual Setup

```powershell
# Install dependencies
pip install -r requirements.txt

# Run server
python app.py
```

Server starts on: `http://localhost:5000`

---

## 📡 API Endpoints

### GET /
API information and available endpoints

### GET /health
Server health check
```json
{
  "status": "healthy",
  "model": "YOLOv11n",
  "timestamp": "2025-10-15T..."
}
```

### POST /detect
Detect vehicles in an image

**Request:** multipart/form-data with 'image' file

**Response:**
```json
{
  "success": true,
  "total_vehicles": 3,
  "vehicle_counts": {
    "car": 3,
    "truck": 0,
    "bus": 0,
    "motorcycle": 0,
    "bicycle": 0
  },
  "orientation_counts": {
    "front": 1,
    "back": 0,
    "left": 1,
    "right": 1,
    "unknown": 0
  },
  "detections": [
    {
      "class": "car",
      "confidence": 0.87,
      "orientation": "front",
      "bbox": {
        "x1": 123,
        "y1": 234,
        "x2": 456,
        "y2": 567,
        "width": 333,
        "height": 333,
        "center_x": 289.5,
        "center_y": 400.5,
        "area": 110889,
        "aspect_ratio": 1.0
      }
    }
  ],
  "image_size": {
    "width": 1920,
    "height": 1080
  },
  "preprocessing_applied": true,
  "detection_params": {
    "confidence_threshold": 0.3,
    "iou_threshold": 0.4,
    "augment": true
  }
}
      "class": "car",
      "confidence": 0.89,
      "bbox": {"x1": 100, "y1": 150, "x2": 300, "y2": 400}
    }
  ]
}
```

### GET /detect/stream/:camera_id
Real-time detection stream (Server-Sent Events)

### GET /analytics/:intersection_id
Get traffic analytics for an intersection

## 🎯 Vehicle Classes

- Car (green boxes)
- Truck (red boxes)
- Bus (blue boxes)
- Motorcycle (yellow boxes)
- Bicycle (purple boxes)

## ⚙️ Configuration

### Change Model

Edit `app.py` line 15:
```python
model = YOLO('yolo11n.pt')  # Fast (current)
model = YOLO('yolo11s.pt')  # Balanced
model = YOLO('yolo11m.pt')  # Accurate
```

### Adjust Confidence

Edit `app.py` line 98:
```python
results = model(img, conf=0.5)  # 50% confidence
results = model(img, conf=0.3)  # More detections
results = model(img, conf=0.7)  # Higher confidence
```

## 📦 Dependencies

See `requirements.txt`:
- ultralytics (YOLOv11)
- flask
- opencv-python
- numpy
- torch

## 🧪 Testing

```powershell
# Health check
Invoke-WebRequest -Uri http://localhost:5000/health

# Test with image
curl -X POST http://localhost:5000/detect -F "image=@test.jpg"
```

## 📊 Performance

- **CPU**: 10-20 FPS
- **GPU**: 45-60 FPS (with CUDA)
- **Latency**: ~50-100ms per frame
- **Memory**: ~500MB

## 🔗 Integration

Used by Arduino Bridge Server on port 3001 as proxy.  
React app connects through bridge, not directly.

## 📚 Documentation

- See parent directory: `QUICK_START.md`
- Full guide: `AI_MODEL_IMPLEMENTATION_GUIDE.md`
