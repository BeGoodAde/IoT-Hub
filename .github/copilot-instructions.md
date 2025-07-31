 -->

# IoT Sensor Project Instructions

**Created by: BeGoodAde**  
**GitHub: https://github.com/BeGoodAde/IoT-Hub**  
**Project Author: BeGoodAde (bolarinwalaja@gmail.com)**

This is an IoT sensor project for offline computer communication. The project includes:

## Project Structure
- `src/server.js` - Main server with WebSocket and HTTP API
- `public/index.html` - Real-time dashboard interface
- `sensors/` - Sensor simulation modules (temperature, humidity, motion, light)

## Key Technologies
- **Backend**: Node.js + Express + Socket.IO
- **Frontend**: HTML5 + JavaScript + Chart.js
- **Communication**: WebSocket for real-time data, HTTP REST API
- **Sensors**: Simulated sensor modules (easily replaceable with real hardware)

## Development Guidelines

### Code Style
- Use CommonJS modules (require/module.exports)
- Follow async/await patterns for asynchronous operations
- Include proper error handling and logging
- Use meaningful variable and function names

### Sensor Integration
- Each sensor should be a separate module in the `sensors/` directory
- Sensors should return standardized data format: `{ value, unit, timestamp, sensor }`
- Support both simulated and real hardware sensors
- Include calibration and error handling

### API Design
- RESTful endpoints for HTTP API
- Real-time data via WebSocket events
- Consistent JSON response format
- Include status and health check endpoints

### Security Considerations
- This is designed for local network use (offline)
- Implement basic authentication if needed
- Validate all input data
- Use CORS appropriately for local development

### Performance
- Limit data storage to prevent memory leaks
- Use efficient data structures for time-series data
- Implement data compression for large datasets
- Consider database integration for production use

## Hardware Integration Notes
- Replace sensor simulation modules with actual hardware drivers
- Common interfaces: I2C, SPI, GPIO, Serial
- Consider using libraries like:
  - `serialport` for Arduino/microcontroller communication
  - `i2c-bus` for I2C sensors
  - `rpi-gpio` for Raspberry Pi GPIO

## Deployment
- Local network deployment (WiFi/Ethernet)
- Consider Docker containerization
- Environment variables for configuration
- Auto-discovery for IoT devices

---

## Project Credits
**Developed by**: BeGoodAde  
**Contact**: bolarinwalaja@gmail.com  
**Repository**: https://github.com/BeGoodAde/IoT-Hub  
**License**: ISC License  

*This IoT Sensor Hub project was created to demonstrate real-time sensor monitoring with WebSocket communication for offline computer networks.*
