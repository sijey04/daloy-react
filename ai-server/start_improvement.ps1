# Quick Start Script for Model Improvement
# Run this script to get started with improving toy car detection

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚗 TOY CAR DETECTION IMPROVEMENT WIZARD" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
Write-Host "🔍 Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python installed: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found! Please install Python 3.8-3.11" -ForegroundColor Red
    Write-Host "   Download from: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "OPTION 1: Apply Immediate Improvements (DONE ✅)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Image preprocessing added" -ForegroundColor Green
Write-Host "✅ Optimized detection parameters" -ForegroundColor Green
Write-Host "✅ Basic orientation estimation" -ForegroundColor Green
Write-Host ""
Write-Host "To test these improvements:" -ForegroundColor Yellow
Write-Host "   cd ai-server" -ForegroundColor White
Write-Host "   python app.py" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "OPTION 2: Train Custom Model (NEXT STEPS)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$choice = Read-Host "Would you like to start custom model training? (y/n)"

if ($choice -eq 'y' -or $choice -eq 'Y') {
    Write-Host ""
    Write-Host "📋 TRAINING WORKFLOW:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Phase 1: Data Collection (1-2 hours)" -ForegroundColor Yellow
    Write-Host "  Step 1: Collect 200+ images of toy cars" -ForegroundColor White
    Write-Host "          - 50+ images per angle (front/back/left/right)" -ForegroundColor Gray
    Write-Host "          - Different lighting and backgrounds" -ForegroundColor Gray
    Write-Host "  Command: python collect_dataset.py" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Phase 2: Dataset Preparation (30 minutes)" -ForegroundColor Yellow
    Write-Host "  Step 2: Prepare and split dataset" -ForegroundColor White
    Write-Host "  Command: python prepare_dataset.py" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Phase 3: Image Labeling (1-3 hours)" -ForegroundColor Yellow
    Write-Host "  Step 3: Label images with bounding boxes" -ForegroundColor White
    Write-Host "          Option A: Use Roboflow (https://roboflow.com)" -ForegroundColor Gray
    Write-Host "          Option B: Use labelImg locally" -ForegroundColor Gray
    Write-Host "  Command: pip install labelImg && labelImg" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Phase 4: Training (2-6 hours)" -ForegroundColor Yellow
    Write-Host "  Step 4: Train custom model" -ForegroundColor White
    Write-Host "  Command: python train_custom_model.py" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Phase 5: Testing (15 minutes)" -ForegroundColor Yellow
    Write-Host "  Step 5: Test the trained model" -ForegroundColor White
    Write-Host "  Command: python test_model.py" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "📚 Detailed guide available in:" -ForegroundColor Green
    Write-Host "   ai-server/TRAINING_GUIDE.md" -ForegroundColor White
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    $startNow = Read-Host "Start data collection now? (y/n)"
    
    if ($startNow -eq 'y' -or $startNow -eq 'Y') {
        Write-Host ""
        Write-Host "🚀 Starting data collection tool..." -ForegroundColor Green
        Write-Host ""
        Set-Location ai-server
        python collect_dataset.py
    } else {
        Write-Host ""
        Write-Host "👍 No problem! When you're ready:" -ForegroundColor Yellow
        Write-Host "   1. cd ai-server" -ForegroundColor White
        Write-Host "   2. python collect_dataset.py" -ForegroundColor White
        Write-Host "   3. Follow the prompts" -ForegroundColor White
        Write-Host ""
        Write-Host "📖 See TRAINING_GUIDE.md for full instructions" -ForegroundColor Cyan
    }
} else {
    Write-Host ""
    Write-Host "✅ Immediate improvements are already applied!" -ForegroundColor Green
    Write-Host ""
    Write-Host "To use them:" -ForegroundColor Yellow
    Write-Host "   1. cd ai-server" -ForegroundColor White
    Write-Host "   2. python app.py" -ForegroundColor White
    Write-Host "   3. Test with your toy cars" -ForegroundColor White
    Write-Host ""
    Write-Host "For custom model training later:" -ForegroundColor Cyan
    Write-Host "   - Read ai-server/TRAINING_GUIDE.md" -ForegroundColor White
    Write-Host "   - Run this script again" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📊 CURRENT STATUS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Option 3: Immediate improvements - APPLIED" -ForegroundColor Green
Write-Host "⏳ Option 1: Custom model training - READY" -ForegroundColor Yellow
Write-Host ""
Write-Host "Expected accuracy improvement:" -ForegroundColor Yellow
Write-Host "  Current (Option 3): 60-75%" -ForegroundColor White
Write-Host "  After training (Option 1): 85-95%" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
