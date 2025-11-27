import os
import sys

# GPU MODE ENABLED - Using PyTorch from D:\Python_Packages
# Comment out the lines below if you want to force CPU mode
# os.environ['CUDA_VISIBLE_DEVICES'] = '-1'
# os.environ['TORCH_CUDA_ARCH_LIST'] = ''
# os.environ['FORCE_CPU'] = '1'

from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import cv2
import numpy as np

# Try to import torch with error handling
try:
    import torch
    print(f"✅ PyTorch loaded successfully! Version: {torch.__version__}")
    print(f"🎮 CUDA available: {torch.cuda.is_available()}")
    DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'
except Exception as e:
    print(f"⚠️ PyTorch import error: {e}")
    print("📝 This is likely a CUDA DLL issue. The server will try to continue without PyTorch CUDA support.")
    print("💡 To fix: Install PyTorch CPU-only version with:")
    print("   pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu")
    # Try to continue anyway - ultralytics might handle it
    DEVICE = 'cpu'

from ultralytics import YOLO
import threading
import time
from datetime import datetime
import base64
from lane_detection import LaneDetector, DirectionalLaneDetector

app = Flask(__name__)
CORS(app)  # Enable CORS for React app

# Auto-detect GPU or CPU
DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'
if torch.cuda.is_available():
    print(f"🎮 Using device: GPU (CUDA)")
    print(f"   └─ GPU Device: {torch.cuda.get_device_name(0)}")
    print(f"   └─ GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")
else:
    print(f"🎮 Using device: CPU (CUDA not available)")

# Load Pretrained YOLOv11n Model (COCO Dataset - 80 Classes)
print("📦 Loading pretrained YOLOv11n model (COCO dataset)...")
model = YOLO('yolo11n.pt')  # Pretrained model with 80 classes
model.to(DEVICE)
print("✅ Pretrained model loaded successfully!")
print(f"📊 Model classes: {len(model.names)} classes from COCO dataset")
print(f"🎯 Vehicle classes: car, truck, bus, motorcycle, bicycle")

# Initialize lane detector (will be configured based on camera feed)
lane_detector = None

def estimate_orientation(bbox_coords, img_shape):
    """
    Estimate car orientation based on horizontal position in image
    For left-hand traffic (Philippines):
    - LEFT side of road = incoming traffic (toward camera) = 'front'
    - RIGHT side of road = outgoing traffic (away from camera) = 'back'
    
    Returns: orientation string (front, back)
    """
    x1, y1, x2, y2 = bbox_coords
    center_x = (x1 + x2) / 2
    img_center_x = img_shape[1] / 2
    
    # Use horizontal position to determine incoming vs outgoing
    # LEFT side = incoming (front), RIGHT side = outgoing (back)
    if center_x < img_center_x:
        return 'front'  # Left side = incoming traffic
    else:
        return 'back'   # Right side = outgoing traffic

# COCO dataset vehicle classes
VEHICLE_CLASSES = ['car', 'truck', 'bus', 'motorcycle', 'bicycle']

# Global variables for tracking
detection_data = {
    'total_vehicles': 0,
    'vehicles_by_type': {},
    'current_detections': [],
    'last_update': None,
    'fps': 0
}

# Camera streams
camera_streams = {}

