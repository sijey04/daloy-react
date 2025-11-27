"""
Collect More Data and Retrain
The BEST way to improve accuracy is to collect more training images
"""

import os

def collect_more_data_guide():
    """
    Guide for collecting additional training data
    """
    
    print("\n" + "="*80)
    print("📸 COLLECT MORE DATA FOR BETTER ACCURACY")
    print("="*80)
    
    print("\n🎯 Why More Data Improves Accuracy:")
    print("   • Current dataset: 1,296 training images")
    print("   • Recommended: 2,000-5,000 images per class")
    print("   • More diverse data = better generalization")
    
    print("\n📊 What to Collect:")
    print("   1. Different lighting conditions (day/night/shadows)")
    print("   2. Different angles and distances")
    print("   3. Different backgrounds")
    print("   4. Partial occlusions (cars partially hidden)")
    print("   5. Multiple vehicles in same frame")
    print("   6. Edge cases (blurry, far away, etc.)")
    
    print("\n🔄 Steps to Collect More Data:")
    print("   1. Run: python collect_dataset.py")
    print("   2. Choose vehicle type (fire_truck, police_car, ambulance, normal_vehicle)")
    print("   3. Capture 500-1000 MORE images per type")
    print("   4. Upload to Roboflow and label them")
    print("   5. Export and merge with existing dataset")
    print("   6. Retrain with combined dataset")
    
    print("\n💡 Quick Tips:")
    print("   • Focus on vehicle types with lower accuracy")
    print("   • Capture different toy car models if available")
    print("   • Vary camera position and zoom level")
    print("   • Include challenging scenarios (overlapping cars)")
    
    print("\n📁 Current Dataset Info:")
    data_yaml = 'datasets/emergency_vehicles/data.yaml'
    if os.path.exists(data_yaml):
        with open(data_yaml, 'r') as f:
            print(f.read())
    
    print("\n" + "="*80)

if __name__ == '__main__':
    collect_more_data_guide()
    
    print("\nWould you like to:")
    print("1. Collect more images now (run collect_dataset.py)")
    print("2. Retrain with existing data (run continue_training.py)")
    print("3. Exit")
    
    choice = input("\nYour choice (1/2/3): ").strip()
    
    if choice == '1':
        print("\n🎬 Starting data collection...")
        os.system('python collect_dataset.py')
    elif choice == '2':
        print("\n🔄 Starting fine-tuning...")
        os.system('python continue_training.py')
    else:
        print("\n👋 Goodbye!")
