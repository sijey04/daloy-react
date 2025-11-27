"""
Retrain from Scratch with Improved Settings
Use this if you want to start fresh with better hyperparameters
"""

from ultralytics import YOLO
import torch

def retrain_from_scratch(
    data_yaml='datasets/emergency_vehicles/data.yaml',
    base_model='yolo11n.pt',
    epochs=150  # More epochs for better accuracy
):
    """
    Train a completely new model from scratch with improved settings
    """
    
    print("\n" + "="*80)
    print("🔥 RETRAINING FROM SCRATCH (IMPROVED SETTINGS)")
    print("="*80)
    print(f"\n📊 Configuration:")
    print(f"   Base model: {base_model}")
    print(f"   Epochs: {epochs}")
    print(f"   Device: {'GPU' if torch.cuda.is_available() else 'CPU'}")
    
    model = YOLO(base_model)
    
    results = model.train(
        data=data_yaml,
        epochs=epochs,
        
        # Image size (larger = better accuracy, slower speed)
        imgsz=640,  # Try 800 or 1024 for even better accuracy
        
        # Batch size
        batch=16,
        
        # Device
        device=0 if torch.cuda.is_available() else 'cpu',
        workers=8,
        
        # Project
        project='runs/detect',
        name='emergency_vehicle_detection_improved',
        exist_ok=True,
        
        # Early stopping
        patience=50,  # More patience for better convergence
        
        # Enhanced data augmentation
        augment=True,
        hsv_h=0.02,       # More hue variation
        hsv_s=0.7,
        hsv_v=0.5,
        degrees=20.0,     # More rotation
        translate=0.15,   # More translation
        scale=0.6,        # More scaling
        fliplr=0.5,
        flipud=0.1,       # Add vertical flips
        mosaic=1.0,
        mixup=0.15,       # More mixup
        copy_paste=0.15,  # More copy-paste
        
        # Improved hyperparameters
        lr0=0.01,
        lrf=0.001,
        momentum=0.937,
        weight_decay=0.0005,
        warmup_epochs=5.0,  # Longer warmup
        
        # Loss weights (tune for your use case)
        box=7.5,
        cls=0.5,
        dfl=1.5,
        
        # Advanced settings
        optimizer='AdamW',  # Use AdamW instead of auto
        cos_lr=True,        # Use cosine learning rate
        close_mosaic=15,    # Close mosaic earlier
        amp=True,
        
        # Validation
        val=True,
        
        # Saving
        save=True,
        save_period=10,
        plots=True,
        verbose=True
    )
    
    print("\n✅ Training complete!")
    print(f"📁 Model saved to: runs/detect/emergency_vehicle_detection_improved/weights/best.pt")
    print("\n📊 Final Metrics:")
    print(f"   mAP50: {results.results_dict.get('metrics/mAP50(B)', 'N/A')}")
    print(f"   mAP50-95: {results.results_dict.get('metrics/mAP50-95(B)', 'N/A')}")
    
    return results

if __name__ == '__main__':
    print("🔥 Retrain your model from scratch with improved settings")
    print("   This will create a new model with better hyperparameters")
    print("   Estimated time: 3-5 hours\n")
    
    input("Press Enter to start training...")
    
    retrain_from_scratch(epochs=150)
