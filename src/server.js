const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Import sensor modules
const TemperatureSensor = require('../sensors/temperature');
const HumiditySensor = require('../sensors/humidity');
const MotionSensor = require('../sensors/motion');
const LightSensor = require('../sensors/light');
const PressureSensor = require('../sensors/pressure');
const AirQualitySensor = require('../sensors/airquality');
const SoundSensor = require('../sensors/sound');

// Store sensor data in memory (in production, use a database)
const sensorData = {
  temperature: [],
  humidity: [],
  pressure: [],
  airquality: [],
  sound: [],
  motion: [],
  light: [],
  timestamp: []
};

// Initialize sensor instances
const sensors = {
  temperature: new TemperatureSensor(),
  humidity: new HumiditySensor(),
  motion: new MotionSensor(),
  light: new LightSensor(),
  pressure: new PressureSensor(),
  airquality: new AirQualitySensor(),
  sound: new SoundSensor()
};

// Generate sensor data using actual sensor modules
async function generateSensorData() {
  const now = new Date();
  const data = {
    timestamp: now.toISOString()
  };

  // Read data from all sensors
  for (const [sensorType, sensor] of Object.entries(sensors)) {
    try {
      const reading = await sensor.readValue();
      data[sensorType] = reading.value;
      
      // Store additional sensor info for first reading
      if (sensorData[sensorType].length === 0) {
        data[`${sensorType}_info`] = reading;
      }
    } catch (error) {
      console.error(`Error reading ${sensorType} sensor:`, error);
      data[sensorType] = null;
    }
  }
  
  // Store last 100 readings
  Object.keys(sensorData).forEach(key => {
    sensorData[key].push(data[key]);
    if (sensorData[key].length > 100) {
      sensorData[key].shift();
    }
  });
  
  return data;
}

// Routes
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'online', 
    message: 'IoT Sensor Hub is running',
    connectedDevices: io.sockets.sockets.size
  });
});

app.get('/api/sensors/current', (req, res) => {
  const currentData = generateSensorData();
  res.json(currentData);
});

app.get('/api/sensors/history', (req, res) => {
  res.json(sensorData);
});

app.get('/api/sensors/:type', (req, res) => {
  const { type } = req.params;
  if (sensorData[type]) {
    res.json({
      type,
      data: sensorData[type],
      timestamps: sensorData.timestamp
    });
  } else {
    res.status(404).json({ error: 'Sensor type not found' });
  }
});

// Sensor control endpoints
app.post('/api/sensors/:type/toggle', (req, res) => {
  const { type } = req.params;
  if (sensors[type]) {
    sensors[type].toggle();
    res.json({ 
      message: `${type} sensor toggled`,
      status: sensors[type].getStatus()
    });
  } else {
    res.status(404).json({ error: 'Sensor type not found' });
  }
});

app.post('/api/sensors/:type/calibrate', (req, res) => {
  const { type } = req.params;
  const { value } = req.body;
  
  if (sensors[type]) {
    if (typeof sensors[type].calibrate === 'function') {
      sensors[type].calibrate(value);
      res.json({ 
        message: `${type} sensor calibrated`,
        status: sensors[type].getStatus()
      });
    } else {
      res.status(400).json({ error: 'Sensor does not support calibration' });
    }
  } else {
    res.status(404).json({ error: 'Sensor type not found' });
  }
});

app.get('/api/sensors/:type/status', (req, res) => {
  const { type } = req.params;
  if (sensors[type]) {
    res.json(sensors[type].getStatus());
  } else {
    res.status(404).json({ error: 'Sensor type not found' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  // Send current data on connection
  generateSensorData().then(data => {
    socket.emit('sensorData', data);
  });
  
  // Handle sensor commands
  socket.on('getSensorData', async () => {
    const data = await generateSensorData();
    socket.emit('sensorData', data);
  });
  
  socket.on('controlDevice', (data) => {
    console.log('Device control command:', data);
    // Handle sensor control commands
    if (data.type === 'sensor' && sensors[data.device]) {
      if (data.action === 'toggle') {
        sensors[data.device].toggle();
      } else if (data.action === 'calibrate') {
        sensors[data.device].calibrate(data.value);
      }
    }
    
    socket.emit('deviceResponse', { 
      device: data.device, 
      status: 'command_executed',
      timestamp: new Date().toISOString()
    });
  });
  
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start sensor data streaming
setInterval(async () => {
  const data = await generateSensorData();
  io.emit('sensorData', data);
}, 2000); // Update every 2 seconds

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🌐 IoT Sensor Hub running on http://localhost:${PORT}`);
  console.log(`📊 Real-time dashboard: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server ready for IoT devices`);
});
