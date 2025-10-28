# Custom Toy Car Detection Model Training Guide

## 🎯 Overview
This guide walks you through training a custom YOLOv11 model to detect toy cars and identify their orientation (front/back/left/right).

---

## 📋 Prerequisites

### System Requirements
- Python 3.8-3.11
- 8GB+ RAM (16GB recommended)
- GPU with CUDA (optional but highly recommended for faster training)
- 5GB+ free disk space

### Install Dependencies

```powershell
# Navigate to ai-server directory
cd ai-server

# Install required packages
pip install -r requirements.txt

# Verify installation
python -c "import ultralytics; print(ultralytics.__version__)"
python -c "import cv2; print(cv2.__version__)"
python -c "import torch; print(torch.__version__)"
```

---

## 🚀 Training Workflow

### **Phase 1: Data Collection (1-2 hours)**

#### Step 1: Collect Images

```powershell
# Run data collection tool
python collect_dataset.py

# Or specify angle directly
python collect_dataset.py --angle front
python collect_dataset.py --angle back
python collect_dataset.py --angle left
python collect_dataset.py --angle right
```

**Collection Tips:**
- Capture **50-100 images per angle** (200-400 total minimum)
- Use different:
  - Lighting conditions (bright, dim, natural, artificial)
  - Backgrounds (road, table, floor, carpet)
  - Distances (close-up, medium, far)
  - Camera angles (slightly tilted, different heights)
- Keep toy car centered in frame (use crosshair guide)
- Press SPACE to capture, Q to quit

#### Step 2: Check Collection Progress

```powershell
# View dataset summary
python collect_dataset.py --summary
```

Expected output:
```
DATASET SUMMARY
============================================================
✅ front   :   75 images (Recommended: 50-100)
✅ back    :   68 images (Recommended: 50-100)
✅ left    :   82 images (Recommended: 50-100)
✅ right   :   71 images (Recommended: 50-100)
============================================================
Total images: 296
Ready for training: YES ✅
```

---

### **Phase 2: Dataset Preparation (15-30 minutes)**

#### Step 3: Prepare Dataset Structure

```powershell
# Split into train/val/test and create directory structure
python prepare_dataset.py
```

This will:
- Create `datasets/toy_cars/images/train`, `val`, `test` folders
- Create `datasets/toy_cars/labels/train`, `val`, `test` folders
- Split images: 70% train, 20% validation, 10% test
- Create `data.yaml` configuration file

---

### **Phase 3: Image Labeling (1-3 hours)**

**⚠️ CRITICAL STEP**: You must label each image with bounding boxes!

#### Option A: Use Roboflow (Recommended - Easiest)

1. Go to https://roboflow.com
2. Create free account
3. Create new project "Toy Car Detection"
4. Upload all images from `datasets/toy_cars/images/`
5. Use their annotation tool to draw boxes around cars
6. Label with: `toy_car_front`, `toy_car_back`, `toy_car_left`, `toy_car_right`
7. Export as "YOLOv11" format
8. Replace your `datasets/toy_cars/` folder with exported data

#### Option B: Use labelImg (Local Tool)

```powershell
# Install labelImg
pip install labelImg

# Run labelImg
labelImg datasets/toy_cars/images/train datasets/toy_cars/classes.txt
```

**Labeling Instructions:**
1. Open image
2. Press 'W' to create bounding box
3. Draw box around toy car
4. Select correct class (front/back/left/right)
5. Save (generates .txt file in same folder)
6. Repeat for all images

**YOLO Label Format** (in .txt files):
```
class_id center_x center_y width height
```
- All values normalized 0-1
- Example: `0 0.5 0.5 0.3 0.2` (class 0, centered, 30% width, 20% height)

---

### **Phase 4: Training (2-6 hours)**

#### Step 4: Start Training

```powershell
# Basic training (100 epochs, ~2-4 hours)
python train_custom_model.py

# With custom parameters
python train_custom_model.py --epochs 150 --batch 8 --model yolo11s.pt

# GPU training (faster)
python train_custom_model.py --device 0

# CPU training (slower)
python train_custom_model.py --device cpu
```

**Training Parameters:**
- `--epochs`: Number of training cycles (default: 100)
- `--batch`: Batch size (default: 16, reduce if out of memory)
- `--model`: Base model (`yolo11n.pt`, `yolo11s.pt`, `yolo11m.pt`)
- `--device`: Device to use (`0` for GPU, `cpu` for CPU)

**What to Expect:**
```
Epoch   GPU_mem   box_loss   cls_loss   dfl_loss   Instances   Size
1/100      2.1G      1.234      0.892      1.456        128      640
2/100      2.1G      1.156      0.834      1.398        128      640
...
100/100    2.1G      0.412      0.234      0.567        128      640

Training complete!
mAP50:     0.8542  (85.4% accuracy)
mAP50-95:  0.7234
```

#### Step 5: Monitor Training

