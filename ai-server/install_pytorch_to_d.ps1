# Install PyTorch to D: Drive Completely
# This will install everything to D: drive, not C: drive

Write-Host ("="*80) -ForegroundColor Cyan
Write-Host "INSTALLING PYTORCH TO D: DRIVE" -ForegroundColor Green
Write-Host ("="*80) -ForegroundColor Cyan

# Create installation directory on D: drive
$installDir = "D:\Python_Packages"
$cacheDir = "D:\pytorch_temp\pip_cache"

if (-not (Test-Path $installDir)) {
    New-Item -ItemType Directory -Path $installDir | Out-Null
    Write-Host "Created installation directory: $installDir" -ForegroundColor Cyan
}

if (-not (Test-Path $cacheDir)) {
    New-Item -ItemType Directory -Path $cacheDir | Out-Null
    Write-Host "Created cache directory: $cacheDir" -ForegroundColor Cyan
}

Write-Host "`nChecking GPU..." -ForegroundColor Yellow
nvidia-smi | Select-String "CUDA Version"

Write-Host "`nUninstalling old PyTorch..." -ForegroundColor Yellow
pip uninstall torch torchvision torchaudio -y

Write-Host "`nInstalling PyTorch with CUDA to D: drive..." -ForegroundColor Yellow
Write-Host "Installation directory: $installDir" -ForegroundColor Cyan
Write-Host "This will download and install about 2.8GB to D: drive" -ForegroundColor Cyan
Write-Host "Please wait 5-10 minutes..." -ForegroundColor Yellow

# Install to D: drive with target directory
pip install torch torchvision torchaudio `
    --index-url https://download.pytorch.org/whl/cu118 `
    --target $installDir `
    --cache-dir $cacheDir `
    --no-warn-script-location

Write-Host "`nAdding D: drive to Python path..." -ForegroundColor Yellow

# Add to Python path for current session
$env:PYTHONPATH = "$installDir;$env:PYTHONPATH"

# Create a batch file to permanently add to path
$batchContent = @"
@echo off
REM Add D:\Python_Packages to Python path
set PYTHONPATH=D:\Python_Packages;%PYTHONPATH%
"@

$batchContent | Out-File -FilePath "D:\daloy-react\ai-server\set_python_path.bat" -Encoding ASCII
Write-Host "Created batch file: D:\daloy-react\ai-server\set_python_path.bat" -ForegroundColor Cyan

# Create a PowerShell profile script
$psContent = @"
# Add PyTorch from D: drive to Python path
`$env:PYTHONPATH = "D:\Python_Packages;`$env:PYTHONPATH"
"@

$psContent | Out-File -FilePath "D:\daloy-react\ai-server\set_python_path.ps1" -Encoding UTF8
Write-Host "Created PowerShell script: D:\daloy-react\ai-server\set_python_path.ps1" -ForegroundColor Cyan

Write-Host "`nVerifying installation..." -ForegroundColor Yellow
$result = python -c "import sys; sys.path.insert(0, 'D:\\Python_Packages'); import torch; print('PyTorch Version:', torch.__version__); print('CUDA Available:', torch.cuda.is_available()); print('GPU:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'None')"

Write-Host $result -ForegroundColor Green

$cudaCheck = python -c "import sys; sys.path.insert(0, 'D:\\Python_Packages'); import torch; print(torch.cuda.is_available())"

if ($cudaCheck -eq "True") {
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "SUCCESS! GPU ENABLED!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    
    Write-Host "`nIMPORTANT: To use the GPU, you need to run this before starting the server:" -ForegroundColor Yellow
    Write-Host ".\set_python_path.ps1" -ForegroundColor Cyan
    Write-Host "python app.py" -ForegroundColor Cyan
    
    Write-Host "`nOr in one line:" -ForegroundColor Yellow
    Write-Host ". .\set_python_path.ps1; python app.py" -ForegroundColor Cyan
    
} else {
    Write-Host "`nInstallation completed but GPU not detected" -ForegroundColor Red
    Write-Host "You have CUDA 12.9 but we installed for CUDA 11.8" -ForegroundColor Yellow
    Write-Host "`nTrying CUDA 12.1 version..." -ForegroundColor Yellow
    
    pip install torch torchvision torchaudio `
        --index-url https://download.pytorch.org/whl/cu121 `
        --target $installDir `
        --cache-dir $cacheDir `
        --no-warn-script-location `
        --upgrade
    
    Write-Host "`nVerifying again..." -ForegroundColor Yellow
    python -c "import sys; sys.path.insert(0, 'D:\\Python_Packages'); import torch; print('CUDA Available:', torch.cuda.is_available()); print('GPU:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'None')"
}

Write-Host "`n" ("="*80) -ForegroundColor Cyan
Write-Host "Installation complete!" -ForegroundColor Green
Write-Host "PyTorch is installed to: $installDir" -ForegroundColor Cyan
Write-Host ("="*80) -ForegroundColor Cyan
