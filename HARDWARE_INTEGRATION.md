# Hardware Integration Guide 🔧

This guide shows how to integrate real IoT hardware with your sensor hub system.

## 🎯 Overview

Your IoT Sensor Hub is designed with modular sensor classes that can easily be replaced with real hardware implementations. Each sensor module provides:

- **Simulation Mode**: Works out of the box for testing
- **Hardware Integration Examples**: Ready-to-use code patterns
- **Standardized Data Format**: Consistent API across all sensors
- **Error Handling**: Fallback to simulation if hardware fails

## 🔌 Supported Hardware Platforms

### Raspberry Pi + I2C Sensors
```bash
# Install required packages
npm install i2c-bus
sudo apt-get install i2c-tools

# Enable I2C interface
sudo raspi-config
# Interface Options -> I2C -> Enable
```

### Arduino + Serial Communication
```bash
# Install serial communication
npm install serialport

# Arduino sketch examples provided below
```

### ESP32/ESP8266 + WiFi
```bash
# For direct WiFi communication
npm install mqtt ws

# Examples for MQTT and WebSocket protocols
```

## 🌡️ Temperature & Humidity Sensors

### DHT22/DHT11 (Digital)
```javascript
// Replace temperature.js readValue() method
const dht = require('node-dht-sensor');

async readFromHardware() {
    return new Promise((resolve, reject) => {
        dht.read(22, 4, (err, temp, humidity) => { // DHT22 on GPIO 4
            if (!err) {
                resolve({
                    value: Math.round(temp * 10) / 10,
                    humidity: Math.round(humidity * 10) / 10,
                    unit: this.unit,
                    timestamp: new Date().toISOString(),
                    sensor: this.type,
                    status: 'active',
                    source: 'hardware'
                });
            } else {
                reject(err);
            }
        });
    });
}
```

### DS18B20 (1-Wire Temperature)
```javascript
const fs = require('fs');
const glob = require('glob');

async readFromHardware() {
    try {
        const devicePath = glob.sync('/sys/bus/w1/devices/28-*/w1_slave')[0];
        const data = fs.readFileSync(devicePath, 'utf8');
        const temp = parseInt(data.split('t=')[1]) / 1000;
        
        return {
            value: Math.round(temp * 10) / 10,
            unit: this.unit,
            timestamp: new Date().toISOString(),
            sensor: this.type,
            status: 'active',
            source: 'hardware'
        };
    } catch (error) {
        throw new Error('DS18B20 read failed');
    }
}
```

### BME280 (Temperature, Humidity, Pressure)
```javascript
const i2c = require('i2c-bus');

async readFromHardware() {
    const bus = i2c.openSync(1);
    const addr = 0x76; // or 0x77
    
    try {
        // Read calibration data (simplified)
        const calData = this.readCalibrationData(bus, addr);
        
        // Trigger measurement
        bus.writeByteSync(addr, 0xF4, 0x27); // Normal mode
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Read raw data
        const data = Buffer.alloc(8);
        bus.readI2cBlockSync(addr, 0xF7, 8, data);
        
        // Convert raw to actual values (calibration needed)
        const temperature = this.compensateTemperature(data, calData);
        const humidity = this.compensateHumidity(data, calData);
        const pressure = this.compensatePressure(data, calData);
        
        return {
            temperature: Math.round(temperature * 10) / 10,
            humidity: Math.round(humidity * 10) / 10,
            pressure: Math.round(pressure * 100) / 100,
            timestamp: new Date().toISOString(),
            source: 'hardware'
        };
    } finally {
        bus.closeSync();
    }
}
```

## 🔊 Sound Sensors

