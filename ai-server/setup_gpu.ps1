# GPU Setup Script for GTX 1650
# Run this to enable GPU acceleration

Write-Host ("="*80) -ForegroundColor Cyan
Write-Host "GPU ACCELERATION SETUP FOR GTX 1650" -ForegroundColor Green
Write-Host ("="*80) -ForegroundColor Cyan

Write-Host "`nStep 1: Checking current setup..." -ForegroundColor Yellow

# Check if NVIDIA GPU is present
Write-Host "`nChecking for NVIDIA GPU..."
nvidia-smi
if ($LASTEXITCODE -ne 0) {
    Write-Host "nvidia-smi not found. Please install NVIDIA drivers first!" -ForegroundColor Red
    Write-Host "Download from: https://www.nvidia.com/Download/index.aspx" -ForegroundColor Yellow
    exit 1
}

# Check current PyTorch version
Write-Host "`nChecking current PyTorch installation..."
$torchVersion = python -c "import torch; print(torch.__version__)"
Write-Host "Current PyTorch: $torchVersion" -ForegroundColor Cyan

if ($torchVersion -like "*+cpu*") {
    Write-Host "CPU-only version detected!" -ForegroundColor Yellow
} else {
    Write-Host "GPU version detected" -ForegroundColor Green
}

# Check CUDA availability
$cudaAvailable = python -c "import torch; print(torch.cuda.is_available())"
Write-Host "CUDA Available: $cudaAvailable" -ForegroundColor Cyan

if ($cudaAvailable -eq "False") {
    Write-Host "`nYour GPU is not being used! Lets fix this..." -ForegroundColor Yellow
    
    Write-Host "`nStep 2: Uninstalling CPU-only PyTorch..." -ForegroundColor Yellow
    pip uninstall torch torchvision torchaudio -y
    
    Write-Host "`nStep 3: Installing PyTorch with CUDA support..." -ForegroundColor Yellow
    Write-Host "This will download about 2GB of files..." -ForegroundColor Cyan
    
    # Install CUDA 11.8 version (most compatible)
    pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
    
    Write-Host "`nStep 4: Verifying GPU installation..." -ForegroundColor Yellow
    python -c "import torch; print('CUDA:', torch.cuda.is_available()); print('GPU:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'None')"
    
    Write-Host "`nGPU setup complete!" -ForegroundColor Green
    Write-Host "`nExpected performance improvement:" -ForegroundColor Yellow
    Write-Host "Before: 150-200ms per frame (5-7 FPS)" -ForegroundColor White
    Write-Host "After:  10-20ms per frame (50-100 FPS)" -ForegroundColor Green
    
} else {
    Write-Host "`nGPU is already enabled!" -ForegroundColor Green
    $gpuName = python -c "import torch; print(torch.cuda.get_device_name(0))"
    Write-Host "Using: $gpuName" -ForegroundColor Cyan
}

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Close the current AI server with Ctrl+C" -ForegroundColor White
Write-Host "2. Restart it: python app.py" -ForegroundColor White
Write-Host "3. Look for GPU CUDA in the startup message" -ForegroundColor White

Write-Host "`n" ("="*80) -ForegroundColor Cyan
