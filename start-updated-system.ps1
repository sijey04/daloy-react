# Quick Start Script for Updated System

Write-Host "=== Daloy Traffic System - Quick Start ===" -ForegroundColor Cyan
Write-Host ""

# Check if Arduino bridge is running
$bridgeRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        $bridgeRunning = $true
    }
} catch {
    $bridgeRunning = $false
}

if ($bridgeRunning) {
    Write-Host "✅ Arduino Bridge already running on port 3001" -ForegroundColor Green
} else {
    Write-Host "⚠️  Arduino Bridge not detected" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Starting Arduino Bridge Server..." -ForegroundColor Cyan
    
    # Start bridge server in new window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\arduino-bridge'; Write-Host '🚀 Starting Arduino Bridge...' -ForegroundColor Cyan; node server.js"
    
    Write-Host "Waiting for bridge to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
}

Write-Host ""
Write-Host "Starting React Development Server..." -ForegroundColor Cyan

# Start React app
npm run dev
