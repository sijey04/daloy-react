const express = require('express');
const cors = require('cors');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const WebSocket = require('ws');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');

const app = express();
const PORT = 3001;

// AI Server configuration
const AI_SERVER_URL = 'http://localhost:5000';

// Multer configuration for file uploads (store in memory)
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json());

// Arduino connection
let port = null;
let parser = null;
let isConnected = false;
let currentStatus = {
  northSouth: 'RED',
  eastWest: 'RED',
  road3: 'RED',
  road4: 'RED',
  mode: 'STOPPED'
};

// WebSocket server for real-time updates
const wss = new WebSocket.Server({ port: 3002 });

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  ws.send(JSON.stringify({ type: 'status', data: currentStatus }));
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// Broadcast status to all connected clients
function broadcastStatus() {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'status', data: currentStatus }));
    }
  });
}

// Find and connect to Arduino
async function connectArduino() {
  try {
    const ports = await SerialPort.list();
    console.log('Available ports:', ports);
    
    // Find Arduino (usually has "Arduino" in manufacturer)
    const arduinoPort = ports.find(p => 
      p.manufacturer && p.manufacturer.includes('Arduino')
    ) || ports[0]; // Fallback to first port
    
    if (!arduinoPort) {
      throw new Error('No Arduino found');
    }
    
    console.log('Connecting to:', arduinoPort.path);
    
    port = new SerialPort({
      path: arduinoPort.path,
      baudRate: 9600
    });
    
    parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));
    
    port.on('open', () => {
      console.log('✅ Arduino connected successfully!');
      isConnected = true;
    });
    
    port.on('error', (err) => {
      console.error('Serial port error:', err);
      isConnected = false;
    });
    
    port.on('close', () => {
      console.log('Arduino disconnected');
      isConnected = false;
    });
    
    // Listen for Arduino messages
    parser.on('data', (data) => {
      console.log('Arduino:', data);
      parseArduinoMessage(data);
    });
    
    // Poll Arduino status every 2 seconds
    setInterval(() => {
      if (isConnected && port && port.isOpen) {
        port.write('STATUS\n', (err) => {
          if (err) {
            console.error('Failed to poll status:', err);
          }
        });
      }
    }, 2000);
    
    return true;
  } catch (error) {
    console.error('Failed to connect to Arduino:', error);
    return false;
  }
}

// Parse Arduino messages and update status
function parseArduinoMessage(message) {
  // Handle old verbose format (for backward compatibility)
  if (message.includes('North-South set to')) {
    currentStatus.northSouth = message.split('set to ')[1];
    broadcastStatus();
  } else if (message.includes('East-West set to')) {
    currentStatus.eastWest = message.split('set to ')[1];
    broadcastStatus();
  } else if (message.includes('Road 3 set to')) {
    currentStatus.road3 = message.split('set to ')[1];
    broadcastStatus();
  } else if (message.includes('Road 4 set to')) {
    currentStatus.road4 = message.split('set to ')[1];
    broadcastStatus();
  } 
  // Handle new compact STATUS format: "NS: R EW: Y R3: G R4: R"
  else if (message.includes('NS:') && message.includes('EW:')) {
    const parts = message.split(/\s+/);
    for (let i = 0; i < parts.length - 1; i++) {
      if (parts[i] === 'NS:') {
        currentStatus.northSouth = expandColor(parts[i + 1]);
      } else if (parts[i] === 'EW:') {
        currentStatus.eastWest = expandColor(parts[i + 1]);
      } else if (parts[i] === 'R3:') {
        currentStatus.road3 = expandColor(parts[i + 1]);
      } else if (parts[i] === 'R4:') {
        currentStatus.road4 = expandColor(parts[i + 1]);
      }
    }
    broadcastStatus();
  }
  // Handle Mode line from STATUS output
  else if (message.includes('Mode:')) {
    const mode = message.split('Mode: ')[1]?.trim();
    if (mode) {
      currentStatus.mode = mode;
      broadcastStatus();
    }
  }
  // Handle AUTO mode updates (optional, if Arduino sends these)
  else if (message.includes('AUTO:')) {
    // Example: "AUTO: NS GREEN" or "AUTO: EW YELLOW"
    const parts = message.split(/\s+/);
    if (parts.length >= 3) {
      const roadCode = parts[1];
      const color = parts[2];
      updateStatusByRoadCode(roadCode, color);
      broadcastStatus();
    }
  }
}

// Helper: Convert single char to full color name
function expandColor(char) {
  const colorMap = {
    'R': 'RED',
    'Y': 'YELLOW',
    'G': 'GREEN',
    '-': 'OFF'
  };
  return colorMap[char] || 'UNKNOWN';
}

// Helper: Update status by road code
function updateStatusByRoadCode(roadCode, color) {
  const roadMap = {
    'NS': 'northSouth',
    'North-South': 'northSouth',
    'EW': 'eastWest',
    'East-West': 'eastWest',
    'R3': 'road3',
    'Road': 'road3',
    'R4': 'road4'
  };
  
  const statusKey = roadMap[roadCode];
  if (statusKey) {
    currentStatus[statusKey] = color.toUpperCase();
  }
}

// Send command to Arduino
function sendCommand(command) {
  return new Promise((resolve, reject) => {
    if (!isConnected || !port) {
      reject(new Error('Arduino not connected'));
      return;
    }
    
    port.write(command + '\n', (err) => {
      if (err) {
        reject(err);
      } else {
        console.log('Sent command:', command);
        resolve();
      }
    });
  });
}

