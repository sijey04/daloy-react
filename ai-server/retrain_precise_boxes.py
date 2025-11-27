"""
Retrain Model with Better Bounding Box Accuracy
This script retrains with box=10.0 (increased from 7.5) to prioritize precise bounding boxes
"""

from ultralytics import YOLO
import torch

def retrain_for_better_boxes():
    """
    Retrain model with emphasis on bounding box accuracy
    - Increased box loss weight: 10.0 (from 7.5)
    - Same architecture and hyperparameters as improved model
    - Focus on reducing box localization errors
    """
    
    print("\n" + "="*80)
    print("🎯 RETRAINING WITH IMPROVED BOUNDING BOX ACCURACY")
    print("="*80)
    
    # Check GPU
    device = 0 if torch.cuda.is_available() else 'cpu'
    print(f"\n🎮 Device: {'GPU (CUDA)' if device == 0 else 'CPU'}")
    if torch.cuda.is_available():
        print(f"   GPU: {torch.cuda.get_device_name(0)}")
    
    # Load base model
    print("\n📥 Loading YOLOv11n base model...")
    model = YOLO('yolo11n.pt')
    
    print("\n🎯 Key Changes from Previous Training:")
    print("   • Box loss weight: 7.5 → 10.0 (33% increase)")
    print("   • Focus: More precise bounding box alignment")
    print("   • Everything else: Same as improved model")
    
    print("\n⏱️  Estimated training time: 2.5-3 hours (150 epochs)")
    print("🎯 Expected result: Tighter, more accurate bounding boxes")
    
    # Train with improved box loss weight
    results = model.train(
        # Dataset
        data='datasets/emergency_vehicles/data.yaml',
        
        # Training duration
        epochs=150,
        patience=50,
        
        # Image settings
        imgsz=640,
        batch=16,
        
        # Device
        device=device,
        workers=8,
        
        # Project organization
        project='runs/detect',
        name='emergency_vehicle_detection_precise_boxes',
        exist_ok=True,
        
        # Logging & Saving
        verbose=True,
        save=True,
        save_period=10,
        val=True,
        plots=True,
        
        # Data augmentation (same as improved model)
        augment=True,
        hsv_h=0.02,
        hsv_s=0.7,
        hsv_v=0.4,
        degrees=20.0,
        translate=0.15,
        scale=0.6,
        shear=0.0,
        perspective=0.0,
        flipud=0.0,
        fliplr=0.5,
        mosaic=1.0,
        mixup=0.15,
        copy_paste=0.1,
        
        # Hyperparameters (same as improved model)
        lr0=0.01,
        lrf=0.01,
        momentum=0.937,
        weight_decay=0.0005,
        warmup_epochs=3.0,
        
        # Loss weights - INCREASED BOX WEIGHT FOR BETTER ACCURACY
        box=10.0,         # ⬆️ INCREASED from 7.5 to 10.0 (33% more weight)
        cls=0.5,          # Class loss weight (unchanged)
        dfl=1.5,          # DFL loss weight (unchanged)
        
        # Optimizer (same as improved model)
        optimizer='AdamW',
        cos_lr=True,
        
        # Other settings
        seed=0,
        deterministic=True,
        single_cls=False,
        rect=False,
        close_mosaic=10,
        amp=True,
        fraction=1.0,
        
        # Advanced
        profile=False,
        freeze=None,
        multi_scale=False,
        overlap_mask=True,
        mask_ratio=4,
        dropout=0.0,
    )
    
    print("\n" + "="*80)
    print("✅ TRAINING COMPLETE - PRECISE BOXES MODEL")
    print("="*80)
    
    # Validate
    print("\n📊 Running validation...")
    metrics = model.val()
    
    print(f"\n📈 Final Metrics:")
    print(f"   mAP50:     {metrics.box.map50:.4f}")
    print(f"   mAP50-95:  {metrics.box.map:.4f}")
    print(f"   Precision: {metrics.box.mp:.4f}")
    print(f"   Recall:    {metrics.box.mr:.4f}")
    
    print(f"\n💾 Model saved to:")
    print(f"   runs/detect/emergency_vehicle_detection_precise_boxes/weights/best.pt")
    
    print("\n" + "="*80)
    print("📋 TO USE THIS MODEL:")
    print("="*80)
    print("Update app.py line ~22:")
    print("  FROM: model = YOLO('runs/detect/emergency_vehicle_detection_improved/weights/best.pt')")
    print("  TO:   model = YOLO('runs/detect/emergency_vehicle_detection_precise_boxes/weights/best.pt')")
    print("="*80 + "\n")
    
    return model


if __name__ == "__main__":
    print("\n⚠️  RECOMMENDATION:")
    print("   Try the current model with conf=0.65 first (server already restarted)")
    print("   Only run this training if bounding boxes still don't fit vehicles well")
    print("   This will take 2.5-3 hours to complete")
    
    response = input("\n❓ Start retraining now? (yes/no): ").strip().lower()
    
    if response in ['yes', 'y']:
        retrain_for_better_boxes()
    else:
        print("\n✅ Training cancelled")
        print("   Test current model first with the new 0.65 confidence threshold")
        print("   Run this script later if needed: python retrain_precise_boxes.py")
