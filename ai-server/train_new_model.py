"""
Train New YOLOv11 Model on Emergency Vehicles Dataset
------------------------------------------------------
This script trains a fresh YOLOv11n model on your custom dataset.

Usage:
    python train_new_model.py

The trained model will be saved in:
    runs/detect/emergency_vehicle_detection_latest/weights/best.pt
"""

import os
import sys
from ultralytics import YOLO
from datetime import datetime
import torch

# Check if CUDA is available
print("\n" + "="*80)
print("🚀 YOLOv11 Training Script - Emergency Vehicle Detection")
print("="*80)
print(f"📅 Training started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print(f"🎮 CUDA available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"   └─ GPU: {torch.cuda.get_device_name(0)}")
    print(f"   └─ Memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")
    device = '0'  # Use GPU 0
else:
    print("   └─ Training will use CPU (this will be MUCH slower)")
    device = 'cpu'
print("="*80 + "\n")

# Training Configuration
CONFIG = {
    # Model
    'model': 'yolo11n.pt',  # Start from pretrained YOLOv11n
    
    # Dataset
    'data': 'datasets/emergency_vehicles/data.yaml',
    
    # Training Parameters
    'epochs': 200,           # Number of training epochs (increased for better accuracy)
    'batch': 16,            # Batch size (adjust based on GPU memory)
    'imgsz': 640,           # Input image size
    'device': device,       # GPU or CPU
    
    # Optimizer
    'optimizer': 'AdamW',   # AdamW optimizer (better than SGD for small datasets)
    'lr0': 0.01,           # Initial learning rate
    'lrf': 0.001,          # Final learning rate (lr0 * lrf)
    'momentum': 0.937,     # Momentum
    'weight_decay': 0.0005, # Weight decay
    
    # Learning Rate Schedule
    'cos_lr': True,         # Use cosine learning rate scheduler
    'warmup_epochs': 5.0,   # Warmup epochs
    'warmup_momentum': 0.8, # Warmup momentum
    
    # Augmentation
    'hsv_h': 0.02,          # Hue augmentation
    'hsv_s': 0.7,           # Saturation augmentation
    'hsv_v': 0.5,           # Value (brightness) augmentation
    'degrees': 20.0,        # Rotation augmentation (degrees)
    'translate': 0.15,      # Translation augmentation (fraction)
    'scale': 0.6,           # Scale augmentation (gain)
    'shear': 0.0,           # Shear augmentation (degrees)
    'perspective': 0.0,     # Perspective augmentation
    'flipud': 0.1,          # Vertical flip probability
    'fliplr': 0.5,          # Horizontal flip probability
    'mosaic': 1.0,          # Mosaic augmentation probability
    'mixup': 0.15,          # Mixup augmentation probability
    'copy_paste': 0.15,     # Copy-paste augmentation probability
    
    # Validation
    'val': True,            # Validate during training
    'patience': 50,         # Early stopping patience (epochs without improvement)
    'save_period': 10,      # Save checkpoint every N epochs
    
    # Performance
    'amp': True,            # Automatic Mixed Precision (faster training)
    'cache': False,         # Cache images to RAM (set to True if you have enough RAM)
    'workers': 8,           # Number of data loading workers
    'close_mosaic': 15,     # Disable mosaic augmentation for last N epochs
    
    # Output
    'project': 'runs/detect',
    'name': 'emergency_vehicle_detection_latest',
    'exist_ok': True,       # Overwrite existing project
    
    # Advanced
    'deterministic': True,  # Deterministic training (reproducible results)
    'seed': 0,              # Random seed for reproducibility
    'verbose': True,        # Verbose output
}