### MAX4466 Microphone (Analog)
```javascript
// Arduino sketch for sound level
/*
#include <ArduinoJson.h>

const int micPin = A0;
const int sampleWindow = 250; // Sample window width in ms

void setup() {
    Serial.begin(9600);
}

void loop() {
    if (Serial.available() && Serial.readString().indexOf("READ_SOUND_LEVEL") >= 0) {
        unsigned long startMillis = millis();
        unsigned int peakToPeak = 0;
        unsigned int signalMax = 0;
        unsigned int signalMin = 1024;
        
        // Collect data for sample window
        while (millis() - startMillis < sampleWindow) {
            int sample = analogRead(micPin);
            if (sample < 1024) {
                if (sample > signalMax) signalMax = sample;
                else if (sample < signalMin) signalMin = sample;
            }
        }
        
        peakToPeak = signalMax - signalMin;
        double volts = (peakToPeak * 5.0) / 1024;
        double db = 20 * log10(volts) + 94; // Calibration needed
        
        StaticJsonDocument<200> doc;
        doc["db"] = db;
        doc["peak"] = signalMax;
        doc["min"] = signalMin;
        doc["timestamp"] = millis();
        
        serializeJson(doc, Serial);
        Serial.println();
    }
    
    delay(100);
}
*/

// Node.js integration
const SerialPort = require('serialport');
const port = new SerialPort('/dev/ttyUSB0', { baudRate: 9600 });

async readFromArduino() {
    return new Promise((resolve, reject) => {
        port.write('READ_SOUND_LEVEL\n');
        
        port.once('data', (data) => {
            try {
                const sensorData = JSON.parse(data.toString());
                resolve({
                    value: Math.round(sensorData.db * 10) / 10,
                    unit: this.unit,
                    timestamp: new Date().toISOString(),
                    sensor: this.type,
                    status: 'active',
                    peak: sensorData.peak,
                    source: 'arduino'
                });
            } catch (error) {
                reject(error);
            }
        });
        
        setTimeout(() => reject(new Error('Timeout')), 5000);
    });
}
```

## 🌬️ Air Quality Sensors

### MQ-135 (Air Quality - Analog)
```javascript
// Arduino code for MQ-135
/*
#include <ArduinoJson.h>

const int mq135Pin = A0;
const float RL = 10.0; // Load resistance in kOhms
const float m = -0.318; // Slope 
const float b = 1.133; // Y-intercept
const float Ro = 41763; // Sensor resistance in clean air

void setup() {
    Serial.begin(9600);
}

float calculatePPM() {
    int sensorValue = analogRead(mq135Pin);
    float sensor_volt = sensorValue * (5.0 / 1023.0);
    float RS_gas = ((5.0 * RL) / sensor_volt) - RL;
    float ratio = RS_gas / Ro;
    
    double ppm_log = (log10(ratio) - b) / m;
    double ppm = pow(10, ppm_log);
    
    return ppm;
}

void loop() {
    if (Serial.available() && Serial.readString().indexOf("READ_AIR_QUALITY") >= 0) {
        float co2_ppm = calculatePPM();
        int aqi = map(co2_ppm, 350, 2000, 0, 300); // Simple mapping
        
        StaticJsonDocument<200> doc;
        doc["aqi"] = constrain(aqi, 0, 300);
        doc["co2"] = co2_ppm;
        doc["voc"] = co2_ppm * 0.001; // Estimate
        doc["timestamp"] = millis();
        
        serializeJson(doc, Serial);
        Serial.println();
    }
    
    delay(1000);
}
*/
```

### SGP30 (I2C Air Quality)
```javascript
const i2c = require('i2c-bus');

async readFromHardware() {
    const bus = i2c.openSync(1);
    const addr = 0x58;
    
    try {
        // Initialize sensor
        const initCmd = Buffer.from([0x20, 0x03]);
        bus.i2cWriteSync(addr, initCmd.length, initCmd);
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // Start measurement
        const measureCmd = Buffer.from([0x20, 0x08]);
        bus.i2cWriteSync(addr, measureCmd.length, measureCmd);
        await new Promise(resolve => setTimeout(resolve, 12));
        
        // Read results
        const buffer = Buffer.alloc(6);
        bus.i2cReadSync(addr, buffer.length, buffer);
        
        const co2 = (buffer[0] << 8) | buffer[1];
        const tvoc = (buffer[3] << 8) | buffer[4];
        
        // Convert to AQI (simplified)
        const aqi = Math.min(300, Math.max(0, (co2 - 400) / 10 + tvoc / 2));
        
        return {
            value: Math.round(aqi),
            co2: co2,
            voc: tvoc,
            unit: this.unit,
            timestamp: new Date().toISOString(),
            sensor: this.type,
            status: 'active',
            source: 'hardware'
        };
    } finally {
        bus.closeSync();
    }
}
```

