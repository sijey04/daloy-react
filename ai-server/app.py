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
model = YOLO('yolo11n.pt')  # Nano model (fastest)
# model = YOLO('yolo11s.pt')  # Small model (balanced)
# model = YOLO('yolo11m.pt')  # Medium model (accurate)

# IMAGE PREPROCESSING FUNCTIONS FOR BETTER TOY CAR DETECTION
def preprocess_image(img):
    """
    Enhance image quality for better toy car detection
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
    Estimate car orientation based on bounding box geometry
    Returns: orientation string (front, back, left, right)
    """
    x1, y1, x2, y2 = bbox_coords
    width = x2 - x1
    height = y2 - y1
    aspect_ratio = width / height if height > 0 else 1.0
    
    # Simple heuristic based on aspect ratio
    # Side views tend to be wider, front/back views more square
    if aspect_ratio > 1.4:  # Wide car (side view)
        # Determine if left or right based on position
        center_x = (x1 + x2) / 2
        img_center_x = img_shape[1] / 2
        return 'left' if center_x < img_center_x else 'right'
    else:  # Front/back view (more square)
        # Determine if front or back based on vertical position
        center_y = (y1 + y2) / 2
        img_center_y = img_shape[0] / 2
        return 'front' if center_y < img_center_y else 'back'

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
        
        # STEP 1: Preprocess image for better detection
        print("🔧 Preprocessing image...")
        img_processed = preprocess_image(img)
        
        # STEP 2: Run inference with OPTIMIZED parameters for toy cars
        print("🤖 Running YOLO inference with optimized parameters...")
        results = model(
            img_processed, 
            conf=0.3,              # Balanced confidence threshold (30%)
            iou=0.4,               # Lower IoU threshold for better separation
            max_det=20,            # Limit max detections to reduce false positives
            agnostic_nms=True,     # Class-agnostic Non-Maximum Suppression
            augment=True,          # Test-time augmentation for better accuracy
            half=False,            # Use FP32 for better precision
            verbose=False
        )
        
        # Process results
        detections = []
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
                    
                    # Estimate orientation based on bbox geometry
                    orientation = estimate_orientation([x1, y1, x2, y2], img.shape)
                    orientation_counts[orientation] += 1
                    
                    # Calculate additional bbox info
                    width = x2 - x1
                    height = y2 - y1
                    center_x = (x1 + x2) / 2
                    center_y = (y1 + y2) / 2
                    area = width * height
                    
                    detections.append({
                        'class': vehicle_type,
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
            'orientation_counts': orientation_counts,  # NEW: orientation statistics
            'detections': detections,
            'image_size': {
                'width': img.shape[1],
                'height': img.shape[0]
            },
            'preprocessing_applied': True,  # NEW: indicate preprocessing was used
            'detection_params': {  # NEW: show detection parameters
                'confidence_threshold': 0.3,
                'iou_threshold': 0.4,
                'augment': True
            }
        }
        
        return jsonify(response)
    
    except Exception as e:
        print(f"❌ Detection error: {str(e)}")
        import traceback
        traceback.print_exc()
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
                
                # Preprocess frame
                frame_processed = preprocess_image(frame)
                
                # Run inference with optimized parameters
                results = model(
                    frame_processed,
                    conf=0.3,
                    iou=0.4,
                    agnostic_nms=True,
                    augment=True,
                    verbose=False
                )
                
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

