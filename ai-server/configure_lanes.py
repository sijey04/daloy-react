"""
Interactive Lane Configuration Tool
Allows you to visually define lane boundaries on your camera feed
"""

import cv2
import requests
import numpy as np
from typing import List, Tuple

class LaneConfigurator:
    """
    Interactive tool to configure lane boundaries
    """
    
    def __init__(self, camera_url: str = None, test_image: str = None):
        """
        Initialize configurator
        
        Args:
            camera_url: URL to camera stream/image
            test_image: Path to test image file
        """
        self.camera_url = camera_url
        self.test_image = test_image
        self.frame = None
        self.boundaries = []
        self.num_lanes = 4
        self.drawing = False
        
    def load_image(self):
        """Load image from camera or file"""
        if self.test_image:
            self.frame = cv2.imread(self.test_image)
        elif self.camera_url:
            # Fetch from camera
            response = requests.get(self.camera_url)
            nparr = np.frombuffer(response.content, np.uint8)
            self.frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        else:
            # Use webcam
            cap = cv2.VideoCapture(0)
            ret, self.frame = cap.read()
            cap.release()
        
        if self.frame is None:
            raise ValueError("Could not load image")
        
        return self.frame
    
    def mouse_callback(self, event, x, y, flags, param):
        """Handle mouse events for drawing boundaries"""
        if event == cv2.EVENT_LBUTTONDOWN:
            # Add boundary line
            if x not in self.boundaries:
                self.boundaries.append(x)
                self.boundaries.sort()
                print(f"Added boundary at x={x}")
                print(f"Current boundaries: {self.boundaries}")
    
    def run_interactive(self):
        """
        Run interactive configuration
        Click to place lane boundaries, press keys for actions
        """
        print("\n🛣️  LANE CONFIGURATION TOOL")
        print("=" * 60)
        print("Instructions:")
        print("  - Click on the image to add vertical lane boundaries")
        print("  - Press 'r' to reset all boundaries")
        print("  - Press 'd' to delete last boundary")
        print("  - Press 's' to save configuration")
        print("  - Press 'q' to quit")
        print("=" * 60 + "\n")
        
        # Load image
        self.load_image()
        h, w = self.frame.shape[:2]
        
        # Initialize with edges
        self.boundaries = [0, w]
        
        # Create window
        cv2.namedWindow('Lane Configuration')
        cv2.setMouseCallback('Lane Configuration', self.mouse_callback)
        
        while True:
            # Create display frame
            display = self.frame.copy()
            
            # Draw existing boundaries
            for boundary in self.boundaries:
                if boundary > 0 and boundary < w:
                    cv2.line(display, (boundary, 0), (boundary, h), 
                            (0, 255, 255), 2)
            
            # Draw lane labels
            if len(self.boundaries) > 1:
                for i in range(len(self.boundaries) - 1):
                    x1 = self.boundaries[i]
                    x2 = self.boundaries[i + 1]
                    center_x = (x1 + x2) // 2
                    
                    # Draw lane number
                    label = f"Lane {i + 1}"
                    text_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.8, 2)[0]
                    
                    # Background rectangle
                    cv2.rectangle(display,
                                (center_x - text_size[0]//2 - 5, 20),
                                (center_x + text_size[0]//2 + 5, 50),
                                (0, 0, 0), -1)
                    
                    # Text
                    cv2.putText(display, label,
                              (center_x - text_size[0]//2, 45),
                              cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
            
            # Draw instructions
            cv2.putText(display, "Click to add boundaries | R:Reset D:Delete S:Save Q:Quit",
                       (10, h - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            
            # Show frame
            cv2.imshow('Lane Configuration', display)
            
            # Handle keyboard
            key = cv2.waitKey(1) & 0xFF
            
            if key == ord('q'):
                break
            elif key == ord('r'):
                # Reset boundaries
                self.boundaries = [0, w]
                print("Reset boundaries")
            elif key == ord('d'):
                # Delete last boundary (except edges)
                if len(self.boundaries) > 2:
                    deleted = self.boundaries.pop(-2)
                    print(f"Deleted boundary at x={deleted}")
            elif key == ord('s'):
                # Save configuration
                self.save_configuration()
        
        cv2.destroyAllWindows()
    
    def save_configuration(self):
        """Save configuration to AI server"""
        if len(self.boundaries) < 2:
            print("❌ Need at least 2 boundaries!")
            return
        
        num_lanes = len(self.boundaries) - 1
        h, w = self.frame.shape[:2]
        
        config = {
            'num_lanes': num_lanes,
            'boundaries': self.boundaries,
            'frame_width': w,
            'frame_height': h
        }
        
        print(f"\n✅ Configuration:")
        print(f"   Number of lanes: {num_lanes}")
        print(f"   Boundaries: {self.boundaries}")
        print(f"   Frame size: {w}x{h}")
        
        try:
            # Send to AI server
            response = requests.post(
                'http://localhost:5000/lanes/configure',
                json=config
            )
            
            if response.status_code == 200:
                print("\n✅ Configuration saved to AI server!")
                print(response.json())
            else:
                print(f"\n❌ Error saving configuration: {response.text}")
        
        except Exception as e:
            print(f"\n❌ Could not connect to AI server: {e}")
            print("   Make sure the AI server is running on http://localhost:5000")
    
    def auto_divide_equal_lanes(self, num_lanes: int = 4):
        """
        Automatically divide frame into equal lanes
        
        Args:
            num_lanes: Number of lanes to create
        """
        if self.frame is None:
            self.load_image()
        
        w = self.frame.shape[1]
        lane_width = w // num_lanes
        
        self.boundaries = [lane_width * i for i in range(num_lanes + 1)]
        print(f"Created {num_lanes} equal lanes: {self.boundaries}")


def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Configure lane boundaries for traffic detection')
    parser.add_argument('--image', type=str, help='Path to test image')
    parser.add_argument('--camera', type=str, help='Camera URL')
    parser.add_argument('--auto', type=int, help='Auto-divide into N equal lanes')
    
    args = parser.parse_args()
    
    # Create configurator
    configurator = LaneConfigurator(
        camera_url=args.camera,
        test_image=args.image
    )
    
    if args.auto:
        # Auto-divide into equal lanes
        configurator.load_image()
        configurator.auto_divide_equal_lanes(args.auto)
        configurator.save_configuration()
    else:
        # Interactive mode
        configurator.run_interactive()


if __name__ == "__main__":
    main()
