# Arduino Connection Test Script
# Use this to quickly test if Arduino is connected and responding

Write-Host "🔍 Testing Arduino Connection..." -ForegroundColor Cyan
Write-Host ""

$bridgeUrl = "http://localhost:3001/api"

# Test 1: Check if bridge server is running
Write-Host "Test 1: Checking bridge server..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$bridgeUrl/status" -Method Get -ErrorAction Stop
    Write-Host "✅ Bridge server is running" -ForegroundColor Green
    Write-Host "   Connected: $($response.connected)" -ForegroundColor White
    Write-Host "   Mode: $($response.status.mode)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "❌ Bridge server not responding!" -ForegroundColor Red
    Write-Host "   Start it with: cd arduino-bridge; node server.js" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Test 2: Check Arduino connection
if ($response.connected -eq $true) {
    Write-Host "✅ Arduino is connected!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Current Status:" -ForegroundColor Cyan
    Write-Host "   North-South: $($response.status.northSouth)" -ForegroundColor White
    Write-Host "   East-West: $($response.status.eastWest)" -ForegroundColor White
    Write-Host "   Road 3: $($response.status.road3)" -ForegroundColor White
    Write-Host "   Road 4: $($response.status.road4)" -ForegroundColor White
    Write-Host "   Mode: $($response.status.mode)" -ForegroundColor White
    Write-Host ""
    
    # Test 3: Send a test command
    Write-Host "Test 2: Sending TEST command to Arduino..." -ForegroundColor Yellow
    try {
        $testResponse = Invoke-RestMethod -Uri "$bridgeUrl/command" -Method Post -Body (@{command="TEST"} | ConvertTo-Json) -ContentType "application/json" -ErrorAction Stop
        Write-Host "✅ Command sent successfully!" -ForegroundColor Green
        Write-Host "   Watch your Arduino LEDs - they should all flash!" -ForegroundColor Cyan
        Write-Host ""
    } catch {
        Write-Host "⚠️  Failed to send command" -ForegroundColor Yellow
        Write-Host ""
    }
    
    Write-Host "🎉 All tests passed! Your system is ready." -ForegroundColor Green
    Write-Host ""
    Write-Host "Try these commands:" -ForegroundColor Cyan
    Write-Host "   Auto mode:     Invoke-RestMethod -Uri '$bridgeUrl/mode/AUTO' -Method Post" -ForegroundColor White
    Write-Host "   Stop mode:     Invoke-RestMethod -Uri '$bridgeUrl/mode/STOP' -Method Post" -ForegroundColor White
    Write-Host "   Set NS Green:  Invoke-RestMethod -Uri '$bridgeUrl/light/north-south/green' -Method Post" -ForegroundColor White
    Write-Host ""
    
} else {
    Write-Host "❌ Arduino not connected!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   1. Is Arduino plugged in via USB?" -ForegroundColor White
    Write-Host "   2. Is traffic_light_control.ino uploaded to Arduino?" -ForegroundColor White
    Write-Host "   3. Is Arduino IDE Serial Monitor closed?" -ForegroundColor White
    Write-Host "   4. Try unplugging and replugging the USB cable" -ForegroundColor White
    Write-Host "   5. Restart the bridge server" -ForegroundColor White
    Write-Host ""
}

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