@app.route('/', methods=['GET'])
def home():
    """Root endpoint with API information"""
    return jsonify({
        'message': 'YOLOv11 AI Detection Server (Pretrained)',
        'version': '1.0.0',
        'status': 'running',
        'model_type': 'pretrained',
        'dataset': 'COCO (80 classes)',
        'endpoints': {
            'health': '/health',
            'detect_image': '/detect (POST)',
            'detect_stream': '/detect/stream/<camera_id> (GET)',
            'analytics': '/analytics/<intersection_id> (GET)'
        },
        'model': 'YOLOv11n (Pretrained)',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model': 'YOLOv11n (Pretrained)',
        'model_type': 'pretrained',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/detect', methods=['POST'])
def detect_vehicles():
    """
    Detect vehicles in a single image using pretrained COCO model
    Expects: multipart/form-data with 'image' file
    Returns: Detection results with bounding boxes
    """
    try:
        print("📸 Received detection request (Pretrained Model)")
        print(f"   Request files: {list(request.files.keys())}")
        print(f"   Content-Type: {request.content_type}")
        
        # Get image from request
        if 'image' not in request.files:
            print("❌ No 'image' field in request.files")
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        print(f"   Filename: {file.filename}")
        
        # Read image
        img_bytes = file.read()
        print(f"   Image size: {len(img_bytes)} bytes")
        
        if len(img_bytes) == 0:
            print("❌ Empty image data")
            return jsonify({'error': 'Empty image file'}), 400
        
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            print("❌ Failed to decode image")
            return jsonify({'error': 'Invalid image format'}), 400
        
        print(f"   Image decoded: {img.shape[1]}x{img.shape[0]}")
        
        # Run inference with pretrained model
        print(f"🤖 Running YOLO inference on {DEVICE.upper()} (Pretrained COCO Model)...")
        results = model(
            img,
            imgsz=640,
            conf=0.40,             # 40% confidence for general detection
            iou=0.45,
            max_det=300,
            agnostic_nms=False,
            augment=False,
            half=(DEVICE == 'cuda'),
            verbose=False,
            device=DEVICE,
        )
        
        # Process results
        detections = []
        
        # Get class names from YOLO model (COCO has 80 classes)
        class_names = model.names
        
        # Initialize vehicle counts
        vehicle_counts = {
            'car': 0,
            'truck': 0,
            'bus': 0,
            'motorcycle': 0,
            'bicycle': 0
        }
        
        orientation_counts = {
            'front': 0,
            'back': 0,
            'left': 0,
            'right': 0,
            'unknown': 0
        }
        
        # DEBUG: Show raw detections
        print(f"🔍 Raw detections from pretrained model:")
        raw_detection_count = 0
        for result in results:
            boxes = result.boxes
            raw_detection_count = len(boxes)
            print(f"   └─ Total boxes detected: {raw_detection_count}")
            for i, box in enumerate(boxes):
                cls_id = int(box.cls[0])
                vehicle_type = class_names.get(cls_id, f'unknown_{cls_id}')
                confidence = float(box.conf[0])
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                if vehicle_type in VEHICLE_CLASSES:
                    print(f"   └─ [{i+1}] {vehicle_type}: {confidence:.2%} at [{x1:.0f}, {y1:.0f}, {x2:.0f}, {y2:.0f}]")
        
        for result in results:
            boxes = result.boxes
            for box in boxes:
                cls_id = int(box.cls[0])
                
                # Get class name from model
                vehicle_type = class_names.get(cls_id, f'unknown_{cls_id}')
                
                # FILTER: Only process vehicle classes
                if vehicle_type not in VEHICLE_CLASSES:
                    continue
                
                # Get bounding box coordinates
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                confidence = float(box.conf[0])
                
                # Estimate orientation based on bbox geometry
                orientation = estimate_orientation([x1, y1, x2, y2], img.shape)
                
                # FILTER: Only count front-facing vehicles (LEFT side = incoming traffic)
                if orientation != 'front':
                    continue  # Skip back-facing vehicles (RIGHT side = outgoing traffic)
                
                # Count only front-facing vehicles
                vehicle_counts[vehicle_type] += 1
                orientation_counts[orientation] += 1
                
                # Calculate bbox info
                width = x2 - x1
                height = y2 - y1
                center_x = (x1 + x2) / 2
                center_y = (y1 + y2) / 2
                area = width * height
                
                detections.append({
                    'class': vehicle_type,
                    'confidence': confidence,
                    'orientation': orientation,
                    'bbox': {
                        'x1': x1,
                        'y1': y1,
                        'x2': x2,
                        'y2': y2,
                        'width': width,
                        'height': height,
                        'center_x': center_x,
                        'center_y': center_y,
                        'area': area,
                        'aspect_ratio': width / height if height > 0 else 1.0
                    }
                })
        
        # Lane detection and assignment
        global lane_detector
        lane_assignments = {}
        lane_statistics = {}
        
        if lane_detector is None:
            lane_detector = LaneDetector(
                frame_width=img.shape[1], 
                frame_height=img.shape[0], 
                num_lanes=4
            )
        
        if detections:
            lane_assignments = lane_detector.assign_vehicles_to_lanes(detections)
            lane_statistics = lane_detector.get_lane_statistics(
                lane_assignments,
                labels=['Lane 1 (Left)', 'Lane 2', 'Lane 3', 'Lane 4 (Right)']
            )
        
        # Calculate statistics
        total_vehicles = sum(vehicle_counts.values())
        
        print(f"✅ Detection complete: {total_vehicles} vehicles found")
        print(f"   Vehicle counts: {vehicle_counts}")
        print(f"   Orientation counts: {orientation_counts}")
        print(f"   Detections: {len(detections)} bounding boxes")
        
        response = {
            'success': True,
            'timestamp': datetime.now().isoformat(),
            'total_vehicles': total_vehicles,
            'vehicle_counts': vehicle_counts,
            'orientation_counts': orientation_counts,
            'lane_statistics': lane_statistics,
            'detections': detections,
            'image_size': {
                'width': img.shape[1],
                'height': img.shape[0]
            },
            'preprocessing_applied': False,
            'detection_params': {
                'image_size': 640,
                'confidence_threshold': 0.40,
                'iou_threshold': 0.45,
                'max_detections': 300,
                'augment': False,
                'half_precision': (DEVICE == 'cuda'),
                'mode': 'pretrained_coco',
                'model_type': 'pretrained'
            }
        }
        
        return jsonify(response)
    
    except Exception as e:
        print(f"❌ Detection error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e),
            'detections': [],
            'total_vehicles': 0
        }), 500

@app.route('/detect/stream/<camera_id>', methods=['GET'])
def detect_stream(camera_id):
    """
    Real-time detection on video stream
    Returns: Server-Sent Events (SSE) with detection results
    """
    def generate():
        while True:
            if camera_id in camera_streams:
                frame = camera_streams[camera_id]
                
                results = model(
                    frame,
                    imgsz=640,
                    conf=0.40,
                    iou=0.45,
                    max_det=300,
                    agnostic_nms=False,
                    augment=False,
                    half=(DEVICE == 'cuda'),
                    verbose=False,
                    device=DEVICE
                )
                
                detections = []
                class_names = model.names
                vehicle_counts = {v: 0 for v in VEHICLE_CLASSES}
                
                for result in results:
                    boxes = result.boxes
                    for box in boxes:
                        cls_id = int(box.cls[0])
                        vehicle_type = class_names.get(cls_id, f'unknown_{cls_id}')
                        
                        if vehicle_type not in VEHICLE_CLASSES:
                            continue
                        
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
            
            time.sleep(0.1)
    
    return Response(generate(), mimetype='text/event-stream')

@app.route('/analytics/<intersection_id>', methods=['GET'])
def get_analytics(intersection_id):
    """Get traffic analytics"""
    return jsonify({
        'intersection_id': intersection_id,
        'timestamp': datetime.now().isoformat(),
        'current_data': detection_data,
        'analytics': {
            'vehicles_per_hour': detection_data['total_vehicles'] * 60,
            'congestion_level': calculate_congestion_level(detection_data['total_vehicles']),
            'average_speed': 25,
            'peak_hours': ['7:00-9:00', '16:00-18:00']
        }
    })

@app.route('/lanes/configure', methods=['POST'])
def configure_lanes():
    """Configure lane boundaries"""
    global lane_detector
    
    try:
        data = request.get_json()
        num_lanes = data.get('num_lanes', 4)
        boundaries = data.get('boundaries')
        
        lane_detector = LaneDetector(
            frame_width=data.get('frame_width', 1280),
            frame_height=data.get('frame_height', 720),
            num_lanes=num_lanes
        )
        
        if boundaries:
            lane_detector.set_custom_boundaries(boundaries)
        
        return jsonify({
            'success': True,
            'message': 'Lane configuration updated',
            'num_lanes': num_lanes,
            'boundaries': lane_detector.lane_boundaries
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/lanes/info', methods=['GET'])
def get_lane_info():
    """Get current lane configuration"""
    global lane_detector
    
    if lane_detector is None:
        return jsonify({
            'configured': False,
            'message': 'Lane detector not initialized'
        })
    
    return jsonify({
        'configured': True,
        'num_lanes': lane_detector.num_lanes,
        'boundaries': lane_detector.lane_boundaries,
        'frame_width': lane_detector.frame_width,
        'frame_height': lane_detector.frame_height
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
    print("\n" + "="*80)
    print("🤖 YOLOv11 AI Server Starting (Pretrained Model)...")
    print("="*80)
    print("📊 Model: YOLOv11n Pretrained (COCO Dataset - 80 Classes)")
    print("🌐 Server: http://localhost:5001")
    print("🛣️  Lane Detection: Enabled")
    print(f"🎮 Device: {DEVICE.upper()}")
    if torch.cuda.is_available():
        print(f"   └─ GPU: {torch.cuda.get_device_name(0)}")
        print(f"   └─ Memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")
    print(f"⚡ Performance Mode: {'GPU Inference (FP16)' if DEVICE == 'cuda' else 'CPU Inference'}")
    print(f"🎯 Vehicle Classes: {', '.join(VEHICLE_CLASSES)}")
    print("="*80 + "\n")
    app.run(host='0.0.0.0', port=5001, debug=True, threaded=True, use_reloader=True)