def main():
    """Main training function"""
    
    print("📦 Loading YOLOv11n pretrained model...")
    model = YOLO(CONFIG['model'])
    print("✅ Model loaded!\n")
    
    print("📊 Dataset Information:")
    print(f"   └─ Path: {CONFIG['data']}")
    print(f"   └─ Classes: ambulance, fire_truck, normal_car, police_car")
    print(f"   └─ Number of classes: 4\n")
    
    print("⚙️  Training Configuration:")
    print(f"   └─ Epochs: {CONFIG['epochs']}")
    print(f"   └─ Batch size: {CONFIG['batch']}")
    print(f"   └─ Image size: {CONFIG['imgsz']}x{CONFIG['imgsz']}")
    print(f"   └─ Device: {CONFIG['device']}")
    print(f"   └─ Optimizer: {CONFIG['optimizer']}")
    print(f"   └─ Learning rate: {CONFIG['lr0']} → {CONFIG['lr0'] * CONFIG['lrf']}")
    print(f"   └─ Patience: {CONFIG['patience']} epochs\n")
    
    print("🎯 Starting training...")
    print("="*80 + "\n")
    
    # Train the model
    results = model.train(
        data=CONFIG['data'],
        epochs=CONFIG['epochs'],
        batch=CONFIG['batch'],
        imgsz=CONFIG['imgsz'],
        device=CONFIG['device'],
        optimizer=CONFIG['optimizer'],
        lr0=CONFIG['lr0'],
        lrf=CONFIG['lrf'],
        momentum=CONFIG['momentum'],
        weight_decay=CONFIG['weight_decay'],
        cos_lr=CONFIG['cos_lr'],
        warmup_epochs=CONFIG['warmup_epochs'],
        warmup_momentum=CONFIG['warmup_momentum'],
        hsv_h=CONFIG['hsv_h'],
        hsv_s=CONFIG['hsv_s'],
        hsv_v=CONFIG['hsv_v'],
        degrees=CONFIG['degrees'],
        translate=CONFIG['translate'],
        scale=CONFIG['scale'],
        shear=CONFIG['shear'],
        perspective=CONFIG['perspective'],
        flipud=CONFIG['flipud'],
        fliplr=CONFIG['fliplr'],
        mosaic=CONFIG['mosaic'],
        mixup=CONFIG['mixup'],
        copy_paste=CONFIG['copy_paste'],
        val=CONFIG['val'],
        patience=CONFIG['patience'],
        save_period=CONFIG['save_period'],
        amp=CONFIG['amp'],
        cache=CONFIG['cache'],
        workers=CONFIG['workers'],
        close_mosaic=CONFIG['close_mosaic'],
        project=CONFIG['project'],
        name=CONFIG['name'],
        exist_ok=CONFIG['exist_ok'],
        deterministic=CONFIG['deterministic'],
        seed=CONFIG['seed'],
        verbose=CONFIG['verbose'],
    )
    
    print("\n" + "="*80)
    print("✅ Training completed!")
    print("="*80)
    print(f"📅 Finished: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"📁 Model saved to: {CONFIG['project']}/{CONFIG['name']}/weights/best.pt")
    print(f"📊 Results saved to: {CONFIG['project']}/{CONFIG['name']}/")
    print("\n🎉 You can now use the trained model in your application!")
    print("   To use this model, update app.py line 51:")
    print(f"   model = YOLO('{CONFIG['project']}/{CONFIG['name']}/weights/best.pt')")
    print("="*80 + "\n")
    
    # Display training metrics
    if results:
        print("📈 Final Training Metrics:")
        print(f"   └─ Best epoch: Check the results folder for details")
        print(f"   └─ View all metrics: {CONFIG['project']}/{CONFIG['name']}/results.png")
        print(f"   └─ Confusion matrix: {CONFIG['project']}/{CONFIG['name']}/confusion_matrix.png")
        print(f"   └─ Training curves: {CONFIG['project']}/{CONFIG['name']}/results.csv\n")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Training interrupted by user!")
        print("   The model checkpoints are saved in the project folder.")
    except Exception as e:
        print(f"\n\n❌ Error during training: {e}")
        import traceback
        traceback.print_exc()
