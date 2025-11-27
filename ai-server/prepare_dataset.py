"""
Dataset Preparation Tool
Splits collected images into train/val/test sets and creates YOLO format labels
"""

import os
import shutil
import random
from pathlib import Path
import yaml

def create_directory_structure(base_dir='datasets/emergency_vehicles'):
    """
    Create YOLO dataset directory structure
    """
    dirs = [
        f'{base_dir}/images/train',
        f'{base_dir}/images/val',
        f'{base_dir}/images/test',
        f'{base_dir}/labels/train',
        f'{base_dir}/labels/val',
        f'{base_dir}/labels/test',
    ]
    
    for d in dirs:
        os.makedirs(d, exist_ok=True)
        print(f"✅ Created: {d}")


def split_dataset(source_dir='datasets/emergency_vehicles/images', 
                  dest_dir='datasets/emergency_vehicles',
                  train_ratio=0.7, 
                  val_ratio=0.2, 
                  test_ratio=0.1):
    """
    Split images into train/val/test sets
    
    Args:
        source_dir: Source directory with vehicle type subdirectories
        dest_dir: Destination base directory
        train_ratio: Proportion for training (0.7 = 70%)
        val_ratio: Proportion for validation (0.2 = 20%)
        test_ratio: Proportion for testing (0.1 = 10%)
    """
    
    vehicle_types = ['fire_truck', 'police_car', 'ambulance', 'normal_vehicle']
    class_map = {
        'fire_truck': 0,
        'police_car': 1,
        'ambulance': 2,
        'normal_vehicle': 3
    }
    
    print("\n" + "="*60)
    print("SPLITTING DATASET")
    print("="*60)
    
    total_train = 0
    total_val = 0
    total_test = 0
    
    for vehicle_type in vehicle_types:
        vehicle_dir = os.path.join(source_dir, vehicle_type)
        
        if not os.path.exists(vehicle_dir):
            print(f"⚠️  {vehicle_type}: Directory not found, skipping")
            continue
        
        # Get all image files
        image_files = [f for f in os.listdir(vehicle_dir) 
                      if f.endswith(('.jpg', '.jpeg', '.png'))]
        
        if not image_files:
            print(f"⚠️  {vehicle_type}: No images found, skipping")
            continue
        
        # Shuffle for random split
        random.shuffle(image_files)
        
        # Calculate split indices
        total = len(image_files)
        train_end = int(total * train_ratio)
        val_end = train_end + int(total * val_ratio)
        
        train_files = image_files[:train_end]
        val_files = image_files[train_end:val_end]
        test_files = image_files[val_end:]
        
        # Copy files to respective directories
        class_id = class_map[vehicle_type]
        
        for split_name, split_files in [('train', train_files), 
                                         ('val', val_files), 
                                         ('test', test_files)]:
            for img_file in split_files:
                # Copy image
                src_img = os.path.join(vehicle_dir, img_file)
                dst_img = os.path.join(dest_dir, 'images', split_name, img_file)
                shutil.copy2(src_img, dst_img)
                
                # Create placeholder label file (you'll need to label these properly)
                # For now, create empty label files - you need to label them with bounding boxes
                label_file = os.path.splitext(img_file)[0] + '.txt'
                label_path = os.path.join(dest_dir, 'labels', split_name, label_file)
                
                # Note: This creates an empty label file
                # You MUST label these images with actual bounding boxes using labelImg or similar
                with open(label_path, 'w') as f:
                    # Empty file - needs manual labeling
                    # Format should be: class_id center_x center_y width height (normalized 0-1)
                    # Example: 0 0.5 0.5 0.3 0.2
                    pass
        
        total_train += len(train_files)
        total_val += len(val_files)
        total_test += len(test_files)
        
        print(f"✅ {vehicle_type:16s}: {len(train_files):3d} train, {len(val_files):3d} val, {len(test_files):3d} test")
    
    print("="*60)
    print(f"Total split: {total_train} train, {total_val} val, {total_test} test")
    print("="*60)
    print("\n⚠️  IMPORTANT: Label files created but are EMPTY!")
    print("   You must label the images with bounding boxes using:")
    print("   - labelImg: pip install labelImg")
    print("   - Roboflow: https://roboflow.com (recommended)")
    print("   - CVAT: https://cvat.org")


def create_data_yaml(base_dir='datasets/emergency_vehicles'):
    """
    Create data.yaml configuration file for YOLO training
    """
    
    # Get absolute path
    abs_path = os.path.abspath(base_dir)
    
    config = {
        'path': abs_path,
        'train': 'images/train',
        'val': 'images/val',
        'test': 'images/test',
        'nc': 4,  # number of classes
        'names': ['fire_truck', 'police_car', 'ambulance', 'normal_vehicle']
    }
    
    yaml_path = os.path.join(base_dir, 'data.yaml')
    
    with open(yaml_path, 'w') as f:
        yaml.dump(config, f, default_flow_style=False, sort_keys=False)
    
    print(f"\n✅ Created: {yaml_path}")
    print("\nConfiguration:")
    print(yaml.dump(config, default_flow_style=False, sort_keys=False))


def create_classes_file(base_dir='datasets/emergency_vehicles'):
    """
    Create classes.txt file
    """
    classes = ['fire_truck', 'police_car', 'ambulance', 'normal_vehicle']
    
    classes_path = os.path.join(base_dir, 'classes.txt')
    
    with open(classes_path, 'w') as f:
        for cls in classes:
            f.write(f"{cls}\n")
    
    print(f"✅ Created: {classes_path}")


if __name__ == "__main__":
    print("\n� EMERGENCY VEHICLE DATASET PREPARATION TOOL 📦")
    print("="*60)
    
    # Step 1: Create directory structure
    print("\nStep 1: Creating directory structure...")
    create_directory_structure()
    
    # Step 2: Split dataset
    print("\nStep 2: Splitting dataset into train/val/test...")
    split_dataset()
    
    # Step 3: Create configuration files
    print("\nStep 3: Creating configuration files...")
    create_data_yaml()
    create_classes_file()
    
    print("\n" + "="*60)
    print("DATASET PREPARATION COMPLETE!")
    print("="*60)
    print("\n📋 NEXT STEPS:")
    print("1. Label all images with bounding boxes using labelImg or Roboflow")
    print("2. Verify labels are in YOLO format (class_id cx cy w h)")
    print("3. Run train_custom_model.py to start training")
    print("="*60 + "\n")
