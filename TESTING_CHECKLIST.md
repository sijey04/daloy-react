# ✅ Testing Checklist - Real-Time Traffic Light System

Use this checklist to verify all features are working correctly.

---

## 🔧 Pre-Testing Setup

### Hardware Setup
- [ ] Arduino Uno connected via USB
- [ ] Arduino code uploaded (`traffic_light_control.ino`)
- [ ] COM port identified (check Device Manager)
- [ ] 12 LEDs wired to pins 2-13 (optional)
- [ ] USB cameras connected (optional)

### Software Setup
- [ ] Node.js installed
- [ ] npm dependencies installed (`npm install` in both root and arduino-bridge)
- [ ] Bridge server running (`node server.js`)
- [ ] React dev server running (`npm run dev`)
- [ ] Browser open at `http://localhost:5173`

---

## 🌐 Web Interface Tests

### Navigation & Layout
- [ ] Home page loads without errors
- [ ] Can navigate to camera detail page (`/camera/1`)
- [ ] Sidebar collapses/expands correctly
- [ ] Header displays correctly
- [ ] All tabs visible (Camera Inputs, Camera Settings, Traffic Lights)

### Camera Feed (Basic)
- [ ] Camera card displays
- [ ] "LIVE" indicator shows
- [ ] Camera name displays
- [ ] Status shows (Online/Offline)
- [ ] Fullscreen button visible
- [ ] Can click fullscreen button

### Fullscreen Modal
- [ ] Modal opens when clicking fullscreen
- [ ] Camera feed visible on left side
- [ ] Control panel visible on right side
- [ ] Two tabs present: PTZ Control, Traffic Lights
- [ ] Split-screen button visible (if 2+ cameras)
- [ ] Close button (X) works
- [ ] Navigation buttons visible at bottom (if 2+ cameras)

---

## 🚦 Traffic Light Tests

### Display & Status

#### In Fullscreen Modal
- [ ] Can switch to "Traffic Lights" tab
- [ ] "Real-Time Traffic Signals" heading visible
- [ ] Connection status indicator visible
- [ ] Green dot shows when Arduino connected
- [ ] "Arduino Connected" text displays
- [ ] 4 traffic light cards displayed (North, East, South, West)
- [ ] Each card shows:
  - [ ] Direction name
  - [ ] Animated colored circle (pulsing)
  - [ ] Current state chip (Green/Yellow/Red)
  - [ ] Time remaining counter
  - [ ] Cycle configuration (Green/Yellow/Red times)

### Real-Time Timer

