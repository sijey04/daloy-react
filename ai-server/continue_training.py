"""
Continue Training - Fine-tune existing model
Resume training from your best checkpoint for better accuracy
"""

from ultralytics import YOLO
import torch

def continue_training(
    resume_model='runs/detect/emergency_vehicle_detection/weights/best.pt',
    additional_epochs=50,
    data_yaml='datasets/emergency_vehicles/data.yaml'
):
    """
    Continue training from existing checkpoint
    This is the FASTEST way to improve your model
    """
    
    print("\n" + "="*80)
    print("🔄 CONTINUING TRAINING FROM CHECKPOINT")
    print("="*80)
    print(f"\n📊 Configuration:")
    print(f"   Resume from: {resume_model}")
    print(f"   Additional epochs: {additional_epochs}")
    print(f"   Device: {'GPU' if torch.cuda.is_available() else 'CPU'}")
    
    # Load your existing trained model
    model = YOLO(resume_model)
    
    # Continue training with refined hyperparameters
    results = model.train(
        data=data_yaml,
        epochs=additional_epochs,
        resume=False,  # Don't resume optimizer state, just weights
        
        # Lower learning rate for fine-tuning
        lr0=0.001,      # 10x lower than initial training
        lrf=0.001,      # Lower final learning rate
        
        # Keep augmentation
        augment=True,
        hsv_h=0.015,
        hsv_s=0.7,
        hsv_v=0.4,
        degrees=15.0,
        translate=0.1,
        scale=0.5,
        fliplr=0.5,
        mosaic=1.0,
        mixup=0.1,
        
        # Improved settings
        patience=20,
        batch=16,
        imgsz=640,
        device=0 if torch.cuda.is_available() else 'cpu',
        
        # Save settings
        project='runs/detect',
        name='emergency_vehicle_detection_v2',
        exist_ok=True,
        save=True,
        save_period=10,
        plots=True,
        verbose=True
    )
    
    print("\n✅ Fine-tuning complete!")
    print(f"📁 New model saved to: runs/detect/emergency_vehicle_detection_v2/weights/best.pt")
    print("\n📊 Metrics:")
    print(f"   mAP50: {results.results_dict.get('metrics/mAP50(B)', 'N/A')}")
    print(f"   mAP50-95: {results.results_dict.get('metrics/mAP50-95(B)', 'N/A')}")
    
    return results

if __name__ == '__main__':
    print("🎯 Fine-tune your existing model for better accuracy")
    print("   This will take your current model and make it even better!")
    print("   Estimated time: 1-2 hours\n")
    
    input("Press Enter to start fine-tuning...")
    
    continue_training(
        resume_model='runs/detect/emergency_vehicle_detection/weights/best.pt',
        additional_epochs=50  # Adjust this number (more = better but slower)
    )
