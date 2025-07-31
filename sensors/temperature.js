/**
 * Temperature Sensor Module
 * Simulates temperature readings for IoT dashboard
 * Can be replaced with actual hardware sensor integration
 */
class TemperatureSensor {
  constructor(baseTemp = 25, variance = 5) {
    this.name = 'Temperature Sensor';
    this.type = 'temperature';
    this.unit = '°C';
    this.baseTemp = baseTemp;
    this.variance = variance;
    this.currentValue = baseTemp;
    this.isActive = true;
  }
  
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

    // Simulate gradual temperature changes
    const change = (Math.random() - 0.5) * 2;
    this.currentValue += change * 0.5;
    
    // Keep within reasonable bounds
    this.currentValue = Math.max(
      this.baseTemp - this.variance,
      Math.min(this.baseTemp + this.variance, this.currentValue)
    );
    
    return {
      value: Math.round(this.currentValue * 10) / 10,
      unit: this.unit,
      timestamp: new Date().toISOString(),
      sensor: this.type,
      status: 'active',
      location: 'Indoor'
    };
  }

  // Legacy method for backward compatibility
  read() {
    return this.readValue().then(data => data.value);
  }

  toggle() {
    this.isActive = !this.isActive;
    console.log(`Temperature sensor ${this.isActive ? 'activated' : 'deactivated'}`);
  }

  calibrate(referenceTemp) {
    if (referenceTemp && typeof referenceTemp === 'number') {
      this.currentValue = referenceTemp;
      this.baseTemp = referenceTemp;
      console.log(`Temperature sensor calibrated to ${referenceTemp}${this.unit}`);
    }
  }

  getStatus() {
    return {
      name: this.name,
      type: this.type,
      active: this.isActive,
      currentValue: this.currentValue,
      unit: this.unit,
      range: `${this.baseTemp - this.variance}-${this.baseTemp + this.variance} ${this.unit}`
    };
  }
}

module.exports = TemperatureSensor;
