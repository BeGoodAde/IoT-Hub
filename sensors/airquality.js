/**
 * Air Quality Sensor Module
 * Simulates air quality index and gas concentration readings
 * Can be replaced with actual MQ-135 or SGP30 sensor integration
 */

class AirQualitySensor {
    constructor() {
        this.name = 'Air Quality Sensor';
        this.type = 'airquality';
        this.unit = 'AQI';
        this.currentAQI = 25; // Good air quality
        this.co2Level = 400; // ppm
        this.vocLevel = 0.1; // ppm
        this.isActive = true;
        
        // For hardware integration
        this.analogPin = 'A0'; // For MQ-135
        this.i2cAddress = 0x58; // For SGP30
        this.sensorModel = 'SGP30';
    }

    /**
     * Simulate air quality readings
     * Real implementation would read from analog/I2C sensor
     */
    async readValue() {
        if (!this.isActive) {
            return {
                value: null,
                unit: this.unit,
                timestamp: new Date().toISOString(),
                sensor: this.type,
                status: 'inactive'
            };
        }

        // Simulate realistic air quality variations
        const aqiVariation = (Math.random() - 0.5) * 10;
        this.currentAQI = Math.max(0, Math.min(300, this.currentAQI + aqiVariation));
        
        // Simulate CO2 and VOC levels
        this.co2Level += (Math.random() - 0.5) * 20;
        this.co2Level = Math.max(350, Math.min(2000, this.co2Level));
        
        this.vocLevel += (Math.random() - 0.5) * 0.1;
        this.vocLevel = Math.max(0, Math.min(5, this.vocLevel));

        const aqiLevel = this.getAQILevel(this.currentAQI);

        return {
            value: Math.round(this.currentAQI),
            unit: this.unit,
            timestamp: new Date().toISOString(),
            sensor: this.type,
            status: 'active',
            level: aqiLevel,
            co2: Math.round(this.co2Level),
            voc: Math.round(this.vocLevel * 1000) / 1000,
            location: 'Indoor'
        };
    }

    getAQILevel(aqi) {
        if (aqi <= 50) return { level: 'Good', color: '#00E400' };
        if (aqi <= 100) return { level: 'Moderate', color: '#FFFF00' };
        if (aqi <= 150) return { level: 'Unhealthy for Sensitive', color: '#FF7E00' };
        if (aqi <= 200) return { level: 'Unhealthy', color: '#FF0000' };
        if (aqi <= 300) return { level: 'Very Unhealthy', color: '#8F3F97' };
        return { level: 'Hazardous', color: '#7E0023' };
    }

    /**
     * Hardware Integration Example for SGP30
     * Uncomment and install 'i2c-bus' package for real hardware
     */
    /*
    async readFromHardware() {
        const i2c = require('i2c-bus');
        const bus = i2c.openSync(1);
        
        try {
            // SGP30 measurement command
            const measureCmd = [0x20, 0x08];
            bus.writeByteSync(this.i2cAddress, measureCmd[0], measureCmd[1]);
            
            // Wait for measurement
            await new Promise(resolve => setTimeout(resolve, 12));
            
            // Read 6 bytes (CO2 + TVOC + CRC)
            const buffer = Buffer.alloc(6);
            bus.readI2cBlockSync(this.i2cAddress, 0, 6, buffer);
            
            const co2 = (buffer[0] << 8) | buffer[1];
            const tvoc = (buffer[3] << 8) | buffer[4];
            
            // Convert to AQI (simplified calculation)
            const aqi = Math.min(300, Math.max(0, (co2 - 400) / 10 + tvoc / 2));
            
            return {
                value: Math.round(aqi),
                unit: this.unit,
                timestamp: new Date().toISOString(),
                sensor: this.type,
                status: 'active',
                co2: co2,
                voc: tvoc,
                source: 'hardware'
            };
        } catch (error) {
            console.error('Air quality sensor read error:', error);
            return this.readValue();
        } finally {
            bus.closeSync();
        }
    }
    */

    /**
     * Arduino Integration Example
     * For MQ-135 or similar analog gas sensors
     */
    /*
    async readFromArduino() {
        const SerialPort = require('serialport');
        const port = new SerialPort('/dev/ttyUSB0', { baudRate: 9600 });
        
        return new Promise((resolve, reject) => {
            port.write('READ_AIR_QUALITY\n');
            
            port.once('data', (data) => {
                try {
                    const sensorData = JSON.parse(data.toString());
                    resolve({
                        value: sensorData.aqi,
                        unit: this.unit,
                        timestamp: new Date().toISOString(),
                        sensor: this.type,
                        status: 'active',
                        co2: sensorData.co2,
                        voc: sensorData.voc,
                        source: 'arduino'
                    });
                } catch (error) {
                    reject(error);
                }
            });
            
            setTimeout(() => reject(new Error('Timeout')), 5000);
        });
    }
    */

    toggle() {
        this.isActive = !this.isActive;
        console.log(`Air quality sensor ${this.isActive ? 'activated' : 'deactivated'}`);
    }

    calibrate() {
        // Reset to baseline values
        this.currentAQI = 25;
        this.co2Level = 400;
        this.vocLevel = 0.1;
        console.log('Air quality sensor calibrated to baseline values');
    }

    getStatus() {
        return {
            name: this.name,
            type: this.type,
            active: this.isActive,
            currentAQI: this.currentAQI,
            co2Level: this.co2Level,
            vocLevel: this.vocLevel,
            unit: this.unit,
            hardware: {
                model: this.sensorModel,
                address: `0x${this.i2cAddress.toString(16)}`,
                interface: 'I2C',
                alternativePin: this.analogPin
            }
        };
    }
}

module.exports = AirQualitySensor;