```powershell
# View training progress (in another terminal)
cd runs/detect/toy_car_detection
# Open results.png, confusion_matrix.png, etc.
```

**Key Files:**
- `weights/best.pt` - Best model (use this!)
- `weights/last.pt` - Latest checkpoint
- `results.png` - Training curves
- `confusion_matrix.png` - Classification performance

#### Resume Training (if interrupted)

```powershell
python train_custom_model.py --resume runs/detect/toy_car_detection/weights/last.pt
```

---

### **Phase 5: Testing (15-30 minutes)**

#### Step 6: Test the Model

```powershell
# Test on test images
python test_model.py

# Test with custom confidence threshold
python test_model.py --conf 0.4

# Test on live camera
python test_model.py --live
```

**Expected Results:**
```
TESTING RESULTS
============================================================
[1/30] Testing: front_0045_20251028_143022.jpg
   ✅ 1 detection(s):
      • toy_car_front: 0.87 confidence
        BBox: [123, 234, 456, 567]

TEST SUMMARY
============================================================
Total images tested: 30
Total detections: 28
Average detections per image: 0.93

Orientation breakdown:
  front   :  7 (25.0%)
  back    :  6 (21.4%)
  left    :  8 (28.6%)
  right   :  7 (25.0%)
```

---

### **Phase 6: Deployment**

#### Step 7: Update AI Server

Update `app.py` to use your custom model:

```python
# OLD:
model = YOLO('yolo11n.pt')

# NEW:
model = YOLO('runs/detect/toy_car_detection/weights/best.pt')
```

#### Step 8: Update Vehicle Classes

```python
# Update VEHICLE_CLASSES in app.py
VEHICLE_CLASSES = {
    0: 'toy_car_front',
    1: 'toy_car_back',
    2: 'toy_car_left',
    3: 'toy_car_right'
}
```

#### Step 9: Restart Server

```powershell
python app.py
```

---

## 📊 Expected Performance

### Good Training Results
- **mAP50**: 0.80-0.95 (80-95% accuracy)
- **mAP50-95**: 0.65-0.85
- **Training loss**: Decreasing steadily
- **Validation loss**: Similar to training loss (no overfitting)

### Signs of Problems

| Issue | Cause | Solution |
|-------|-------|----------|
| Low mAP (<0.6) | Not enough data | Collect more images (500+) |
| High training loss | Model too small | Use `yolo11s.pt` or `yolo11m.pt` |
| Overfitting | Too much training | Reduce epochs, add augmentation |
| Out of memory | Batch too large | Reduce `--batch` to 8 or 4 |

---

## 🔧 Troubleshooting

### "No module named 'ultralytics'"
```powershell
pip install ultralytics
```

### "CUDA out of memory"
```powershell
# Reduce batch size
python train_custom_model.py --batch 4
```

### "Not enough data"
- Need minimum 50 images per class
- Recommended: 100-200 images per class
- Solution: Collect more images

### "Poor detection accuracy"
- Label images more carefully
- Ensure bounding boxes are tight around cars
- Add more variety in images (lighting, backgrounds)
- Train longer (200-300 epochs)

---

## 📈 Improving Model Performance

### 1. Collect More Data
- 500+ images total (125+ per angle)
- More variety = better generalization

### 2. Better Labeling
- Precise bounding boxes
- Consistent labeling
- Use Roboflow for quality control

### 3. Increase Model Size
```powershell
# Use larger model for better accuracy (slower)
python train_custom_model.py --model yolo11s.pt  # Small
python train_custom_model.py --model yolo11m.pt  # Medium
```

### 4. Train Longer
```powershell
python train_custom_model.py --epochs 200
```

### 5. Adjust Hyperparameters
```powershell
# More aggressive augmentation
# Edit train_custom_model.py, increase:
# - degrees (rotation)
# - translate (position shift)
# - scale (size variation)
```

---

## 🎓 Quick Reference

### Commands Cheat Sheet

```powershell
# 1. Collect data
python collect_dataset.py --angle front

# 2. Check progress
python collect_dataset.py --summary

# 3. Prepare dataset
python prepare_dataset.py

# 4. Label images (use Roboflow or labelImg)

# 5. Train model
python train_custom_model.py

# 6. Test model
python test_model.py

# 7. Test live
python test_model.py --live
```

---

## 📞 Support

If you encounter issues:
1. Check error messages carefully
2. Verify all dependencies installed
3. Ensure dataset is properly labeled
4. Review training logs in `runs/detect/toy_car_detection/`

---

## ✅ Checklist

- [ ] Python environment set up
- [ ] Dependencies installed
- [ ] Collected 200+ images (50+ per angle)
- [ ] Dataset prepared and split
- [ ] All images labeled with bounding boxes
- [ ] Training completed successfully
- [ ] Model tested and validated
- [ ] AI server updated with custom model
- [ ] System working with improved accuracy!

---

Good luck with your training! 🚀
