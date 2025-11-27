# GPU Setup Script for GTX 1650 - Install to D: Drive
# Run this to enable GPU acceleration using D: drive for downloads

Write-Host ("="*80) -ForegroundColor Cyan
Write-Host "GPU ACCELERATION SETUP FOR GTX 1650 (D: Drive)" -ForegroundColor Green
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
$torchInstalled = python -c "import torch; print(torch.__version__)" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Current PyTorch: $torchInstalled" -ForegroundColor Cyan
    
    if ($torchInstalled -like "*+cpu*") {
        Write-Host "CPU-only version detected!" -ForegroundColor Yellow
    } else {
        Write-Host "GPU version detected" -ForegroundColor Green
    }
    
    # Check CUDA availability
    $cudaAvailable = python -c "import torch; print(torch.cuda.is_available())"
    Write-Host "CUDA Available: $cudaAvailable" -ForegroundColor Cyan
    
    if ($cudaAvailable -eq "True") {
        Write-Host "`nGPU is already enabled!" -ForegroundColor Green
        $gpuName = python -c "import torch; print(torch.cuda.get_device_name(0))"
        Write-Host "Using: $gpuName" -ForegroundColor Cyan
        Write-Host "`nNo installation needed!" -ForegroundColor Green
        exit 0
    }
} else {
    Write-Host "PyTorch not installed" -ForegroundColor Yellow
}

Write-Host "`nYour GPU is not being used! Lets fix this..." -ForegroundColor Yellow

# Create temp directory on D: drive
$tempDir = "D:\pytorch_temp"
if (-not (Test-Path $tempDir)) {
    New-Item -ItemType Directory -Path $tempDir | Out-Null
    Write-Host "Created temporary directory: $tempDir" -ForegroundColor Cyan
}

Write-Host "`nStep 2: Uninstalling CPU-only PyTorch..." -ForegroundColor Yellow
pip uninstall torch torchvision torchaudio -y

Write-Host "`nStep 3: Installing PyTorch with CUDA support..." -ForegroundColor Yellow
Write-Host "Using D: drive for downloads (about 2.8GB)..." -ForegroundColor Cyan
Write-Host "This may take 5-10 minutes depending on your internet speed..." -ForegroundColor Cyan

# Set pip cache to D: drive and install
$env:PIP_CACHE_DIR = "$tempDir\pip_cache"
$env:TMPDIR = $tempDir
$env:TEMP = $tempDir
$env:TMP = $tempDir

# Install CUDA 11.8 version (most compatible with GTX 1650)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118 --cache-dir "$tempDir\pip_cache"

Write-Host "`nStep 4: Verifying GPU installation..." -ForegroundColor Yellow
python -c "import torch; print('CUDA Available:', torch.cuda.is_available()); print('GPU:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'None')"

$cudaCheck = python -c "import torch; print(torch.cuda.is_available())"
if ($cudaCheck -eq "True") {
    Write-Host "`nGPU setup complete!" -ForegroundColor Green
    $gpuName = python -c "import torch; print(torch.cuda.get_device_name(0))"
    Write-Host "Successfully installed PyTorch with CUDA support" -ForegroundColor Green
    Write-Host "GPU detected: $gpuName" -ForegroundColor Cyan
    
    Write-Host "`nExpected performance improvement:" -ForegroundColor Yellow
    Write-Host "Before: 150-200ms per frame (5-7 FPS)" -ForegroundColor White
    Write-Host "After:  10-20ms per frame (50-100 FPS)" -ForegroundColor Green
    
    Write-Host "`nCleaning up temporary files..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue
    
} else {
    Write-Host "`nInstallation completed but GPU not detected!" -ForegroundColor Red
    Write-Host "This might be a CUDA version mismatch." -ForegroundColor Yellow
    Write-Host "Your CUDA version (from nvidia-smi): Check output above" -ForegroundColor Yellow
    Write-Host "Try installing for CUDA 12.1 if you have CUDA 12.x:" -ForegroundColor Yellow
    Write-Host "pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121 --cache-dir D:\pytorch_temp\pip_cache" -ForegroundColor Cyan
}

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Close the current AI server with Ctrl+C" -ForegroundColor White
Write-Host "2. Restart it: python app.py" -ForegroundColor White
Write-Host "3. Look for 'GPU (CUDA)' in the startup message" -ForegroundColor White
Write-Host "4. You should see 'GeForce GTX 1650' in the output" -ForegroundColor White

Write-Host "`n" ("="*80) -ForegroundColor Cyan
