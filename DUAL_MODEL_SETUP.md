# AI Traffic Management - Dual Model Setup

## Overview
The system now supports **two AI detection models** that can be toggled in real-time:

### 1. Custom Model (Port 5000)
- **File**: `ai-server/app.py`
- **Model**: Custom trained YOLOv11n on toy emergency vehicles
- **Classes**: ambulance, fire_truck, police_car, normal_car
- **Training**: 150 epochs on 1,296 images
- **Use Case**: Specific emergency vehicle detection

### 2. Pretrained Model (Port 5001)
- **File**: `ai-server/app_pretrained.py`
- **Model**: Pretrained YOLOv11n (COCO dataset)
- **Classes**: car, truck, bus, motorcycle, bicycle (80 total classes)
- **Use Case**: General vehicle detection

## Running the System

### Start Both AI Servers

**Terminal 1 - Custom Model:**
```powershell
$env:PYTHONPATH = "D:\Python_Packages;$env:PYTHONPATH"
cd d:\daloy-react\ai-server
python app.py
```

**Terminal 2 - Pretrained Model:**
```powershell
$env:PYTHONPATH = "D:\Python_Packages;$env:PYTHONPATH"
cd d:\daloy-react\ai-server
python app_pretrained.py
```

### Start Frontend

**Terminal 3 - React:**
```powershell
cd d:\daloy-react
npm run dev
```

## Features

### UI Model Selector
- Toggle button at the top of AI Traffic Management page
- **Custom**: Purple theme, toy car icon 🎯
- **Pretrained**: Orange theme, globe icon 🌐
- Displays model info: classes and port number

### Detection Services
- **aiService.ts**: Custom model service (port 5000)
- **aiServicePretrained.ts**: Pretrained model service (port 5001)
- Automatic service switching based on UI toggle
- Independent health checks and detection pipelines

### Color Coding

**Custom Model:**
- Ambulance: Green (#00ff00)
- Fire Truck: Red (#ff0000)
- Police Car: Blue (#0000ff)
- Normal Car: Cyan (#00ccff)

**Pretrained Model:**
- Car: Cyan (#00ccff)
- Truck: Orange (#ff6b00)
- Bus: Magenta (#ff00ff)
- Motorcycle: Yellow (#ffff00)
- Bicycle: Green (#00ff00)

## Architecture

```
Frontend (React)
    │
    ├─► aiService ──────────► app.py (Port 5000) ──► Custom Model
    │
    └─► aiServicePretrained ─► app_pretrained.py (Port 5001) ──► Pretrained Model
```

## Benefits

1. **Flexibility**: Switch models without restarting servers
2. **Comparison**: Test both models on same footage
3. **Development**: Keep custom model while testing pretrained
4. **Production**: Choose best model for your use case

## Notes

- Both servers can run simultaneously (different ports)
- Toggle switch updates all 4 camera feeds instantly
- Detection parameters match training configs
- GPU acceleration enabled on both servers
