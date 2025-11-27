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

# Load Custom Trained Model (Emergency Vehicle Detection - Toy Cars)
# This model is trained on your custom dataset with 4 classes
print("📦 Loading custom trained model (Emergency Vehicle Detection - Toy Cars)...")
# Auto-select the newest available trained model in `runs/detect/*/weights/best.pt`.
def find_latest_model(runs_dir='runs/detect', fallback_paths=None):
    import glob
    import os

    # Look for best.pt files in runs/detect/*/weights/best.pt
    pattern = os.path.join(runs_dir, '*', 'weights', 'best.pt')
    candidates = glob.glob(pattern)
    if candidates:
        # Return the most recently modified candidate
        candidates.sort(key=lambda p: os.path.getmtime(p), reverse=True)
        return candidates[0]

    # Optional explicit fallbacks (keeps backward compatibility)
    if fallback_paths:
        for p in fallback_paths:
            if os.path.exists(p):
                return p

    # Last-resort: search recursively for any best.pt under runs_dir
    for root, _, files in os.walk(runs_dir):
        if 'best.pt' in files:
            return os.path.join(root, 'best.pt')

    return None

# Try to find the newest model automatically
MODEL_PATH = find_latest_model(runs_dir='runs/detect', fallback_paths=[
    'runs/detect/emergency_vehicle_detection_latest/weights/best.pt',
    
])

if MODEL_PATH is None:
    raise RuntimeError('No trained model found under runs/detect/*/weights/best.pt')

print(f"📦 Loading custom trained model from: {MODEL_PATH}")
model = YOLO(MODEL_PATH)
model.to(DEVICE)
print("✅ Custom model loaded successfully!")
print(f"📊 Model classes: {list(model.names.values())}")
# This model is trained to detect:
# - Ambulance (toy cars)
# - Fire Truck (toy cars)
# - Police Car (toy cars)
# - Normal Car (toy cars)

# Initialize lane detector (will be configured based on camera feed)
lane_detector = None

# IMAGE PREPROCESSING FUNCTIONS FOR BETTER VEHICLE DETECTION
def preprocess_image(img):
    """
    Enhance image quality for better emergency vehicle detection
    - Increases contrast for better feature visibility
    - Reduces noise
    - Sharpens edges
    """
    # 1. Increase contrast using CLAHE (Contrast Limited Adaptive Histogram Equalization)
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    enhanced = cv2.merge([l, a, b])
    enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)
    
    # 2. Denoise (reduce camera noise)
    denoised = cv2.fastNlMeansDenoisingColored(enhanced, None, 10, 10, 7, 21)
    
    # 3. Sharpen edges for better detection
    kernel = np.array([[-1, -1, -1],
                       [-1,  9, -1],
                       [-1, -1, -1]])
    sharpened = cv2.filter2D(denoised, -1, kernel)
    
    return sharpened

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

# Emergency Vehicle classes from custom trained model
# The model.names will be: {0: 'ambulance', 1: 'fire_truck', 2: 'normal_car', 3: 'police_car'}
# We'll get these dynamically from the model instead of hardcoding

