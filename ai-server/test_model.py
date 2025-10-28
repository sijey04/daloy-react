"""
Test Custom Model
Test the trained model on sample images
"""

from ultralytics import YOLO
import cv2
import os
from pathlib import Path

def test_model(model_path='runs/detect/toy_car_detection/weights/best.pt',
               test_dir='datasets/toy_cars/images/test',
               conf_threshold=0.3,
               save_dir='test_results'):
    """
    Test the custom model on test images
    
    Args:
        model_path: Path to trained model
        test_dir: Directory with test images
        conf_threshold: Confidence threshold
        save_dir: Directory to save results
    """
    
    print("\n" + "="*80)
    print("🧪 TESTING CUSTOM TOY CAR MODEL")
    print("="*80)
    
    # Check if model exists
    if not os.path.exists(model_path):
        print(f"❌ Model not found: {model_path}")
        print("   Train the model first using train_custom_model.py")
        return
    
    # Load model
    print(f"\n📥 Loading model: {model_path}")
    model = YOLO(model_path)
    
    # Create output directory
    os.makedirs(save_dir, exist_ok=True)
    
    # Get test images
    if os.path.exists(test_dir):
        image_files = list(Path(test_dir).rglob('*.jpg')) + \
                     list(Path(test_dir).rglob('*.jpeg')) + \
                     list(Path(test_dir).rglob('*.png'))
    else:
        print(f"⚠️  Test directory not found: {test_dir}")
        print("   Please specify image paths manually")
        return
    
    if not image_files:
        print(f"⚠️  No images found in {test_dir}")
        return
    
    print(f"\n📸 Found {len(image_files)} test images")
    print(f"💾 Results will be saved to: {save_dir}")
    print(f"🎯 Confidence threshold: {conf_threshold}")
    
    # Test on each image
    print("\n" + "="*80)
    print("TESTING RESULTS")
    print("="*80)
    
    class_names = ['toy_car_front', 'toy_car_back', 'toy_car_left', 'toy_car_right']
    total_detections = 0
    orientation_counts = {'front': 0, 'back': 0, 'left': 0, 'right': 0}
    
    for i, img_path in enumerate(image_files, 1):
        print(f"\n[{i}/{len(image_files)}] Testing: {img_path.name}")
        
        # Run inference
        results = model(
            str(img_path),
            conf=conf_threshold,
            iou=0.4,
            verbose=False
        )
        
        # Process results
        result = results[0]
        boxes = result.boxes
        
        if len(boxes) == 0:
            print(f"   ⚠️  No detections")
            continue
        
        print(f"   ✅ {len(boxes)} detection(s):")
        
        for box in boxes:
            cls_id = int(box.cls[0])
            confidence = float(box.conf[0])
            class_name = class_names[cls_id] if cls_id < len(class_names) else f"class_{cls_id}"
            orientation = class_name.split('_')[-1]
            
            orientation_counts[orientation] += 1
            total_detections += 1
            
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            print(f"      • {class_name}: {confidence:.2f} confidence")
            print(f"        BBox: [{x1:.0f}, {y1:.0f}, {x2:.0f}, {y2:.0f}]")
        
        # Save annotated image
        annotated = result.plot()
        save_path = os.path.join(save_dir, f"result_{img_path.name}")
        cv2.imwrite(save_path, annotated)
    
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    print(f"Total images tested: {len(image_files)}")
    print(f"Total detections: {total_detections}")
    print(f"Average detections per image: {total_detections/len(image_files):.2f}")
    print(f"\nOrientation breakdown:")
    for orientation, count in orientation_counts.items():
        print(f"  {orientation:8s}: {count:3d} ({count/total_detections*100:.1f}%)" if total_detections > 0 else f"  {orientation:8s}: 0")
    print(f"\nAnnotated images saved to: {save_dir}")
    print("="*80 + "\n")


def test_live_camera(model_path='runs/detect/toy_car_detection/weights/best.pt',
                    conf_threshold=0.3):
    """
    Test model on live camera feed
    """
    
    print("\n" + "="*80)
    print("📹 LIVE CAMERA TESTING")
    print("="*80)
    
    # Load model
    print(f"\n📥 Loading model: {model_path}")
    model = YOLO(model_path)
    
    # Open camera
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("❌ Error: Could not open camera")
        return
    
    print("\n✅ Camera opened successfully!")
    print("\nControls:")
    print("  Q - Quit")
    print("  S - Save screenshot")
    
    screenshot_count = 0
    
    while True:
        ret, frame = cap.read()
        
        if not ret:
            print("❌ Error: Failed to read frame")
            break
        
        # Run inference
        results = model(frame, conf=conf_threshold, verbose=False)
        
        # Get annotated frame
        annotated_frame = results[0].plot()
        
        # Display
        cv2.imshow('Toy Car Detection - Live', annotated_frame)
        
        key = cv2.waitKey(1) & 0xFF
        
        if key == ord('q'):
            break
        elif key == ord('s'):
            filename = f'screenshot_{screenshot_count:04d}.jpg'
            cv2.imwrite(filename, annotated_frame)
            print(f"📸 Saved: {filename}")
            screenshot_count += 1
    
    cap.release()
    cv2.destroyAllWindows()
    print("\n✅ Live testing complete")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Test custom toy car model')
    parser.add_argument('--model', type=str, 
                       default='runs/detect/toy_car_detection/weights/best.pt',
                       help='Path to trained model')
    parser.add_argument('--test-dir', type=str,
                       default='datasets/toy_cars/images/test',
                       help='Directory with test images')
    parser.add_argument('--conf', type=float, default=0.3,
                       help='Confidence threshold')
    parser.add_argument('--live', action='store_true',
                       help='Test on live camera instead of images')
    parser.add_argument('--save-dir', type=str, default='test_results',
                       help='Directory to save test results')
    
    args = parser.parse_args()
    
    if args.live:
        test_live_camera(args.model, args.conf)
    else:
        test_model(args.model, args.test_dir, args.conf, args.save_dir)