## 👁️ Motion Sensors

### PIR Sensor (Digital)
```javascript
const Gpio = require('onoff').Gpio;
const pir = new Gpio(18, 'in', 'both'); // GPIO 18

constructor() {
    super();
    this.setupHardware();
}

setupHardware() {
    if (pir.readSync() === 1) {
        this.motionDetected = true;
    }
    
    pir.watch((err, value) => {
        if (err) throw err;
        this.motionDetected = value === 1;
        console.log(`Motion ${value ? 'detected' : 'stopped'}`);
    });
}

async readFromHardware() {
    const isMotion = pir.readSync() === 1;
    
    return {
        value: isMotion ? 1 : 0,
        unit: this.unit,
        timestamp: new Date().toISOString(),
        sensor: this.type,
        status: 'active',
        location: 'Indoor',
        sensitivity: 'High',
        source: 'hardware'
    };
}
```

## 💡 Light Sensors

### LDR (Light Dependent Resistor)
```javascript
// Arduino code for LDR
/*
const int ldrPin = A0;

void setup() {
    Serial.begin(9600);
}

void loop() {
    if (Serial.available() && Serial.readString().indexOf("READ_LIGHT_LEVEL") >= 0) {
        int sensorValue = analogRead(ldrPin);
        // Convert to lux (calibration needed)
        float voltage = sensorValue * (5.0 / 1023.0);
        float lux = 500 / voltage; // Approximate conversion
        
        StaticJsonDocument<200> doc;
        doc["lux"] = lux;
        doc["raw"] = sensorValue;
        doc["voltage"] = voltage;
        doc["timestamp"] = millis();
        
        serializeJson(doc, Serial);
        Serial.println();
    }
    
    delay(100);
}
*/
```

### BH1750 (I2C Light Sensor)
```javascript
const i2c = require('i2c-bus');

async readFromHardware() {
    const bus = i2c.openSync(1);
    const addr = 0x23;
    
    try {
        // Start measurement (One Time H-Resolution Mode)
        bus.writeByteSync(addr, 0x20);
        await new Promise(resolve => setTimeout(resolve, 180));
        
        // Read result
        const buffer = Buffer.alloc(2);
        bus.i2cReadSync(addr, buffer.length, buffer);
        
        const lux = ((buffer[0] << 8) | buffer[1]) / 1.2;
        
        return {
            value: Math.round(lux),
            unit: this.unit,
            timestamp: new Date().toISOString(),
            sensor: this.type,
            status: 'active',
            location: 'Indoor',
            source: 'hardware'
        };
    } finally {
        bus.closeSync();
    }
}
```

## 🔄 Easy Hardware Integration Steps

### 1. **Test with Simulation First**
Your sensors work out of the box in simulation mode. Test your dashboard before connecting hardware.

### 2. **Replace readValue() Method**
In each sensor file, uncomment the hardware integration code and replace the `readValue()` method:

```javascript
// In sensors/temperature.js
async readValue() {
    try {
        return await this.readFromHardware();
    } catch (error) {
        console.error('Hardware read failed, using simulation:', error);
        return await this.readSimulated(); // Fallback
    }
}
```

### 3. **Install Required Dependencies**
```bash
# For I2C sensors (Raspberry Pi)
npm install i2c-bus

# For Arduino communication
npm install serialport

# For GPIO control
npm install onoff

# For DHT sensors
npm install node-dht-sensor
```

### 4. **Hardware Setup Examples**

