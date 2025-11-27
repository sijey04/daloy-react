"""
Dataset Collection Tool for Emergency Vehicle Detection
Captures images from camera to build training dataset
"""

import cv2
import os
from datetime import datetime
import argparse

def collect_vehicle_images(output_dir='datasets/emergency_vehicles/images', vehicle_type=None):
    """
    Capture images of different vehicle types
    
    Args:
        output_dir: Directory to save captured images
        vehicle_type: Type of vehicle (fire_truck/police_car/ambulance/normal_vehicle)
    """
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Open camera (0 = default camera, change if you have multiple cameras)
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("❌ Error: Could not open camera")
        return
    
    # Get vehicle type if not provided
    if vehicle_type is None:
        print("\n🚨 Available vehicle types:")
        print("  1. fire_truck      - Fire truck / Fire engine")
        print("  2. police_car      - Police vehicle / Police car")
        print("  3. ambulance       - Ambulance / Medical emergency vehicle")
        print("  4. normal_vehicle  - Regular car / Normal vehicle")
        vehicle_type = input("\n📸 Enter vehicle type: ").strip().lower().replace(' ', '_')
    
    # Validate vehicle type
    valid_types = ['fire_truck', 'police_car', 'ambulance', 'normal_vehicle']
    if vehicle_type not in valid_types:
        print(f"❌ Invalid vehicle type. Must be one of: {', '.join(valid_types)}")
        return
    
    # Create vehicle-type-specific subdirectory
    vehicle_dir = os.path.join(output_dir, vehicle_type)
    os.makedirs(vehicle_dir, exist_ok=True)
    
    count = 0
    print(f"\n✅ Camera opened successfully!")
    print(f"📁 Saving to: {vehicle_dir}")
    print(f"🎯 Capturing vehicle type: {vehicle_type}")
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
        cv2.putText(display_frame, f"Vehicle: {vehicle_type.upper()}", (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.putText(display_frame, f"Images captured: {count}", (10, 70),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.putText(display_frame, "SPACE=Capture  Q=Quit", (10, display_frame.shape[0] - 20),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        # Add crosshair to center for alignment
        h, w = display_frame.shape[:2]
        cv2.line(display_frame, (w//2 - 30, h//2), (w//2 + 30, h//2), (0, 255, 255), 2)
        cv2.line(display_frame, (w//2, h//2 - 30), (w//2, h//2 + 30), (0, 255, 255), 2)
        
        cv2.imshow('Emergency Vehicle Data Collection', display_frame)
        
        key = cv2.waitKey(1) & 0xFF
        
        if key == ord(' '):  # Space to capture
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"{vehicle_type}_{count:04d}_{timestamp}.jpg"
            filepath = os.path.join(vehicle_dir, filename)
            
            # Save original frame (without overlay)
            cv2.imwrite(filepath, frame)
            print(f"📸 Captured: {filename}")
            count += 1
            
        elif key == ord('s'):  # Show statistics
            print(f"\n📊 Statistics:")
            print(f"   Vehicle Type: {vehicle_type}")
            print(f"   Images captured: {count}")
            print(f"   Save directory: {vehicle_dir}\n")
            
        elif key == ord('q'):  # Quit
            break
    
    # Cleanup
    cap.release()
    cv2.destroyAllWindows()
    
    print(f"\n✅ Collection complete!")
    print(f"   Total images captured: {count}")
    print(f"   Saved to: {vehicle_dir}")
    print(f"\n💡 Recommendation: Capture at least 100-200 images per vehicle type")
    print(f"   Current progress: {count}/200 for '{vehicle_type}'")


def show_dataset_summary(dataset_dir='datasets/emergency_vehicles/images'):
    """
    Show summary of collected dataset
    """
    print("\n" + "="*60)
    print("DATASET SUMMARY")
    print("="*60)
    
    if not os.path.exists(dataset_dir):
        print(f"❌ Dataset directory not found: {dataset_dir}")
        return
    
    vehicle_types = ['fire_truck', 'police_car', 'ambulance', 'normal_vehicle']
    total_images = 0
    
    for vehicle_type in vehicle_types:
        vehicle_dir = os.path.join(dataset_dir, vehicle_type)
        if os.path.exists(vehicle_dir):
            image_files = [f for f in os.listdir(vehicle_dir) if f.endswith(('.jpg', '.jpeg', '.png'))]
            count = len(image_files)
            total_images += count
            status = "✅" if count >= 100 else "⚠️"
            print(f"{status} {vehicle_type:16s}: {count:4d} images (Recommended: 100-200)")
        else:
            print(f"❌ {vehicle_type:16s}:    0 images (Directory not created)")
    
    print("="*60)
    print(f"Total images: {total_images}")
    print(f"Ready for training: {'YES ✅' if total_images >= 400 else 'NO ⚠️ (Need at least 400)'}")
    print("="*60 + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Collect emergency vehicle images for training')
    parser.add_argument('--type', type=str, choices=['fire_truck', 'police_car', 'ambulance', 'normal_vehicle'],
                       help='Type of vehicle to collect')
    parser.add_argument('--output', type=str, default='datasets/emergency_vehicles/images',
                       help='Output directory for images')
    parser.add_argument('--summary', action='store_true',
                       help='Show dataset summary instead of collecting')
    
    args = parser.parse_args()
    
    if args.summary:
        show_dataset_summary(args.output)
    else:
        print("\n� EMERGENCY VEHICLE DATASET COLLECTION TOOL 📸")
        print("="*60)
        collect_vehicle_images(args.output, args.type)
        print("\n💡 Run with --summary to see collection progress")
