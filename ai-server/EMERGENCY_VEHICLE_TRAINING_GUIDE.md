# 🚨 Emergency Vehicle Detection Training Guide

## ✅ What's Been Done

- ✅ **Old dataset removed** - Toy car data cleared
- ✅ **Scripts updated** - Now configured for emergency vehicles
- ✅ **4 Vehicle classes**:
  1. `fire_truck` - Fire trucks/engines
  2. `police_car` - Police vehicles
  3. `ambulance` - Ambulance/medical vehicles
  4. `normal_vehicle` - Regular cars

---

## 🚀 Step-by-Step Training Process

### **Step 1: Collect Images** (2-4 hours)

Collect 100-200 images for each vehicle type.

#### Option A: Collect All Types Interactively
```powershell
cd d:\daloy-react\ai-server
python collect_dataset.py
```

#### Option B: Collect One Type at a Time
```powershell
# Fire trucks
python collect_dataset.py --type fire_truck

# Police cars
python collect_dataset.py --type police_car

# Ambulances
python collect_dataset.py --type ambulance

# Normal vehicles
python collect_dataset.py --type normal_vehicle
```

**Collection Tips:**
- **Controls**: SPACE = capture, Q = quit, S = show stats
- **Variety**: Different angles, lighting, distances
- **Quality**: Clear images, vehicle centered
- **Quantity**: Target 100-200 images per type (400-800 total)

#### Check Progress
```powershell
python collect_dataset.py --summary
```

Expected output:
```
============================================================
DATASET SUMMARY
============================================================
✅ fire_truck      :  150 images (Recommended: 100-200)
✅ police_car      :  120 images (Recommended: 100-200)
✅ ambulance       :  110 images (Recommended: 100-200)
✅ normal_vehicle  :  180 images (Recommended: 100-200)
============================================================
Total images: 560
Ready for training: YES ✅
============================================================
```

---

### **Step 2: Prepare Dataset** (5 minutes)

Once you have collected enough images:

```powershell
python prepare_dataset.py
```

This will:
- Split images: 70% train, 20% validation, 10% test
- Create folder structure
- Generate `data.yaml` configuration

---

### **Step 3: Label Images** (2-5 hours)

You MUST draw bounding boxes around vehicles in your images.

#### **Option A: Roboflow (Recommended)**

1. **Sign up**: https://roboflow.com (free account)
2. **Create project**: 
   - Name: "Emergency Vehicle Detection"
   - Type: Object Detection
3. **Upload images**: Upload all images from train/val/test folders
4. **Label images**: Draw boxes around each vehicle
   - Use these exact labels:
     - `fire_truck`
     - `police_car`
     - `ambulance`
     - `normal_vehicle`
5. **Export dataset**:
   - Format: YOLOv8 or YOLOv11
   - Download ZIP
6. **Replace dataset**: Extract and replace `datasets/emergency_vehicles/`

#### **Option B: LabelImg (Local)**

```powershell
pip install labelImg
labelImg
```

- Open directory: `datasets/emergency_vehicles/images/train`
- Save directory: `datasets/emergency_vehicles/labels/train`
- Format: YOLO
- Draw boxes around each vehicle
- Label with correct class
- Repeat for `val` and `test` folders

---

### **Step 4: Train Model** (2-6 hours)

```powershell
python train_custom_model.py
```

**Advanced options:**
```powershell
# More epochs for better accuracy
python train_custom_model.py --epochs 150

# Smaller batch if GPU memory issues
python train_custom_model.py --batch 4

# Different image size
python train_custom_model.py --imgsz 416
```

**What happens:**
- Training runs for 100 epochs (default)
- Progress shown in real-time
- Best model saved to: `runs/detect/emergency_vehicles/weights/best.pt`
- Training curves: `runs/detect/emergency_vehicles/results.png`

**Monitor training:**
- Look for decreasing loss values
- Target mAP50 > 0.80 (80% accuracy)

---

### **Step 5: Test Model** (15 minutes)

