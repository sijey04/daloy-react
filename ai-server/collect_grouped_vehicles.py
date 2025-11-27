"""
Collect Grouped Vehicle Images
Specifically designed to capture multiple vehicles in one frame
This will improve model accuracy when detecting vehicles close together
"""

import cv2
import os
from datetime import datetime
import argparse

def collect_grouped_images(output_dir='datasets/emergency_vehicles/grouped_images'):
    """
    Capture images with MULTIPLE vehicles in one frame
    This training data will teach the model to handle grouped/close vehicles
    """
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Try multiple camera backends (Windows compatibility fix)
    print("🎥 Attempting to open camera...")
    cap = None
    
    # Try DirectShow backend first (most compatible on Windows)
    try:
        cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
        if cap.isOpened():
            print("✅ Camera opened using DirectShow backend")
        else:
            cap = None
    except:
        cap = None
    
    # Try default backend if DirectShow failed
    if cap is None:
        try:
            cap = cv2.VideoCapture(0)
            if cap.isOpened():
                print("✅ Camera opened using default backend")
            else:
                cap = None
        except:
            cap = None
    
    # Try Media Foundation with specific settings
    if cap is None:
        try:
            cap = cv2.VideoCapture(0, cv2.CAP_MSMF)
            if cap.isOpened():
                cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
                cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
                print("✅ Camera opened using Media Foundation")
            else:
                cap = None
        except:
            cap = None
    
    if cap is None or not cap.isOpened():
        print("\n❌ Error: Could not open camera with any backend")
        print("\n🔧 SOLUTIONS:")
        print("1. Use your phone camera instead (RECOMMENDED - better quality)")
        print("   - Take 100-200 photos with your phone")
        print("   - Transfer to: datasets/emergency_vehicles/grouped_images/")
        print("   - See COLLECT_WITH_PHONE.md for detailed instructions")
        print("\n2. Check camera permissions in Windows Settings")
        print("   - Settings → Privacy → Camera → Allow apps to access camera")
        print("\n3. Try DroidCam to use phone as webcam:")
        print("   - Download: https://www.dev47apps.com/droidcam/windows/")
        return
    
    count = 0
    print("\n" + "="*70)
    print("📸 GROUPED VEHICLE IMAGE COLLECTION")
    print("="*70)
    print("\n🎯 PURPOSE:")
    print("   Capture images with 2-4 vehicles TOGETHER in one frame")
    print("   This will train the model to handle vehicles close together")
    print("\n📋 WHAT TO CAPTURE:")
    print("   ✅ All 4 cars lined up side by side")
    print("   ✅ 2-3 cars close together")
    print("   ✅ Cars at different angles (front, back, side)")
    print("   ✅ Cars with small gaps between them")
    print("   ✅ Different lighting conditions")
    print("\n❌ AVOID:")
    print("   • Single vehicles (you already have those)")
    print("   • Cars too far apart (need them CLOSE)")
    print("\n" + "="*70)
    print("CONTROLS:")
    print("  SPACE - Capture image (only when you have 2+ cars together!)")
    print("  Q     - Quit")
    print("  S     - Show progress")
    print("="*70)
    print(f"\n🎯 TARGET: Collect at least 200 images with grouped vehicles")
    print("   This will significantly improve grouped detection accuracy\n")
    
    while True:
        ret, frame = cap.read()
        
        if not ret:
            print("❌ Error: Failed to read frame")
            break
        
        # Display frame with instructions
        display_frame = frame.copy()
        h, w = display_frame.shape[:2]
        
        # Add overlay
        cv2.putText(display_frame, "GROUPED VEHICLES MODE", (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
        cv2.putText(display_frame, f"Images: {count}/200", (10, 70),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
        cv2.putText(display_frame, "Place 2-4 cars TOGETHER in frame", (10, h - 60),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)
        cv2.putText(display_frame, "SPACE=Capture  Q=Quit", (10, h - 20),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        # Add frame guide (show where to place vehicles)
        # Draw rectangles showing good placement zones
        cv2.rectangle(display_frame, (w//4, h//4), (3*w//4, 3*h//4), (0, 255, 0), 2)
        cv2.putText(display_frame, "Place cars here", (w//4 + 10, h//4 + 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        
        cv2.imshow('Grouped Vehicle Collection', display_frame)
        
        key = cv2.waitKey(1) & 0xFF
        
        if key == ord(' '):  # Capture
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"grouped_{count:04d}_{timestamp}.jpg"
            filepath = os.path.join(output_dir, filename)
            
            cv2.imwrite(filepath, frame)
            print(f"📸 [{count+1}/200] Captured: {filename}")
            count += 1
            
            # Progress milestones
            if count == 50:
                print("\n🎉 25% Complete! Keep going...")
            elif count == 100:
                print("\n🎉 50% Complete! Halfway there...")
            elif count == 150:
                print("\n🎉 75% Complete! Almost done...")
            elif count == 200:
                print("\n🎊 TARGET REACHED! 200 images collected!")
                print("   You can stop now or continue for even better accuracy\n")
            
        elif key == ord('s'):  # Show statistics
            print(f"\n📊 Collection Progress:")
            print(f"   Images collected: {count}")
            print(f"   Target: 200 images")
            print(f"   Progress: {count/200*100:.1f}%")
            print(f"   Save location: {output_dir}\n")
            
        elif key == ord('q'):  # Quit
            break
    
    cap.release()
    cv2.destroyAllWindows()
    
    print("\n" + "="*70)
    print("✅ COLLECTION COMPLETE!")
    print("="*70)
    print(f"Total images collected: {count}")
    print(f"Saved to: {output_dir}")
    
    if count >= 200:
        print("\n🎉 EXCELLENT! You have enough images for good improvement")
    elif count >= 100:
        print("\n✅ GOOD! You have a decent amount, but more is better")
    else:
        print("\n⚠️  WARNING: Less than 100 images may not be enough")
        print("   Recommended: Collect at least 100-200 grouped images")
    
    print("\n" + "="*70)
    print("📋 NEXT STEPS:")
    print("="*70)
    print("1. Upload these images to Roboflow")
    print("2. Label ALL vehicles in each image (draw boxes around each car)")
    print("3. Make sure each vehicle has the correct class label:")
    print("   - ambulance")
    print("   - fire_truck")
    print("   - normal_car")
    print("   - police_car")
    print("4. Add these labeled images to your existing dataset")
    print("5. Re-export and retrain the model")
    print("\n💡 TIP: Pay extra attention to bounding box accuracy!")
    print("   Make boxes fit EXACTLY around each vehicle")
    print("="*70 + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Collect grouped vehicle images')
    parser.add_argument('--output', type=str, 
                       default='datasets/emergency_vehicles/grouped_images',
                       help='Output directory')
    
    args = parser.parse_args()
    
    print("\n🚗🚑🚒🚓 GROUPED VEHICLE IMAGE COLLECTION TOOL")
    collect_grouped_images(args.output)
