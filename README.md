# 🌐 IoT Sensor Hub

A real-time IoT sensor monitoring system for offline computer communication. Monitor temperature, humidity, pressure, air quality, sound, motion, and light levels through a beautiful web dashboard with WebSocket connectivity.

## ✨ Features

- **Real-time Dashboard** - Live sensor data visualization
- **WebSocket Communication** - Instant data updates
- **7 Sensor Types** - Temperature, humidity, pressure, air quality, sound, motion, light
- **Device Control** - Send commands to IoT devices
- **Offline Operation** - Works on local network without internet
- **Responsive Design** - Mobile-friendly interface
- **Activity Logging** - Track all sensor events and commands

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone or download this project**
2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   ```
   http://localhost:3000
   ```

## 📊 Dashboard Features

### Sensor Monitoring
- **🌡️ Temperature** - Real-time temperature readings
- **💧 Humidity** - Humidity percentage monitoring  
- **� Pressure** - Atmospheric pressure measurement
- **🌬️ Air Quality** - Air quality index monitoring
- **🔊 Sound** - Sound level detection
- **�👁️ Motion** - Motion detection alerts
- **💡 Light** - Ambient light level measurement

### Controls
- **🔄 Refresh Data** - Manual data refresh
- **💡 Toggle LED** - Control connected LED devices
- **🌀 Toggle Fan** - Fan control commands
- **🚨 Emergency Stop** - Emergency device shutdown

### Visualizations
- **Real-time Charts** - Live data plotting with Chart.js
- **Historical Data** - Last 100 sensor readings
- **Activity Log** - Event and command history

## 🔧 API Endpoints

### REST API
```
GET  /api/status              - Server status and connection info
GET  /api/sensors/current     - Latest sensor readings
GET  /api/sensors/history     - Historical sensor data
GET  /api/sensors/:type       - Specific sensor data
```

### WebSocket Events
```javascript
// Client to Server
socket.emit('getSensorData')              // Request current data
socket.emit('controlDevice', {device, command}) // Control devices

// Server to Client
socket.on('sensorData', data)             // Receive sensor updates
socket.on('deviceResponse', response)     // Device command responses
```

## 🔌 Hardware Integration

This project uses simulated sensors, but you can easily integrate real hardware:

### Supported Platforms
- **Arduino** (via Serial communication)
- **Raspberry Pi** (GPIO, I2C, SPI)
- **ESP32/ESP8266** (WiFi communication)
- **Generic Serial Devices**

### Integration Example
```javascript
// Replace simulation with real sensor
const TemperatureSensor = require('./sensors/temperature');
const sensor = new TemperatureSensor();

// In your sensor module:
const serialport = require('serialport');
const port = new serialport('/dev/ttyUSB0', { baudRate: 9600 });

// Read from actual hardware
function readTemperature() {
  return new Promise((resolve) => {
    port.write('READ_TEMP');
    port.once('data', (data) => {
      resolve(parseFloat(data.toString()));
    });
  });
}
```

## 🏗️ Project Structure

```
iot-sensor-hub/
├── src/
│   └── server.js           # Main server with WebSocket & API
├── public/
│   └── index.html          # Dashboard interface
├── sensors/
│   ├── temperature.js      # Temperature sensor module
│   ├── humidity.js         # Humidity sensor module
│   ├── pressure.js         # Pressure sensor module
│   ├── airquality.js       # Air quality sensor module
│   ├── sound.js            # Sound sensor module
│   ├── motion.js           # Motion sensor module
│   └── light.js            # Light sensor module
├── .github/
│   └── copilot-instructions.md
├── .env                    # Environment configuration
├── package.json
└── README.md
```

## ⚙️ Configuration

Edit `.env` file to customize:

```env
PORT=3000                      # Server port
SENSOR_UPDATE_INTERVAL=2000    # Update frequency (ms)
MAX_DATA_POINTS=100           # Data history limit
CORS_ORIGIN=*                 # CORS settings
ENABLE_DEVICE_CONTROL=true    # Device control features
LOG_LEVEL=info                # Logging level
```

## 🔐 Security Notes

- **Local Network Only** - Designed for offline/local network use
- **No Authentication** - Add authentication for production use
- **CORS Enabled** - Configure CORS_ORIGIN for security
- **Input Validation** - Validate all device commands

## 🚀 Deployment Options

### Local Development
```bash
npm run dev          # Development with auto-reload
npm start           # Production mode
```

### Docker (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Network Access
- **Local**: `http://localhost:3000`
- **Network**: `http://[your-ip]:3000`
- **Mobile**: Access via local IP address

## 🔧 Customization

### Adding New Sensors
1. Create sensor module in `sensors/` directory
2. Follow the standard format:
   ```javascript
   class NewSensor {
     async readValue() {
       return {
         value: sensorValue,
         unit: 'unit',
         timestamp: new Date().toISOString(),
         sensor: 'sensorType'
       };
     }
   }
   ```
3. Update server.js to include new sensor
4. Add UI elements to dashboard

### Custom Device Controls
Add new control functions in the dashboard:
```javascript
function customControl(device, command) {
  socket.emit('controlDevice', { device, command });
  addLogEntry(`Custom control: ${device} ${command}`);
}
```

## 📈 Performance

- **Memory Usage** - Limited to last 100 data points per sensor
- **Update Rate** - 2-second intervals (configurable)
- **Concurrent Users** - Supports multiple dashboard connections
- **Data Storage** - In-memory (consider database for production)

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Change PORT in .env file or:
   PORT=3001 npm start
   ```

2. **WebSocket Connection Failed**
   - Check firewall settings
   - Verify server is running
   - Check browser console for errors

3. **No Sensor Data**
   - Verify sensor modules are working
   - Check server logs for errors
   - Ensure proper hardware connections

### Debug Mode
```bash
DEBUG=* npm run dev    # Enable debug logging
```

## 🤝 Contributing

1. Fork the project
2. Create feature branch: `git checkout -b feature/new-sensor`
3. Commit changes: `git commit -m 'Add new sensor support'`
4. Push to branch: `git push origin feature/new-sensor`
5. Submit pull request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Chart.js for beautiful data visualization
- Socket.IO for real-time communication
- Express.js for the web server foundation

---

**Built with ❤️ for IoT enthusiasts and makers!**
