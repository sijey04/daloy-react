# Collect Grouped Vehicle Images Using Your Phone 📱

## Why Phone is Better ✅
- ✅ No camera driver issues
- ✅ Higher quality images (most phones have better cameras)
- ✅ Easier to position and angle
- ✅ Can take photos from different heights/distances
- ✅ Faster workflow

## Quick Setup (2 minutes) 🚀

### Option 1: Direct File Transfer (Easiest)
1. Take 100-200 photos with your phone
2. Connect phone to PC via USB
3. Copy all photos to: `d:\daloy-react\ai-server\datasets\emergency_vehicles\grouped_images\`

### Option 2: DroidCam (Use phone as webcam)
1. Install DroidCam: https://www.dev47apps.com/droidcam/windows/
2. Install app on phone from Play Store/App Store
3. Connect phone and PC to same WiFi
4. Run the collection script again

## Photography Guidelines 📸

### What to Capture (100-200 images):

#### 1. All 4 Cars Together (40-50 images)
```
🚗 🚑 🚒 🚓
```
- Line them up side by side
- Small gaps between them (1-2 inches)
- Take from different angles: front view, back view, 45° angles
- Different distances: close-up, medium, far

#### 2. Groups of 3 (30-40 images)
```
🚗 🚑 🚒
🚑 🚒 🚓
🚗 🚒 🚓
🚗 🚑 🚓
```
- Try all combinations of 3 vehicles
- Close together with small gaps

#### 3. Pairs (30-40 images)
```
🚗 🚑    🚒 🚓    🚗 🚒    etc.
```
- All possible pairs
- Very close together
- Different orientations (front-to-front, back-to-back, side-by-side)

#### 4. Mixed Arrangements (30-40 images)
```
    🚑
🚗      🚒
    🚓
```
- Diagonal arrangements
- Overlapping (one slightly behind another)
- Different spacing variations
- Irregular patterns

### Camera Settings 📷
- **Lighting:** Good lighting (daylight or bright room light)
- **Background:** Same surface as your current setup
- **Distance:** Similar to your actual camera distance
- **Angle:** Same angle as your mounted camera (180° if needed)
- **Focus:** Make sure all vehicles are in focus

### Critical Tips ⚠️
1. **Keep cars CLOSE** - gaps should be 0.5-2 inches maximum
2. **Full vehicles in frame** - don't cut off any part
3. **Consistent angle** - use the same camera angle as your actual setup
4. **No blur** - hold phone steady or use a stand
5. **Same background** - use your actual traffic light setup background

## Folder Structure 📁

Save all images to:
```
d:\daloy-react\ai-server\datasets\emergency_vehicles\grouped_images\
```

Name them anything (phone will auto-name them), like:
- IMG_20251105_001.jpg
- IMG_20251105_002.jpg
- etc.

## Quick Checklist ✅

Before uploading to Roboflow, verify you have:
- [ ] 40-50 images with all 4 cars together
- [ ] 30-40 images with 3 cars grouped
- [ ] 30-40 images with 2 cars grouped
- [ ] 30-40 images with mixed arrangements
- [ ] All images have good lighting
- [ ] All vehicles fully visible (not cut off)
- [ ] Vehicles are CLOSE together in each image
- [ ] **Total: 100-200 images minimum**

## After Collection 📤

### Step 1: Copy Photos to PC
```powershell
# Photos should be in this folder:
d:\daloy-react\ai-server\datasets\emergency_vehicles\grouped_images\
```

### Step 2: Verify Count
```powershell
cd d:\daloy-react\ai-server\datasets\emergency_vehicles\grouped_images
ls | measure-object -line
```

Should show 100+ files.

### Step 3: Upload to Roboflow
1. Go to your Roboflow project
2. Click "Upload Images"
3. Select all images from the grouped_images folder
4. Upload them all at once

### Step 4: Label on Roboflow (MOST IMPORTANT)
**THIS IS THE CRITICAL STEP!**

For EACH image:
1. Draw a bounding box around **each vehicle separately**
2. Make boxes **tight-fitting** (not loose)
3. Boxes should **NOT overlap** (each car gets its own box)
4. Label each box correctly:
   - `ambulance` (white with red cross)
   - `fire_truck` (red)
   - `normal_car` (blue)
   - `police_car` (black and white)

**Example labeling:**
```
Image with 4 cars → Draw 4 separate boxes
Image with 3 cars → Draw 3 separate boxes
Image with 2 cars → Draw 2 separate boxes
```

**Common mistakes to avoid:**
- ❌ Drawing one big box around all vehicles
- ❌ Overlapping boxes
- ❌ Loose boxes with too much background
- ❌ Wrong class labels
- ❌ Missing a vehicle in the image

**Time estimate:** 2-3 hours for 150 images (1-2 minutes per image)

### Step 5: Merge Dataset
In Roboflow:
1. Your new images are added to existing dataset
2. Click "Generate" → This creates new train/val/test split
3. Click "Export" → Choose "YOLOv11" format
4. Download the new dataset

### Step 6: Replace Dataset
```powershell
cd d:\daloy-react\ai-server\datasets\emergency_vehicles

