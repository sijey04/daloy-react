# Arduino Traffic Light System - Testing & Integration Guide

## 🚦 Your Hardware Setup

Based on your screenshot, you have:
- **Arduino Uno**
- **Breadboard** with 12 LEDs (3 colors × 4 roads)
- **Resistors** for each LED
- **Wires** connecting everything

## 📋 Step-by-Step Testing Instructions

### **Step 1: Upload Test Code to Arduino**

1. **Open Arduino IDE**
   - If you don't have it, download from: https://www.arduino.cc/en/software
   - Install and open the application

2. **Connect Your Arduino**
   - Plug USB cable from Arduino to your computer
   - Wait for drivers to install (Windows will do this automatically)

3. **Configure Arduino IDE**
   - Go to `Tools` → `Board` → Select `Arduino Uno`
   - Go to `Tools` → `Port` → Select the COM port with your Arduino (e.g., COM3, COM4)

4. **Upload Test Code**
   - Open the file: `daloy-react/arduino/traffic_light_test.ino`
   - Click the **Upload** button (→ arrow icon)
   - Wait for "Done uploading" message

5. **Open Serial Monitor**
   - Click `Tools` → `Serial Monitor` (or Ctrl+Shift+M)
   - Set baud rate to `9600` (bottom right)
   - You should see test messages appearing

### **Step 2: Verify LED Connections**

The test code will automatically cycle through:

#### **Test Sequence:**
1. **Individual LED Test** (500ms each)
   - Each LED lights up one by one
   - Check which LEDs light up
   - Note any that don't work

2. **Traffic Light Sequence** (5-second cycles)
   - North-South: Green → Yellow → Red
   - East-West: Green → Yellow → Red
   - Road 3: Green → Yellow → Red
   - Road 4: Green → Yellow → Red

3. **All Red Mode** (3 seconds)
   - All red LEDs should be on
   - Others should be off

#### **What to Check:**
- ✅ Each LED lights up when expected
- ✅ LEDs turn off properly
- ✅ No LEDs flickering or dim
- ✅ Serial Monitor shows messages
- ❌ Note any missing or broken LEDs

### **Step 3: Verify Pin Connections**

Based on the code, your pins should be:

| Direction | Red Pin | Yellow Pin | Green Pin |
|-----------|---------|------------|-----------|
| North-South | 2 | 3 | 4 |
| East-West | 5 | 6 | 7 |
| Road 3 | 8 | 9 | 10 |
| Road 4 | 11 | 12 | 13 |

**If LEDs don't match:**
1. Check your breadboard wiring
2. Verify which pin each LED is connected to
3. Update the pin numbers in the Arduino code

### **Step 4: Test Serial Control**

Now upload the advanced control version:

1. **Upload Control Code**
   - Open: `daloy-react/arduino/traffic_light_control.ino`
   - Click Upload
   - Open Serial Monitor (9600 baud)

2. **Try Commands**
   - Type `HELP` and press Enter → See all commands
   - Type `TEST` and press Enter → Run LED test
   - Type `AUTO` and press Enter → Start automatic sequence
   - Type `STOP` and press Enter → All red
   - Type `STATUS` and press Enter → See current state

3. **Manual Control**
   - Type `NS_GREEN` → North-South turns green
   - Type `EW_RED` → East-West turns red
   - Type `R3_YELLOW` → Road 3 turns yellow
   - Type `ALL_RED` → All lights red

#### **Expected Output:**
```
Traffic Light Control System Ready
Type 'HELP' for commands

=== TRAFFIC LIGHT STATUS ===
Mode: STOPPED
North-South: RED
East-West: RED
Road 3: RED
Road 4: RED
===========================

Command received: HELP
=== AVAILABLE COMMANDS ===
TEST       - Test all LEDs
AUTO       - Start automatic sequence
...
```

## 🔧 Troubleshooting

### Problem: No LEDs Light Up
**Solutions:**
1. Check Arduino power (LED on board should be on)
2. Check USB connection
3. Verify code uploaded successfully
4. Check breadboard power connections

### Problem: Some LEDs Don't Work
**Solutions:**
1. Check LED polarity (long leg = positive)
2. Check resistor connections
3. Test LED directly with 5V
4. Verify pin connections match code

### Problem: LEDs Are Dim
**Solutions:**
1. Check resistor values (220Ω recommended)
2. Don't run too many LEDs simultaneously without external power
3. Check Arduino 5V pin current limit

