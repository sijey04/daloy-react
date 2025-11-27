# GPU Installation Guide for GTX 1650
# This will enable your GPU for MUCH faster detection (10-20x speedup!)

## Step 1: Check your CUDA version
# Open PowerShell and run:
nvidia-smi

# Look for "CUDA Version: X.X" in the output
# GTX 1650 typically supports CUDA 11.x or 12.x

## Step 2: Uninstall CPU-only PyTorch
pip uninstall torch torchvision torchaudio

## Step 3: Install PyTorch with CUDA support
# For CUDA 11.8 (most compatible):
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# OR for CUDA 12.1 (if your nvidia-smi shows 12.x):
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

## Step 4: Verify GPU is detected
python -c "import torch; print('CUDA Available:', torch.cuda.is_available()); print('GPU Name:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'None')"

## Step 5: Restart the AI server
cd d:\daloy-react\ai-server
python app.py

# You should now see "Using device: GPU (CUDA)" and "GeForce GTX 1650"

## Expected Speed Improvement:
# Before (CPU): ~150-200ms per frame (5-7 FPS)
# After (GPU):  ~10-20ms per frame (50-100 FPS) 🚀

## Troubleshooting:
# If it still shows CPU:
# 1. Make sure NVIDIA drivers are up to date
# 2. Check CUDA toolkit is installed: https://developer.nvidia.com/cuda-downloads
# 3. Try rebooting after installation