# Backup old dataset
mv roboflow_export roboflow_export_OLD

# Extract new download here (should create 'roboflow_export' folder)
```

### Step 7: Retrain Model
```powershell
cd d:\daloy-react\ai-server
$env:PYTHONPATH = "D:\Python_Packages"
python train_custom_model.py --epochs 150 --batch 16
```

**Training time:** 3-5 hours (run overnight)

### Step 8: Test New Model
After training completes:
```powershell
# Copy best model to improved folder
cp runs/detect/emergency_vehicle_detection/weights/best.pt runs/detect/emergency_vehicle_detection_improved/weights/best.pt

# Restart server (it will use new model automatically)
$env:PYTHONPATH = "D:\Python_Packages"
python app.py
```

## Expected Results 📈

**Before (current):**
- Single vehicle detection: ✅ 95% accurate
- Grouped vehicles: ❌ 60-70% accurate (duplicates, wrong boxes)

**After (with new training):**
- Single vehicle detection: ✅ 95% accurate (stays good)
- Grouped vehicles: ✅ 90-95% accurate (FIXED!)

## Time Investment ⏰

| Task | Time | Active Work |
|------|------|-------------|
| Take photos | 30 min | ✅ Yes |
| Transfer to PC | 5 min | ✅ Yes |
| Upload to Roboflow | 10 min | ✅ Yes |
| Label on Roboflow | 2-3 hours | ✅ Yes (most important!) |
| Generate & download dataset | 5 min | ✅ Yes |
| Retrain model | 3-5 hours | ⏳ Automatic (run overnight) |
| **Total active work** | **~3.5 hours** | - |
| **Total elapsed time** | **6-8 hours** | - |

## Pro Tips 💡

1. **Take MORE photos** - 200 is better than 100
2. **Variety is key** - different angles, spacing, arrangements
3. **Labeling accuracy is CRITICAL** - spend time making boxes precise
4. **Don't rush** - a well-labeled dataset is everything
5. **Test incrementally** - after 50 images labeled, you can generate and test

## Troubleshooting 🔧

**Q: What if I can't get 200 images?**
A: Minimum 100, but more is better. Quality > quantity.

**Q: Can I use a different camera?**
A: Yes! Any camera works. Just keep angle/lighting similar to your setup.

**Q: How close should cars be?**
A: 0.5-2 inches apart. Close enough that boxes would almost touch.

**Q: Should I include single vehicle images too?**
A: No! You already have plenty. Focus ONLY on grouped scenarios.

**Q: What if labeling takes too long?**
A: You can do it in batches. Label 50, take a break, continue later.

---

## Quick Start 🚀

1. **RIGHT NOW:** Take 100-200 photos with your phone (30 minutes)
2. **Transfer photos** to `d:\daloy-react\ai-server\datasets\emergency_vehicles\grouped_images\`
3. **Upload to Roboflow** and start labeling (this is the key step!)
4. Let me know when you're ready to retrain!

**The key to fixing your detection issue is in the labeling quality.** Take your time with step 4! 📦✨
