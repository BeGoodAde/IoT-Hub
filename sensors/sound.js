/**
 * Sound Sensor Module
 * Simulates noise level readings in decibels
 * Can be replaced with actual sound level meter or microphone integration
 */

class SoundSensor {
    constructor() {
        this.name = 'Sound Level Sensor';
        this.type = 'sound';
        this.unit = 'dB';
        this.currentLevel = 35; // Quiet room level
        this.minLevel = 20; // Very quiet
        this.maxLevel = 120; // Very loud
        this.isActive = true;
        this.peakLevel = 35;
        this.averageLevel = 35;
        
        // For hardware integration
        this.analogPin = 'A1';
        this.microphoneType = 'Electret';
        this.sensorModel = 'MAX4466';
        
        // Calibration values
        this.calibrationOffset = 0;
        this.sensitivity = 1.0;
    }

    /**
     * Simulate sound level readings
     * Real implementation would read from microphone/sound sensor
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

        // Simulate realistic sound variations
        const baseLevel = 35; // Quiet room
        const timeOfDay = new Date().getHours();
        
        // Higher noise during day hours
        let targetLevel = baseLevel;
        if (timeOfDay >= 6 && timeOfDay <= 22) {
            targetLevel += Math.random() * 20; // Day noise
        } else {
            targetLevel += Math.random() * 5; // Night quiet
        }
        
        // Add random spikes for events
        if (Math.random() < 0.1) { // 10% chance of noise spike
            targetLevel += Math.random() * 30;
        }
        
        // Smooth transition to target level
        this.currentLevel += (targetLevel - this.currentLevel) * 0.3;
        this.currentLevel = Math.max(this.minLevel, 
                          Math.min(this.maxLevel, this.currentLevel));
        
        // Update peak and average
        this.peakLevel = Math.max(this.peakLevel * 0.99, this.currentLevel);
        this.averageLevel = this.averageLevel * 0.9 + this.currentLevel * 0.1;

        const noiseLevel = this.getNoiseLevel(this.currentLevel);

        return {
            value: Math.round(this.currentLevel * 10) / 10,
            unit: this.unit,
            timestamp: new Date().toISOString(),
            sensor: this.type,
            status: 'active',
            level: noiseLevel,
            peak: Math.round(this.peakLevel * 10) / 10,
            average: Math.round(this.averageLevel * 10) / 10,
            location: 'Indoor'
        };
    }

    getNoiseLevel(db) {
        if (db < 30) return { level: 'Very Quiet', color: '#4CAF50' };
        if (db < 40) return { level: 'Quiet', color: '#8BC34A' };
        if (db < 55) return { level: 'Moderate', color: '#FFEB3B' };
        if (db < 70) return { level: 'Loud', color: '#FF9800' };
        if (db < 85) return { level: 'Very Loud', color: '#FF5722' };
        return { level: 'Harmful', color: '#F44336' };
    }

    /**
     * Hardware Integration Example for MAX4466 Microphone
     * Uncomment and use appropriate ADC library for real hardware
     */
    /*
    async readFromHardware() {
        // For Raspberry Pi with MCP3008 ADC
        const SPI = require('pi-spi');
        const spi = SPI.initialize('/dev/spidev0.0');
        
        try {
            // Read multiple samples for better accuracy
            const samples = [];
            const sampleCount = 100;
            
            for (let i = 0; i < sampleCount; i++) {
                const buffer = Buffer.from([0x01, 0x80, 0x00]); // Channel 0
                const result = spi.transfer(buffer, buffer.length);
                const value = ((result[1] & 0x03) << 8) + result[2];
                samples.push(value);
                await new Promise(resolve => setTimeout(resolve, 1));
            }
            
            // Calculate RMS for sound level
            const rms = Math.sqrt(samples.reduce((sum, val) => 
                sum + Math.pow(val - 512, 2), 0) / samples.length);
            
            // Convert to decibels (calibration needed)
            const db = 20 * Math.log10(rms / 512) + 94 + this.calibrationOffset;
            
            return {
                value: Math.max(20, Math.min(120, db)),
                unit: this.unit,
                timestamp: new Date().toISOString(),
                sensor: this.type,
                status: 'active',
                source: 'hardware',
                rms: rms
            };
        } catch (error) {
            console.error('Sound sensor read error:', error);
            return this.readValue();
        }
    }
    */

    /**
     * Arduino Integration Example
     * For analog microphone sensors
     */
    /*
    async readFromArduino() {
        const SerialPort = require('serialport');
        const port = new SerialPort('/dev/ttyUSB0', { baudRate: 9600 });
        
        return new Promise((resolve, reject) => {
            port.write('READ_SOUND_LEVEL\n');
            
            port.once('data', (data) => {
                try {
                    const sensorData = JSON.parse(data.toString());
                    const calibratedValue = sensorData.db + this.calibrationOffset;
                    
                    resolve({
                        value: Math.round(calibratedValue * 10) / 10,
                        unit: this.unit,
                        timestamp: new Date().toISOString(),
                        sensor: this.type,
                        status: 'active',
                        peak: sensorData.peak,
                        average: sensorData.average,
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
        console.log(`Sound sensor ${this.isActive ? 'activated' : 'deactivated'}`);
    }

    calibrate(referenceDB = null) {
        if (referenceDB && typeof referenceDB === 'number') {
            this.calibrationOffset = referenceDB - this.currentLevel;
            console.log(`Sound sensor calibrated with offset: ${this.calibrationOffset} dB`);
        } else {
            // Reset peak values
            this.peakLevel = this.currentLevel;
            this.averageLevel = this.currentLevel;
            console.log('Sound sensor peak values reset');
        }
    }

    setSensitivity(sensitivity) {
        if (sensitivity > 0 && sensitivity <= 2) {
            this.sensitivity = sensitivity;
            console.log(`Sound sensor sensitivity set to ${sensitivity}`);
        }
    }

    getStatus() {
        return {
            name: this.name,
            type: this.type,
            active: this.isActive,
            currentLevel: this.currentLevel,
            peakLevel: this.peakLevel,
            averageLevel: this.averageLevel,
            unit: this.unit,
            range: `${this.minLevel}-${this.maxLevel} ${this.unit}`,
            calibration: {
                offset: this.calibrationOffset,
                sensitivity: this.sensitivity
            },
            hardware: {
                model: this.sensorModel,
                type: this.microphoneType,
                pin: this.analogPin,
                interface: 'Analog'
            }
        };
    }
}

module.exports = SoundSensor;