### Problem: Serial Monitor Shows Nothing
**Solutions:**
1. Check baud rate is set to 9600
2. Verify correct COM port selected
3. Try unplugging and reconnecting Arduino
4. Restart Arduino IDE

### Problem: Wrong LEDs Light Up
**Solutions:**
1. Check which pin each LED is connected to
2. Update pin definitions in code:
   ```cpp
   const int NS_RED = 2;  // Change to your actual pin
   ```
3. Re-upload code

## 🔌 Integration with React App

### **Option A: Web Serial API (Chrome/Edge)**

This allows direct communication from browser to Arduino!

#### **Requirements:**
- Chrome or Edge browser (not Firefox)
- HTTPS or localhost
- Web Serial API support

#### **Test Connection:**

1. Keep Arduino connected via USB
2. Open Chrome browser
3. Press F12 → Console
4. Run this test:
   ```javascript
   // Check if Web Serial is supported
   if ("serial" in navigator) {
     console.log("Web Serial API supported!");
   } else {
     console.log("Web Serial API not supported");
   }
   ```

### **Option B: Node.js Bridge (Recommended)**

Use a Node.js server to communicate between React and Arduino.

#### **Install Dependencies:**
```bash
cd daloy-react
npm install serialport express cors
```

I can create the bridge server for you if you want this option!

### **Option C: Python Script Bridge**

Use Python to read Arduino and expose as API.

#### **Requirements:**
```bash
pip install pyserial flask flask-cors
```

## 📊 Current Pin Layout Summary

```
Arduino Uno
┌─────────────────┐
│  Digital Pins   │
│  2  → NS Red    │
│  3  → NS Yellow │
│  4  → NS Green  │
│  5  → EW Red    │
│  6  → EW Yellow │
│  7  → EW Green  │
│  8  → R3 Red    │
│  9  → R3 Yellow │
│  10 → R3 Green  │
│  11 → R4 Red    │
│  12 → R4 Yellow │
│  13 → R4 Green  │
│                 │
│  GND → Ground   │
│  5V  → Power    │
└─────────────────┘
```

## 🎯 Next Steps

### Immediate Testing:
1. ✅ Upload `traffic_light_test.ino`
2. ✅ Verify all 12 LEDs work
3. ✅ Upload `traffic_light_control.ino`
4. ✅ Test serial commands
5. ✅ Note your actual pin connections

### Integration Planning:
1. Decide on connection method (Web Serial vs Bridge)
2. Update React app to send commands
3. Add traffic light control UI
4. Synchronize with camera feeds

## 🚀 Quick Start Commands

### Arduino IDE:
```
1. Open Arduino IDE
2. File → Open → traffic_light_test.ino
3. Tools → Board → Arduino Uno
4. Tools → Port → COM3 (your port)
5. Click Upload (→)
6. Tools → Serial Monitor
7. Watch the magic happen! 🎉
```

### Serial Monitor Commands:
```
TEST         → Test all LEDs
AUTO         → Auto mode
STOP         → Emergency stop
NS_GREEN     → Manual control
STATUS       → Check status
HELP         → Show all commands
```

## 📸 What You Should See

### During Individual LED Test:
- One LED lights up at a time
- Each LED on for 500ms
- All 12 LEDs tested in sequence
- Serial Monitor shows which LED is being tested

### During Auto Mode:
- Realistic traffic light sequence
- One direction green at a time
- Yellow transition periods
- All other directions red
- Continuous cycle

### During Manual Mode:
- Direct control of each light
- Immediate response to commands
- Status feedback in Serial Monitor

## 💡 Tips

1. **Keep Serial Monitor Open** → See what Arduino is doing
2. **Note Working LEDs** → Update pin map if needed
3. **Test Commands First** → Before integrating with React
4. **Take Photos** → Document your wiring for reference
5. **Label Wires** → Makes debugging easier

## 🆘 Need Help?

Common issues and where to check:
- **No upload**: Check USB cable and port selection
- **No LEDs**: Check power and ground connections
- **Wrong LEDs**: Update pin numbers in code
- **No serial**: Check baud rate (9600)
- **Dim LEDs**: Check resistor values

---

## 📝 Current Status Checklist

Mark as you complete:
- [ ] Arduino IDE installed
- [ ] Arduino connected to PC
- [ ] Test code uploaded successfully
- [ ] Serial Monitor working
- [ ] All 12 LEDs tested
- [ ] Auto mode working
- [ ] Serial commands working
- [ ] Pin connections documented
- [ ] Ready for React integration

Once you complete testing, let me know which integration method you prefer and I'll create the bridge code!
