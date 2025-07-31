/**
 * Humidity Sensor Module
 * Simulates humidity readings for IoT dashboard
 * Can be replaced with actual hardware sensor integration
 */
class HumiditySensor {
  constructor(baseHumidity = 60, variance = 20) {
    this.name = 'Humidity Sensor';
    this.type = 'humidity';
    this.unit = '%';
    this.baseHumidity = baseHumidity;
    this.variance = variance;
    this.currentValue = baseHumidity;
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

    // Simulate gradual humidity changes
    const change = (Math.random() - 0.5) * 3;
    this.currentValue += change * 0.3;
    
    // Keep within 0-100% bounds
    this.currentValue = Math.max(0, Math.min(100, this.currentValue));
    
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
    console.log(`Humidity sensor ${this.isActive ? 'activated' : 'deactivated'}`);
  }

  calibrate(referenceHumidity) {
    if (referenceHumidity && typeof referenceHumidity === 'number') {
      this.currentValue = Math.max(0, Math.min(100, referenceHumidity));
      console.log(`Humidity sensor calibrated to ${this.currentValue}${this.unit}`);
    }
  }

  getStatus() {
    return {
      name: this.name,
      type: this.type,
      active: this.isActive,
      currentValue: this.currentValue,
      unit: this.unit,
      range: `0-100 ${this.unit}`
    };
  }
}

module.exports = HumiditySensor;