#### Raspberry Pi Wiring
```
DHT22:
- VCC -> 3.3V (Pin 1)
- Data -> GPIO 4 (Pin 7)
- GND -> Ground (Pin 6)

BH1750 Light Sensor:
- VCC -> 3.3V (Pin 1)
- SDA -> GPIO 2 (Pin 3)
- SCL -> GPIO 3 (Pin 5)
- GND -> Ground (Pin 6)

PIR Motion Sensor:
- VCC -> 5V (Pin 2)
- OUT -> GPIO 18 (Pin 12)
- GND -> Ground (Pin 6)
```

#### Arduino Connections
```
MQ-135 Air Quality:
- VCC -> 5V
- A0 -> Analog Pin A0
- GND -> Ground

MAX4466 Microphone:
- VCC -> 3.3V
- OUT -> Analog Pin A1
- GND -> Ground

LDR Light Sensor:
- One leg -> 5V
- Other leg -> A0 and 10kΩ resistor to GND
```

### 5. **Configuration**
Create a `.env` file for hardware settings:
```env
# Hardware Configuration
HARDWARE_MODE=true
I2C_BUS=1
SERIAL_PORT=/dev/ttyUSB0
SERIAL_BAUDRATE=9600

# Sensor Addresses
BH1750_ADDRESS=0x23
BME280_ADDRESS=0x76
SGP30_ADDRESS=0x58

# GPIO Pins
PIR_SENSOR_PIN=18
DHT22_PIN=4
```

### 6. **Test Hardware Integration**
```bash
# Test I2C devices
sudo i2cdetect -y 1

# Test serial connection
ls /dev/tty*

# Test GPIO
gpio readall  # if wiringpi installed
```

## 🚀 Advanced Features

### MQTT Integration
```javascript
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost:1883');

// Subscribe to sensor topics
client.on('connect', () => {
    client.subscribe('sensors/+/data');
});

client.on('message', (topic, message) => {
    const sensorType = topic.split('/')[1];
    const data = JSON.parse(message.toString());
    
    // Update sensor data from MQTT
    this.updateSensorFromMQTT(sensorType, data);
});
```

### WiFi Sensors (ESP32)
```cpp
// ESP32 Arduino code for WiFi sensor
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

WebSocketsClient webSocket;

void setup() {
    WiFi.begin("YourWiFi", "YourPassword");
    webSocket.begin("192.168.1.100", 3000, "/");
    webSocket.onEvent(webSocketEvent);
}

void sendSensorData() {
    StaticJsonDocument<200> doc;
    doc["temperature"] = 25.6;
    doc["humidity"] = 60.2;
    doc["sensor_id"] = "ESP32_001";
    
    String output;
    serializeJson(doc, output);
    webSocket.sendTXT(output);
}
```

## 🛠️ Troubleshooting

### Common Issues
1. **I2C Not Working**: Enable I2C interface with `sudo raspi-config`
2. **Permission Denied**: Add user to dialout group: `sudo usermod -a -G dialout $USER`
3. **Sensor Not Found**: Check wiring and addresses with `i2cdetect`
4. **Serial Port Issues**: Verify port name and permissions

### Debug Mode
Enable debug logging in your sensor modules:
```javascript
constructor() {
    this.debug = process.env.DEBUG_SENSORS === 'true';
}

log(message) {
    if (this.debug) {
        console.log(`[${this.type}] ${message}`);
    }
}
```

Start with debug mode:
```bash
DEBUG_SENSORS=true npm start
```

## 📚 Next Steps

1. **Start Simple**: Begin with one sensor type (like DHT22)
2. **Test Thoroughly**: Verify each sensor before adding the next
3. **Add Error Handling**: Implement robust fallback mechanisms
4. **Monitor Performance**: Log sensor read times and success rates
5. **Scale Gradually**: Add more sensors as your system proves stable

Your IoT Sensor Hub is ready for real hardware! Each sensor module is designed to make the transition from simulation to hardware as smooth as possible.