- [ ] Timer displays current value (e.g., "28s")
- [ ] Timer counts down: 30 → 29 → 28 → 27...
- [ ] Timer updates every 1 second
- [ ] Timer value matches Arduino state
- [ ] Timer color is blue (#1976d2)
- [ ] Timer resets when state changes

### State Synchronization

- [ ] Light state matches Arduino:
  - [ ] North direction correct
  - [ ] East direction correct
  - [ ] South direction correct
  - [ ] West direction correct
- [ ] Animated circle color matches state
- [ ] State chip color matches state
- [ ] Box shadow color matches state
- [ ] Changes happen within 1 second of Arduino update

### Connection Monitoring

- [ ] Green dot when Arduino connected
- [ ] Red dot when Arduino disconnected
- [ ] Dot pulses when connected
- [ ] "Arduino Connected" text when connected
- [ ] "Arduino Disconnected" text when disconnected
- [ ] Auto-reconnects after ~5 seconds

---

## 🎮 Manual Control Tests

### In Main Page (Traffic Lights Tab)

- [ ] "Traffic Light Settings" section visible
- [ ] Mode selector dropdown present
- [ ] Can select "Manual Control" mode
- [ ] Manual control buttons appear for each direction
- [ ] Three buttons per direction: Red, Yellow, Green

### Button Functionality

#### North Direction
- [ ] Red button clickable
- [ ] Yellow button clickable
- [ ] Green button clickable
- [ ] Click sends command to Arduino
- [ ] Arduino LED responds (if wired)
- [ ] Fullscreen modal updates instantly
- [ ] Timer resets to appropriate duration
- [ ] State indicator changes color

#### East Direction
- [ ] Red button works
- [ ] Yellow button works
- [ ] Green button works
- [ ] Updates in real-time

#### South Direction
- [ ] Red button works
- [ ] Yellow button works
- [ ] Green button works
- [ ] Updates in real-time

#### West Direction
- [ ] Red button works
- [ ] Yellow button works
- [ ] Green button works
- [ ] Updates in real-time

### Button Styling
- [ ] Buttons color-coded (Red=#f44336, Yellow=#ff9800, Green=#67AE6E)
- [ ] Active button shows "contained" variant
- [ ] Inactive buttons show "outlined" variant
- [ ] Hover effects work
- [ ] Click feedback visible

---

## 🤖 Automatic Mode Tests

### Mode Activation
- [ ] Can select "AI-Optimized (Automatic)" mode
- [ ] Mode change sends command to Arduino
- [ ] Arduino enters AUTO mode
- [ ] Lights start cycling automatically

### Automatic Cycling
- [ ] Lights cycle in sequence
- [ ] North goes Green → Yellow → Red
- [ ] East goes Green → Yellow → Red
- [ ] South goes Green → Yellow → Red
- [ ] West goes Green → Yellow → Red
- [ ] Only one road green at a time (safety check)
- [ ] Yellow appears between green and red
- [ ] Cycle repeats continuously

### Display During Auto Mode
- [ ] Fullscreen timer counts down correctly
- [ ] State changes reflect in real-time
- [ ] Timer resets at each state change
- [ ] All 4 directions update synchronously
- [ ] Animations work smoothly

---

## 🔄 WebSocket Tests

### Connection Establishment
- [ ] WebSocket connects on page load
- [ ] Console shows "✅ WebSocket connected" message
- [ ] Status updates received immediately
- [ ] No errors in browser console

### Real-Time Updates
- [ ] Changes in Arduino → Display updates within 500ms
- [ ] Multiple state changes handled correctly
- [ ] No lag or delay noticeable
- [ ] Updates smooth and consistent

### Reconnection
- [ ] Stop bridge server → Red dot appears
- [ ] Restart bridge server → Green dot returns
- [ ] Reconnects automatically within 5 seconds
- [ ] No page refresh needed
- [ ] Sync resumes after reconnection

### Error Handling
- [ ] No WebSocket errors in console
- [ ] Handles disconnection gracefully
- [ ] Displays connection status correctly
- [ ] Retries connection on failure

---

## 🧪 Advanced Tests

### Multiple Cameras
- [ ] Split-screen button visible
- [ ] Click split-screen → Two cameras side-by-side
- [ ] Active camera has blue border
- [ ] Can click either camera to focus
- [ ] Navigation buttons disabled in split-screen
- [ ] Exit split-screen works

### PTZ Controls (Fullscreen)
- [ ] PTZ Control tab accessible
- [ ] Pan slider works (0-360°)
- [ ] Tilt slider works (-90 to +90°)
- [ ] Zoom slider works (1.0-5.0x)
- [ ] Rotation speed slider works (1-20)
- [ ] Directional buttons work
- [ ] Home button resets position
- [ ] Values display correctly

### Timing Configuration
- [ ] Green duration slider (15-60s)
- [ ] Yellow duration slider (3-8s)
- [ ] Red duration slider (30-80s)
- [ ] Values update in real-time
- [ ] "Apply All Changes" button present
- [ ] Click sends configuration to Arduino
- [ ] Arduino applies new timings

### Emergency Override
- [ ] Can select "Emergency Override" mode
- [ ] All lights turn red immediately
- [ ] Fullscreen displays all red
- [ ] Arduino responds instantly
- [ ] Safety maintained

---

## 🐛 Error Handling Tests

### Bridge Server Down
- [ ] Red connection indicator
- [ ] Manual buttons show error alert
- [ ] Timer continues locally (graceful degradation)
- [ ] No crashes or freezes
- [ ] Clear error messages

### Arduino Disconnected
- [ ] Red connection indicator
- [ ] "Arduino Disconnected" message
- [ ] UI remains functional
- [ ] Can still interact with controls
- [ ] Reconnects when Arduino plugged back in

### Serial Port Busy
- [ ] Upload Arduino code → Bridge server stops
- [ ] Connection indicator turns red
- [ ] Error message in bridge server logs
- [ ] Reconnects after upload complete

### Network Issues
- [ ] WebSocket handles network errors
- [ ] Auto-reconnect on network restore
- [ ] No data corruption
- [ ] State sync resumes correctly

---

## 📊 Performance Tests

### Response Time
- [ ] Button click → Arduino response: <500ms
- [ ] Arduino change → Display update: <500ms
- [ ] Timer accuracy: ±1 second
- [ ] WebSocket latency: <200ms

### CPU & Memory
- [ ] React app CPU usage: <5%
- [ ] Bridge server CPU usage: <2%
- [ ] Browser memory: <200MB
- [ ] No memory leaks over time

### Stress Tests
- [ ] Rapid button clicking handled correctly
- [ ] Multiple state changes in quick succession
- [ ] Long-running session (30+ minutes)
- [ ] No degradation over time

---

## 📱 Cross-Browser Tests

### Desktop Browsers
- [ ] Chrome/Edge (Chromium) works
- [ ] Firefox works
- [ ] Safari works (Mac)
- [ ] All features functional across browsers

### Responsive Design
- [ ] Desktop layout (1920x1080)
- [ ] Laptop layout (1366x768)
- [ ] Tablet layout (768x1024)
- [ ] Mobile layout (375x667)

---

## 📸 Visual Tests

### Animations
- [ ] Pulse animation on active lights (2s cycle)
- [ ] Smooth fade transitions
- [ ] Glow effects on state indicators
- [ ] Loading spinners animate correctly

### Colors
- [ ] Green: #67AE6E (correct)
- [ ] Yellow: #ff9800 (correct)
- [ ] Red: #f44336 (correct)
- [ ] Blue timer: #1976d2 (correct)
- [ ] Box shadows match colors

### Typography
- [ ] All text readable
- [ ] Font sizes appropriate
- [ ] No text overflow
- [ ] Line heights correct

---

## 🔒 Safety Tests

### Traffic Safety
- [ ] Only one road green at time
- [ ] Yellow always between green→red
- [ ] All red state possible
- [ ] Emergency override works instantly
- [ ] No conflicting green lights

### Code Safety
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No React warnings
- [ ] Proper error boundaries

---

## 📋 Final Checklist

### Documentation
- [ ] README.md updated
- [ ] All guide documents created
- [ ] API documented
- [ ] Code comments present

### Code Quality
- [ ] ESLint passes
- [ ] TypeScript compiles without errors
- [ ] No unused variables
- [ ] Proper type definitions

### Deployment Ready
- [ ] Build succeeds (`npm run build`)
- [ ] Preview works (`npm run preview`)
- [ ] All assets load correctly
- [ ] Production mode tested

---

## 🎉 Success Criteria

**System is ready when:**

✅ All hardware tests pass  
✅ All web interface tests pass  
✅ All traffic light tests pass  
✅ All manual control tests pass  
✅ All automatic mode tests pass  
✅ All WebSocket tests pass  
✅ All advanced tests pass  
✅ All error handling tests pass  
✅ All performance tests pass  
✅ All safety tests pass  

**Total Tests:** ~150+

**Passed:** _____ / _____

**Issues Found:** _____________________________________________

**Notes:** ___________________________________________________

---

## 🐛 Issue Tracking Template

**Issue #:** ___  
**Category:** [ ] Hardware [ ] Software [ ] UI [ ] Performance  
**Severity:** [ ] Critical [ ] High [ ] Medium [ ] Low  
**Description:** ______________________________________________  
**Steps to Reproduce:** ______________________________________  
**Expected Result:** _________________________________________  
**Actual Result:** ___________________________________________  
**Fix Applied:** _____________________________________________  
**Verified:** [ ] Yes [ ] No  

---

**Testing Date:** ______________  
**Tester:** ___________________  
**Version:** __________________  
**Environment:** Windows / Mac / Linux  
**Status:** [ ] Pass [ ] Fail [ ] Partial  

---

Good luck testing! 🚀✨
