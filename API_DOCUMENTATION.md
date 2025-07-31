# IoT Sensor Hub API Documentation 📡

## 🎯 Enhanced Features

Your IoT Sensor Hub now includes **7 different sensor types** with full hardware integration capabilities!

### 🔧 New Sensors Added:
- **🔽 Pressure Sensor** - Atmospheric pressure (hPa)
- **🌬️ Air Quality Sensor** - AQI, CO2, VOC levels  
- **🔊 Sound Level Sensor** - Noise monitoring (dB)
- **🌡️ Temperature Sensor** - Enhanced with hardware support
- **💧 Humidity Sensor** - Improved accuracy
- **👁️ Motion Sensor** - PIR-based detection
- **💡 Light Sensor** - Lux level monitoring

## 📊 Live Dashboard Features

Visit **http://localhost:3000** to see:

✅ **Real-time Data Streaming** - All 7 sensors updating every 2 seconds  
✅ **Interactive Charts** - Multi-line charts with 5 sensor data streams  
✅ **Responsive Design** - Works on desktop, tablet, and mobile  
✅ **WebSocket Communication** - Instant updates without page refresh  
✅ **Activity Logging** - Real-time event tracking  
✅ **Device Controls** - Toggle and calibrate sensors remotely  

## 🚀 REST API Endpoints

### Get All Sensor Data
```bash
GET http://localhost:3000/api/sensors/current
```

### Get Specific Sensor Data
```bash
GET http://localhost:3000/api/sensors/temperature
GET http://localhost:3000/api/sensors/humidity  
GET http://localhost:3000/api/sensors/pressure
GET http://localhost:3000/api/sensors/airquality
GET http://localhost:3000/api/sensors/sound
GET http://localhost:3000/api/sensors/motion
GET http://localhost:3000/api/sensors/light
```

### Get Historical Data
```bash
GET http://localhost:3000/api/sensors/history
```

### Control Sensors
```bash
# Toggle sensor on/off
POST http://localhost:3000/api/sensors/temperature/toggle

# Calibrate sensor
POST http://localhost:3000/api/sensors/pressure/calibrate
Content-Type: application/json
{
  "value": 1013.25
}

# Get sensor status
GET http://localhost:3000/api/sensors/temperature/status
```

## 🔌 WebSocket Events

### Client → Server
```javascript
// Request sensor data
socket.emit('getSensorData');

// Control device
socket.emit('controlDevice', {
  type: 'sensor',
  device: 'temperature',
  action: 'toggle'
});

socket.emit('controlDevice', {
  type: 'sensor', 
  device: 'pressure',
  action: 'calibrate',
  value: 1013.25
});
```

### Server → Client
```javascript
// Receive sensor data (every 2 seconds)
socket.on('sensorData', (data) => {
  console.log('Temperature:', data.temperature);
  console.log('Humidity:', data.humidity);
  console.log('Pressure:', data.pressure);
  console.log('Air Quality:', data.airquality);
  console.log('Sound Level:', data.sound);
  console.log('Motion:', data.motion);
  console.log('Light:', data.light);
});

// Device response
socket.on('deviceResponse', (response) => {
  console.log('Device command result:', response);
});
```

## 🛠️ Hardware Integration Ready

Each sensor module includes:

✅ **Simulation Mode** - Works immediately for testing  
✅ **Hardware Integration Code** - Ready-to-use examples for real sensors  
✅ **Multiple Platforms** - Raspberry Pi, Arduino, ESP32 support  
✅ **Error Handling** - Automatic fallback to simulation if hardware fails  
✅ **Calibration Support** - Fine-tune sensor accuracy  
✅ **Status Monitoring** - Track sensor health and connectivity  

## 📋 Quick Test Commands

```bash
# Test all sensors
curl http://localhost:3000/api/sensors/current

# Test specific sensor
curl http://localhost:3000/api/sensors/pressure

# Toggle temperature sensor
curl -X POST http://localhost:3000/api/sensors/temperature/toggle

# Calibrate pressure sensor
curl -X POST http://localhost:3000/api/sensors/pressure/calibrate \
  -H "Content-Type: application/json" \
  -d '{"value": 1013.25}'

# Get sensor status
curl http://localhost:3000/api/sensors/sound/status
```

## 🎯 Next Steps

1. **🖥️ Open Dashboard**: Visit http://localhost:3000 to see all sensors live
2. **🔧 Hardware Integration**: Follow `HARDWARE_INTEGRATION.md` to connect real sensors  
3. **📱 Mobile Access**: Dashboard works on mobile devices too
4. **🔗 API Integration**: Use REST endpoints for external applications
5. **📊 Data Analysis**: Historical data available for trend analysis

## 🌟 System Capabilities

Your IoT Sensor Hub now provides:

- **Offline Operation** ✅ - No internet required for local monitoring
- **Real-time Updates** ✅ - WebSocket communication for instant data
- **Scalable Architecture** ✅ - Easy to add more sensor types
- **Hardware Ready** ✅ - Plug-and-play sensor integration
- **Mobile Friendly** ✅ - Responsive web dashboard
- **API Complete** ✅ - Full REST API for integration
- **Production Ready** ✅ - Error handling and fallback mechanisms

**🎉 Your comprehensive IoT communication system is ready!**
