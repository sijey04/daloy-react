"""
Custom YOLOv11 Model Training for Toy Car Detection
Trains a model to detect toy cars and identify their orientation (front/back/left/right)
"""

from ultralytics import YOLO
import torch
import os
from datetime import datetime

def train_toy_car_model(
    data_yaml='datasets/toy_cars/data.yaml',
    base_model='yolo11n.pt',
    epochs=100,
    img_size=640,
    batch_size=16,
    device=None
):
    """
    Train YOLOv11 model on custom toy car dataset
    
    Args:
        data_yaml: Path to dataset configuration file
        base_model: Pretrained model to start from (transfer learning)
        epochs: Number of training epochs
        img_size: Input image size
        batch_size: Batch size for training
        device: Device to use ('cpu', 'cuda', or None for auto-detect)
    """
    
    print("\n" + "="*80)
    print("🚗 TRAINING CUSTOM TOY CAR DETECTION MODEL")
    print("="*80)
    
    # Auto-detect device if not specified
    if device is None:
        device = 0 if torch.cuda.is_available() else 'cpu'
    
    print(f"\n📊 Training Configuration:")
    print(f"   Dataset: {data_yaml}")
    print(f"   Base model: {base_model}")
    print(f"   Epochs: {epochs}")
    print(f"   Image size: {img_size}")
    print(f"   Batch size: {batch_size}")
    print(f"   Device: {device}")
    print(f"   GPU Available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"   GPU Name: {torch.cuda.get_device_name(0)}")
    
    # Check if dataset exists
    if not os.path.exists(data_yaml):
        print(f"\n❌ Error: Dataset configuration not found: {data_yaml}")
        print("   Run prepare_dataset.py first!")
        return None
    
    # Load pretrained model
    print(f"\n📥 Loading base model: {base_model}")
    model = YOLO(base_model)
    
    # Training hyperparameters optimized for toy cars (small objects)
    print("\n🎯 Starting training...")
    print("   This may take several hours depending on your hardware")
    print("   Progress will be saved in runs/detect/toy_car_detection/")
    
    try:
        results = model.train(
            # Dataset
            data=data_yaml,
            
            # Training duration
            epochs=epochs,
            patience=30,  # Early stopping patience
            
            # Image settings
            imgsz=img_size,
            
            # Batch settings
            batch=batch_size,
            
            # Device
            device=device,
            
            # Workers
            workers=8,
            
            # Project organization
            project='runs/detect',
            name='toy_car_detection',
            exist_ok=True,
            
            # Logging
            verbose=True,
            
            # Saving
            save=True,
            save_period=10,  # Save checkpoint every 10 epochs
            
            # Validation
            val=True,
            
            # Data augmentation (important for small datasets)
            augment=True,
            hsv_h=0.015,      # Hue augmentation (0-1)
            hsv_s=0.7,        # Saturation augmentation
            hsv_v=0.4,        # Value (brightness) augmentation
            degrees=15.0,     # Rotation (+/- degrees)
            translate=0.1,    # Translation (+/- fraction)
            scale=0.5,        # Scaling (+/- gain)
            shear=0.0,        # Shear (+/- degrees)
            perspective=0.0,  # Perspective (+/- fraction)
            flipud=0.0,       # Vertical flip probability
            fliplr=0.5,       # Horizontal flip probability
            mosaic=1.0,       # Mosaic augmentation probability
            mixup=0.1,        # MixUp augmentation probability
            copy_paste=0.1,   # Copy-paste augmentation probability
            
            # Hyperparameters tuned for small objects (toy cars)
            lr0=0.01,         # Initial learning rate
            lrf=0.01,         # Final learning rate (lr0 * lrf)
            momentum=0.937,   # SGD momentum
            weight_decay=0.0005,  # Optimizer weight decay
            warmup_epochs=3.0,    # Warmup epochs
            warmup_momentum=0.8,  # Warmup momentum
            warmup_bias_lr=0.1,   # Warmup bias learning rate
            
            # Loss weights (increase box for better localization)
            box=7.5,          # Box loss weight
            cls=0.5,          # Class loss weight
            dfl=1.5,          # DFL loss weight
            
            # Optimizer
            optimizer='auto',  # Auto-select optimizer (AdamW or SGD)
            
            # Other
            seed=0,           # Random seed for reproducibility
            deterministic=True,  # Deterministic mode
            single_cls=False,    # Multi-class training
            rect=False,          # Rectangular training
            cos_lr=False,        # Cosine learning rate scheduler
            close_mosaic=10,     # Disable mosaic last N epochs
            amp=True,            # Automatic Mixed Precision training
            fraction=1.0,        # Train on fraction of data
            profile=False,       # Profile ONNX and TensorRT speeds
            freeze=None,         # Freeze layers (None, int, or list)
            multi_scale=False,   # Multi-scale training
            overlap_mask=True,   # Masks should overlap during training
            mask_ratio=4,        # Mask downsample ratio
            dropout=0.0,         # Use dropout regularization
            plots=True,          # Save training plots
        )
        
        print("\n" + "="*80)
        print("✅ TRAINING COMPLETE!")
        print("="*80)
        
        # Validate the model
        print("\n📊 Running validation...")
        metrics = model.val()
        
        print(f"\n📈 Validation Metrics:")
        print(f"   mAP50:     {metrics.box.map50:.4f}")
        print(f"   mAP50-95:  {metrics.box.map:.4f}")
        print(f"   Precision: {metrics.box.mp:.4f}")
        print(f"   Recall:    {metrics.box.mr:.4f}")
        
        # Model location
        model_path = 'runs/detect/toy_car_detection/weights/best.pt'
        print(f"\n💾 Best model saved to: {model_path}")
        print(f"   Last model: runs/detect/toy_car_detection/weights/last.pt")
        
        print("\n" + "="*80)
        print("📋 NEXT STEPS:")
        print("="*80)
        print("1. Review training results in runs/detect/toy_car_detection/")
        print("2. Check training curves and validation metrics")
        print("3. Test the model using test_model.py")
        print("4. If satisfied, update app.py to use the custom model")
        print("   Change: model = YOLO('yolo11n.pt')")
        print("   To:     model = YOLO('runs/detect/toy_car_detection/weights/best.pt')")
        print("="*80 + "\n")
        
        return model
        
    except Exception as e:
        print(f"\n❌ Training failed with error:")
        print(f"   {str(e)}")
        import traceback
        traceback.print_exc()
        return None


def resume_training(checkpoint_path='runs/detect/toy_car_detection/weights/last.pt'):
    """
    Resume training from a checkpoint
    """
    print(f"\n🔄 Resuming training from: {checkpoint_path}")
    
    if not os.path.exists(checkpoint_path):
        print(f"❌ Checkpoint not found: {checkpoint_path}")
        return None
    
    model = YOLO(checkpoint_path)
    results = model.train(resume=True)
    
    return model


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Train custom YOLOv11 model for toy cars')
    parser.add_argument('--data', type=str, default='datasets/toy_cars/data.yaml',
                       help='Path to dataset YAML file')
    parser.add_argument('--model', type=str, default='yolo11n.pt',
                       help='Base model to use (yolo11n.pt, yolo11s.pt, yolo11m.pt)')
    parser.add_argument('--epochs', type=int, default=100,
                       help='Number of training epochs')
    parser.add_argument('--batch', type=int, default=16,
                       help='Batch size')
    parser.add_argument('--imgsz', type=int, default=640,
                       help='Input image size')
    parser.add_argument('--device', type=str, default=None,
                       help='Device to use (cpu, 0, 1, etc.)')
    parser.add_argument('--resume', type=str, default=None,
                       help='Resume from checkpoint')
    
    args = parser.parse_args()
    
    if args.resume:
        resume_training(args.resume)
    else:
        train_toy_car_model(
            data_yaml=args.data,
            base_model=args.model,
            epochs=args.epochs,
            img_size=args.imgsz,
            batch_size=args.batch,
            device=args.device
        )
