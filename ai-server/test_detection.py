from ultralytics import YOLO
import cv2
import sys

print("=" * 80)
print("Testing YOLO11n Detection on Real Vehicle Images")
print("=" * 80)

# Load model
print("\n1. Loading YOLO11n model...")
model = YOLO('yolo11n.pt')
model.to('cpu')
print("✅ Model loaded successfully!")
print(f"📊 Model has {len(model.names)} classes")
print(f"🎯 Sample classes: {list(model.names.values())[:10]}")

# Load test image
print("\n2. Loading test image...")
img_path = '../public/images/east.jfif'
img = cv2.imread(img_path)

if img is None:
    print(f"❌ Failed to load image from {img_path}")
    sys.exit(1)

print(f"✅ Image loaded: {img.shape[1]}x{img.shape[0]} pixels")

# Run detection
print("\n3. Running detection with conf=0.25...")
results = model(
    img,
    conf=0.25,
    iou=0.45,
    max_det=50,
    half=False,
    device='cpu',
    verbose=False
)

# Process results
print(f"\n4. Detection Results:")
print(f"   Total detections: {len(results[0].boxes)}")

if len(results[0].boxes) == 0:
    print("   ⚠️ No vehicles detected!")
    print("\n5. Trying with lower confidence (0.1)...")
    results = model(img, conf=0.1, device='cpu', verbose=False)
    print(f"   Detections at 0.1 conf: {len(results[0].boxes)}")

print("\n6. Detailed Detections:")
for i, box in enumerate(results[0].boxes):
    cls_id = int(box.cls[0])
    class_name = model.names[cls_id]
    confidence = float(box.conf[0])
    x1, y1, x2, y2 = box.xyxy[0].tolist()
    
    print(f"   Detection #{i+1}:")
    print(f"      Class: {class_name}")
    print(f"      Confidence: {confidence:.2%}")
    print(f"      BBox: ({x1:.0f}, {y1:.0f}) to ({x2:.0f}, {y2:.0f})")

print("\n" + "=" * 80)