```powershell
# Test on images
python test_model.py

# Test with live camera
python test_model.py --live
```

---

### **Step 6: Deploy Model** (5 minutes)

Update `app.py` to use your custom model:

```python
# Find line ~16 in app.py
# Change from:
model = YOLO('yolo11n.pt')

# To:
model = YOLO('runs/detect/emergency_vehicles/weights/best.pt')
```

Restart the server:
```powershell
python app.py
```

---

## 📋 Quick Command Reference

```powershell
# Check collection progress
python collect_dataset.py --summary

# Collect images
python collect_dataset.py                      # Interactive
python collect_dataset.py --type fire_truck    # Specific type

# Prepare dataset
python prepare_dataset.py

# Train model
python train_custom_model.py

# Test model
python test_model.py
python test_model.py --live

# Help
python collect_dataset.py --help
python train_custom_model.py --help
```

---

## 🎯 Expected Results

### Target Dataset Size
- **Minimum**: 400 images total (100 per type)
- **Good**: 600 images total (150 per type)
- **Best**: 800+ images total (200+ per type)

### Expected Accuracy
- **With 400 images**: 70-80% mAP
- **With 600 images**: 80-90% mAP
- **With 800+ images**: 85-95% mAP

---

## 💡 Tips for Best Results

### Data Collection
- **Diverse angles**: Front, side, rear, diagonal
- **Various lighting**: Day, night, overcast, sunny
- **Different distances**: Close-up, medium, far
- **Multiple backgrounds**: Roads, parking lots, buildings
- **Real emergency vehicles**: Try to capture actual emergency vehicles
- **Toy/model vehicles**: If using toys, ensure variety

### Labeling
- **Tight boxes**: Draw boxes as close to vehicle edges as possible
- **Complete vehicles**: Include entire vehicle in box
- **Partial vehicles**: Still label if 50%+ visible
- **Correct class**: Double-check you're using the right label
- **Consistency**: Label the same way throughout

### Training
- **Be patient**: Training takes time (2-6 hours)
- **Monitor progress**: Check results.png periodically
- **Don't interrupt**: Let training complete
- **Save everything**: Don't delete runs folder

---

## 🔧 Troubleshooting

### "No images found"
- Make sure you collected images first
- Check `datasets/emergency_vehicles/images/` has subfolders
- Run `python collect_dataset.py --summary`

### "Labels are empty"
- You must label images with bounding boxes
- Use Roboflow or labelImg
- Labels should be in `datasets/emergency_vehicles/labels/`

### "CUDA out of memory"
```powershell
python train_custom_model.py --batch 4
```

### Poor accuracy after training
- Collect more diverse images
- Ensure tight, accurate bounding boxes
- Train for more epochs: `--epochs 200`
- Check if classes are balanced (similar number of images per type)

---

## 📊 Training Checklist

- [ ] Step 1: Collect 100-200 images for fire_truck
- [ ] Step 1: Collect 100-200 images for police_car
- [ ] Step 1: Collect 100-200 images for ambulance
- [ ] Step 1: Collect 100-200 images for normal_vehicle
- [ ] Step 2: Run prepare_dataset.py
- [ ] Step 3: Label all images with bounding boxes
- [ ] Step 3: Verify labels are in YOLO format
- [ ] Step 4: Train model (python train_custom_model.py)
- [ ] Step 4: Wait for training to complete
- [ ] Step 5: Test model with test images
- [ ] Step 5: Test model with live camera
- [ ] Step 6: Update app.py with custom model path
- [ ] Step 6: Deploy and test in production

---

## 🎓 Next Steps

1. **Start collecting images now**:
   ```powershell
   cd d:\daloy-react\ai-server
   python collect_dataset.py --type fire_truck
   ```

2. **Aim for variety**: Different conditions, angles, distances

3. **Be thorough with labeling**: Quality labels = better model

4. **Train and test**: Follow the steps above

5. **Deploy**: Update app.py and enjoy accurate detection!

---

**Good luck with your training! 🚀**
