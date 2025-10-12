# Quick Start Script for Arduino Traffic Light System
# Run this to start both the React app and Arduino bridge server

Write-Host "🚦 Starting Traffic Light Control System..." -ForegroundColor Green
Write-Host ""

# Check if node_modules exists in arduino-bridge
if (-not (Test-Path ".\arduino-bridge\node_modules")) {
    Write-Host "📦 Installing bridge server dependencies..." -ForegroundColor Yellow
    Set-Location arduino-bridge
    npm install
    Set-Location ..
    Write-Host "✅ Dependencies installed!" -ForegroundColor Green
    Write-Host ""
}

# Start Arduino bridge server in new terminal
Write-Host "🌉 Starting Arduino Bridge Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\arduino-bridge'; Write-Host '🌉 Arduino Bridge Server' -ForegroundColor Cyan; node server.js"

# Wait a moment for bridge server to start
Start-Sleep -Seconds 2

# Start React dev server in new terminal
Write-Host "⚛️  Starting React Development Server..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host '⚛️  React Development Server' -ForegroundColor Blue; npm run dev"

Write-Host ""
Write-Host "✅ System starting up!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Quick Reference:" -ForegroundColor Yellow
Write-Host "   React App: http://localhost:5173" -ForegroundColor White
Write-Host "   Bridge API: http://localhost:3001" -ForegroundColor White
Write-Host "   WebSocket: ws://localhost:3002" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Make sure your Arduino is:" -ForegroundColor Yellow
Write-Host "   1. Connected via USB" -ForegroundColor White
Write-Host "   2. Has traffic_light_control.ino uploaded" -ForegroundColor White
Write-Host "   3. Arduino IDE Serial Monitor is CLOSED" -ForegroundColor White
Write-Host ""
Write-Host "📖 For detailed setup instructions, see:" -ForegroundColor Cyan
Write-Host "   ARDUINO_INTEGRATION_GUIDE.md" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
