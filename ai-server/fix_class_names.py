"""
Fix Model Class Names - Swap ambulance and fire_truck
This swaps the model's internal class mapping to fix the reversed labels
"""

from ultralytics import YOLO
import sys
sys.path.insert(0, 'D:\\Python_Packages')

# Load the model
model = YOLO('runs/detect/emergency_vehicle_detection/weights/best.pt')

print("Current class names:", model.names)

# Swap ambulance (0) and fire_truck (1)
model.names[0] = 'fire_truck'
model.names[1] = 'ambulance'

print("Fixed class names:", model.names)

# Save the model with corrected names
model.save('runs/detect/emergency_vehicle_detection/weights/best_fixed.pt')

print("\n✅ Model saved with corrected class names!")
print("   Location: runs/detect/emergency_vehicle_detection/weights/best_fixed.pt")
print("\nNext step: Update app.py to use 'best_fixed.pt' instead of 'best.pt'")