// API Routes

// Get connection status
app.get('/api/status', (req, res) => {
  res.json({
    connected: isConnected,
    status: currentStatus
  });
});

// Get list of available ports
app.get('/api/ports', async (req, res) => {
  try {
    const ports = await SerialPort.list();
    res.json(ports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Connect to Arduino
app.post('/api/connect', async (req, res) => {
  try {
    const success = await connectArduino();
    res.json({ success, connected: isConnected });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send command to Arduino
app.post('/api/command', async (req, res) => {
  const { command } = req.body;
  
  if (!command) {
    return res.status(400).json({ error: 'Command is required' });
  }
  
  try {
    await sendCommand(command);
    res.json({ success: true, command });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Convenience routes for common commands

// Set traffic light mode
app.post('/api/mode/:mode', async (req, res) => {
  const { mode } = req.params;
  const validModes = ['AUTO', 'STOP', 'TEST'];
  
  if (!validModes.includes(mode.toUpperCase())) {
    return res.status(400).json({ error: 'Invalid mode' });
  }
  
  try {
    await sendCommand(mode.toUpperCase());
    res.json({ success: true, mode: mode.toUpperCase() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set specific light
app.post('/api/light/:road/:color', async (req, res) => {
  const { road, color } = req.params;
  
  const roadMap = {
    'north-south': 'NS',
    'east-west': 'EW',
    'road3': 'R3',
    'road4': 'R4'
  };
  
  const validColors = ['RED', 'YELLOW', 'GREEN'];
  
  const roadCode = roadMap[road.toLowerCase()];
  const colorUpper = color.toUpperCase();
  
  if (!roadCode) {
    return res.status(400).json({ error: 'Invalid road' });
  }
  
  if (!validColors.includes(colorUpper)) {
    return res.status(400).json({ error: 'Invalid color' });
  }
  
  try {
    const command = `${roadCode}_${colorUpper}`;
    await sendCommand(command);
    res.json({ success: true, road, color: colorUpper });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Emergency stop (all red)
app.post('/api/emergency-stop', async (req, res) => {
  try {
    await sendCommand('ALL_RED');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// AI SERVICE PROXY ROUTES
// ============================================

// Health check for AI server
app.get('/api/ai/health', async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVER_URL}/health`);
    res.json(response.data);
  } catch (error) {
    res.status(503).json({
      status: 'unavailable',
      error: 'AI server is not responding',
      message: error.message
    });
  }
});

// Detect vehicles in uploaded image
app.post('/api/detect', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No image file provided' 
      });
    }
    
    console.log('Received image file:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
    
    // Create FormData and append the image file
    const formData = new FormData();
    formData.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });
    
    // Forward to AI server
    const response = await axios.post(`${AI_SERVER_URL}/detect`, formData, {
      headers: {
        ...formData.getHeaders()
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    
    console.log('AI detection successful:', {
      total_vehicles: response.data.total_vehicles,
      detections_count: response.data.detections?.length || 0
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('AI detection error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false,
      error: 'AI detection failed',
      message: error.response?.data?.error || error.message 
    });
  }
});

// Get analytics for an intersection
app.get('/api/analytics/:intersectionId', async (req, res) => {
  try {
    const { intersectionId } = req.params;
    const response = await axios.get(`${AI_SERVER_URL}/analytics/${intersectionId}`);
    res.json(response.data);
  } catch (error) {
    console.error('Analytics error:', error.message);
    res.status(500).json({ 
      error: 'Analytics fetch failed',
      message: error.message 
    });
  }
});

// Stream detection endpoint (proxy SSE)
app.get('/api/detect/stream/:cameraId', async (req, res) => {
  try {
    const { cameraId } = req.params;
    const response = await axios.get(`${AI_SERVER_URL}/detect/stream/${cameraId}`, {
      responseType: 'stream'
    });
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    response.data.pipe(res);
  } catch (error) {
    console.error('Stream detection error:', error.message);
    res.status(500).json({ 
      error: 'Stream detection failed',
      message: error.message 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', arduino: isConnected });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Arduino Bridge Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server running on ws://localhost:3002`);
  console.log('\nAttempting to connect to Arduino...');
  
  // Auto-connect on startup
  await connectArduino();
  
  if (isConnected) {
    console.log('\n✅ Ready to receive commands!');
    console.log('\nArduino API Endpoints:');
    console.log('  GET  /api/status              - Get connection status');
    console.log('  GET  /api/ports               - List available ports');
    console.log('  POST /api/connect             - Connect to Arduino');
    console.log('  POST /api/command             - Send raw command');
    console.log('  POST /api/mode/:mode          - Set mode (AUTO/STOP/TEST)');
    console.log('  POST /api/light/:road/:color  - Set specific light');
    console.log('  POST /api/emergency-stop      - Emergency stop (all red)');
    console.log('\nAI Service Endpoints:');
    console.log('  GET  /api/ai/health           - Check AI server status');
    console.log('  POST /api/detect              - Detect vehicles in image');
    console.log('  GET  /api/analytics/:id       - Get traffic analytics');
    console.log('  GET  /api/detect/stream/:id   - Stream detection (SSE)');
  } else {
    console.log('\n⚠️  Arduino not connected. Please check connection and try again.');
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  if (port && port.isOpen) {
    port.close();
  }
  process.exit();
});
