"""
Dataset Collection Tool for Toy Car Detection
Captures images from camera to build training dataset
"""

import cv2
import os
from datetime import datetime
import argparse

def collect_toy_car_images(output_dir='datasets/toy_cars/images', angle=None):
    """
    Capture images of toy cars from different angles
    
    Args:
        output_dir: Directory to save captured images
        angle: Orientation label (front/back/left/right)
    """
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Open camera (0 = default camera, change if you have multiple cameras)
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("❌ Error: Could not open camera")
        return
    
    # Get angle if not provided
    if angle is None:
        print("\n🎯 Available angles:")
        print("  1. front  - Car facing camera (front view)")
        print("  2. back   - Car facing away (rear view)")
        print("  3. left   - Left side of car visible")
        print("  4. right  - Right side of car visible")
        angle = input("\n📸 Enter angle (front/back/left/right): ").strip().lower()
    
    # Validate angle
    valid_angles = ['front', 'back', 'left', 'right']
    if angle not in valid_angles:
        print(f"❌ Invalid angle. Must be one of: {', '.join(valid_angles)}")
        return
    
    # Create angle-specific subdirectory
    angle_dir = os.path.join(output_dir, angle)
    os.makedirs(angle_dir, exist_ok=True)
    
    count = 0
    print(f"\n✅ Camera opened successfully!")
    print(f"📁 Saving to: {angle_dir}")
    print(f"🎯 Capturing angle: {angle}")
    print("\n" + "="*60)
    print("CONTROLS:")
    print("  SPACE - Capture image")
    print("  Q     - Quit and exit")
    print("  S     - Show statistics")
    print("="*60 + "\n")
    
    while True:
        ret, frame = cap.read()
        
        if not ret:
            print("❌ Error: Failed to read frame from camera")
            break
        
        # Display frame with instructions overlay
        display_frame = frame.copy()
        
        # Add text overlay
        cv2.putText(display_frame, f"Angle: {angle.upper()}", (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.putText(display_frame, f"Images captured: {count}", (10, 70),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.putText(display_frame, "SPACE=Capture  Q=Quit", (10, display_frame.shape[0] - 20),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        # Add crosshair to center for alignment
        h, w = display_frame.shape[:2]
        cv2.line(display_frame, (w//2 - 30, h//2), (w//2 + 30, h//2), (0, 255, 255), 2)
        cv2.line(display_frame, (w//2, h//2 - 30), (w//2, h//2 + 30), (0, 255, 255), 2)
        
        cv2.imshow('Toy Car Data Collection', display_frame)
        
        key = cv2.waitKey(1) & 0xFF
        
        if key == ord(' '):  # Space to capture
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"{angle}_{count:04d}_{timestamp}.jpg"
            filepath = os.path.join(angle_dir, filename)
            
            # Save original frame (without overlay)
            cv2.imwrite(filepath, frame)
            print(f"📸 Captured: {filename}")
            count += 1
            
        elif key == ord('s'):  # Show statistics
            print(f"\n📊 Statistics:")
            print(f"   Angle: {angle}")
            print(f"   Images captured: {count}")
            print(f"   Save directory: {angle_dir}\n")
            
        elif key == ord('q'):  # Quit
            break
    
    # Cleanup
    cap.release()
    cv2.destroyAllWindows()
    
    print(f"\n✅ Collection complete!")
    print(f"   Total images captured: {count}")
    print(f"   Saved to: {angle_dir}")
    print(f"\n💡 Recommendation: Capture at least 50-100 images per angle")
    print(f"   Current progress: {count}/100 for '{angle}' angle")


def show_dataset_summary(dataset_dir='datasets/toy_cars/images'):
    """
    Show summary of collected dataset
    """
    print("\n" + "="*60)
    print("DATASET SUMMARY")
    print("="*60)
    
    if not os.path.exists(dataset_dir):
        print(f"❌ Dataset directory not found: {dataset_dir}")
        return
    
    angles = ['front', 'back', 'left', 'right']
    total_images = 0
    
    for angle in angles:
        angle_dir = os.path.join(dataset_dir, angle)
        if os.path.exists(angle_dir):
            image_files = [f for f in os.listdir(angle_dir) if f.endswith(('.jpg', '.jpeg', '.png'))]
            count = len(image_files)
            total_images += count
            status = "✅" if count >= 50 else "⚠️"
            print(f"{status} {angle:8s}: {count:4d} images (Recommended: 50-100)")
        else:
            print(f"❌ {angle:8s}:    0 images (Directory not created)")
    
    print("="*60)
    print(f"Total images: {total_images}")
    print(f"Ready for training: {'YES ✅' if total_images >= 200 else 'NO ⚠️ (Need at least 200)'}")
    print("="*60 + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Collect toy car images for training')
    parser.add_argument('--angle', type=str, choices=['front', 'back', 'left', 'right'],
                       help='Car orientation angle')
    parser.add_argument('--output', type=str, default='datasets/toy_cars/images',
                       help='Output directory for images')
    parser.add_argument('--summary', action='store_true',
                       help='Show dataset summary instead of collecting')
    
    args = parser.parse_args()
    
    if args.summary:
        show_dataset_summary(args.output)
    else:
        print("\n🚗 TOY CAR DATASET COLLECTION TOOL 📸")
        print("="*60)
        collect_toy_car_images(args.output, args.angle)
        print("\n💡 Run with --summary to see collection progress")