# Global variables for tracking
detection_data = {
    'total_vehicles': 0,
    'vehicles_by_type': {},  # Will be populated dynamically from model classes
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
        'message': 'YOLOv11 AI Detection Server',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': {
            'health': '/health',
            'detect_image': '/detect (POST)',
            'detect_stream': '/detect/stream/<camera_id> (GET)',
            'analytics': '/analytics/<intersection_id> (GET)'
        },
        'model': 'YOLOv11n',
        'timestamp': datetime.now().isoformat()
    })

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
        print("📸 Received detection request")
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
        
        # STEP 1: Skip preprocessing - use raw image like Roboflow
        # Preprocessing can sometimes hurt detection if it changes the image too much
        print("⚡ Using raw image (no preprocessing)")
        
        # STEP 2: Run inference with Roboflow-matching parameters
        print(f"🤖 Running YOLO inference on {DEVICE.upper()}...")
        results = model(
            img,                   # Use raw image like Roboflow
            imgsz=640,             # Match training image size (640x640)
            conf=0.50,             # Higher confidence threshold (50%) for cleaner results
            iou=0.45,              # Standard IoU for better NMS (merges overlapping boxes)
            max_det=300,           # Max detections allowed
            agnostic_nms=False,    
            augment=False,         # DISABLE TTA to prevent duplicate detections
            half=(DEVICE == 'cuda'),  # Enable FP16 for GPU, disable for CPU
            verbose=False,
            device=DEVICE,         # Auto-detected (GPU or CPU)
        )
        
        # Process results
        detections = []
        
        # Get class names from YOLO model (COCO dataset has 80 classes)
        class_names = model.names
        
        # DEBUG: Show raw detections BEFORE filtering
        print(f"🔍 Raw detections from model:")
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
                print(f"   └─ [{i+1}] {vehicle_type}: {confidence:.2%} at [{x1:.0f}, {y1:.0f}, {x2:.0f}, {y2:.0f}]")
        
        # Frontend expects specific vehicle categories
        # Map custom model classes to frontend categories
        # Custom model classes: ambulance, fire_truck, police_car, normal_car
        vehicle_counts = {
            'car': 0,           # Will count all toy cars (normal_car, ambulance, police_car, fire_truck)
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
        
        for result in results:
            boxes = result.boxes
            for box in boxes:
                cls_id = int(box.cls[0])
                
                # Get vehicle type from model's class names
                vehicle_type = class_names.get(cls_id, f'unknown_{cls_id}')
                
                # FILTER 1: Process all detections from custom model (all are toy cars)
                # Custom model classes: ambulance, fire_truck, police_car, normal_car
                if vehicle_type not in class_names.values():
                    continue  # Skip unknown detections
                
                # Keep original class name for accurate labeling
                # But also count all as 'car' for frontend statistics
                mapped_vehicle_type = 'car'  # For statistics (all toy cars count as 'car')
                
                # Get bounding box coordinates
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                confidence = float(box.conf[0])
                
                # Estimate orientation based on bbox geometry
                orientation = estimate_orientation([x1, y1, x2, y2], img.shape)
                
                # FILTER 2: Accept all orientations for maximum detection coverage
                # Show all detected vehicles regardless of orientation
                # This matches Roboflow's behavior (no orientation filtering)
                
                # Increment counts for all detected vehicles (use mapped type)
                vehicle_counts[mapped_vehicle_type] += 1
                orientation_counts[orientation] += 1
                
                # Calculate additional bbox info
                width = x2 - x1
                height = y2 - y1
                center_x = (x1 + x2) / 2
                center_y = (y1 + y2) / 2
                area = width * height
                
                detections.append({
                    'class': vehicle_type,  # Use ORIGINAL class name for accurate labeling!
                    'confidence': confidence,
                    'orientation': orientation,  # NEW: estimated orientation
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
        
        # STEP 3: Lane detection and assignment
        global lane_detector
        lane_assignments = {}
        lane_statistics = {}
        
        # Initialize lane detector if not already done
        if lane_detector is None:
            lane_detector = LaneDetector(
                frame_width=img.shape[1], 
                frame_height=img.shape[0], 
                num_lanes=4
            )
        
        # Assign vehicles to lanes
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
        print(f"   Lane assignments: {[len(v) for v in lane_assignments.values()]}")
        
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
            'preprocessing_applied': False,  # Disabled - using raw image like Roboflow
            'detection_params': {
                'image_size': 640,             # Matches training config
                'confidence_threshold': 0.50,  # Higher threshold (50%) for cleaner results
                'iou_threshold': 0.45,         # Standard NMS threshold (merges duplicates)
                'max_detections': 300,         # Max detections allowed
                'augment': False,              # TTA disabled to prevent duplicates
                'half_precision': (DEVICE == 'cuda'),  # FP16 on GPU only
                'mode': 'roboflow_matching'
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
            # In production, get frame from actual camera
            # For now, we'll wait for frames from the bridge
            if camera_id in camera_streams:
                frame = camera_streams[camera_id]
                
                # Use raw frame like Roboflow (no preprocessing)
                # Run inference with Roboflow-matching parameters
                results = model(
                    frame,
                    imgsz=640,       # Match training image size
                    conf=0.50,       # Higher confidence threshold (50%) for cleaner results
                    iou=0.45,        # Standard NMS threshold (merges duplicates)
                    max_det=300,     # Max detections allowed
                    agnostic_nms=False,
                    augment=False,   # Disable TTA to prevent duplicates
                    half=(DEVICE == 'cuda'),
                    verbose=False,
                    device=DEVICE  # Use GPU!
                )
                
                # Process and send results
                detections = []
                
                # Get class names from custom model dynamically
                class_names = model.names
                vehicle_counts = {name: 0 for name in class_names.values()}
                
                for result in results:
                    boxes = result.boxes
                    for box in boxes:
                        cls_id = int(box.cls[0])
                        vehicle_type = class_names.get(cls_id, f'unknown_{cls_id}')
                        vehicle_counts[vehicle_type] = vehicle_counts.get(vehicle_type, 0) + 1
                        
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

@app.route('/lanes/configure', methods=['POST'])
def configure_lanes():
    """
    Configure lane boundaries for the camera
    Expects JSON: {
        "num_lanes": 4,
        "boundaries": [0, 320, 640, 960, 1280],  // optional custom boundaries
        "labels": ["North", "South", "East", "West"]  // optional lane labels
    }
    """
    global lane_detector
    
    try:
        data = request.get_json()
        num_lanes = data.get('num_lanes', 4)
        boundaries = data.get('boundaries')
        
        # Create new lane detector
        lane_detector = LaneDetector(
            frame_width=data.get('frame_width', 1280),
            frame_height=data.get('frame_height', 720),
            num_lanes=num_lanes
        )
        
        # Set custom boundaries if provided
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
    print("🤖 YOLOv11 AI Server Starting...")
    print("="*80)
    print("📊 Model: Custom Trained (Emergency Vehicle Detection - Toy Cars)")
    print("🌐 Server: http://localhost:5000")
    print("🛣️  Lane Detection: Enabled")
    print(f"🎮 Device: {DEVICE.upper()}")
    if torch.cuda.is_available():
        print(f"   └─ GPU: {torch.cuda.get_device_name(0)}")
        print(f"   └─ Memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")
    print(f"⚡ Performance Mode: {'GPU Inference (FP16)' if DEVICE == 'cuda' else 'CPU Inference'}")
    print(f"🎯 Classes: {', '.join(model.names.values())}")
    print("="*80 + "\n")
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True, use_reloader=True)

