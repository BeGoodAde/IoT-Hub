/**
 * Light Sensor Module
 * Simulates light level readings for IoT dashboard
 * Can be replaced with actual light sensor integration
 */
class LightSensor {
  constructor(baseLight = 500, variance = 400) {
    this.name = 'Light Sensor';
    this.type = 'light';
    this.unit = 'lux';
    this.baseLight = baseLight;
    this.variance = variance;
    this.currentValue = baseLight;
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

    // Simulate light changes based on time of day
    const hour = new Date().getHours();
    let timeOfDayMultiplier = 1;
    
    if (hour < 6 || hour > 20) {
      timeOfDayMultiplier = 0.1; // Night time
    } else if (hour < 8 || hour > 18) {
      timeOfDayMultiplier = 0.5; // Dawn/dusk
    } else {
      timeOfDayMultiplier = 1; // Day time
    }
    
    // Add some random variation
    const change = (Math.random() - 0.5) * 100;
    this.currentValue += change * 0.2;
    
    // Apply time of day effect
    const adjustedReading = this.currentValue * timeOfDayMultiplier;
    
    // Keep within reasonable bounds (0-1000 lux)
    this.currentValue = Math.max(0, Math.min(1000, adjustedReading));
    
    return {
      value: Math.round(this.currentValue),
      unit: this.unit,
      timeOfDay: hour < 6 || hour > 20 ? 'night' : hour < 8 || hour > 18 ? 'twilight' : 'day',
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
    console.log(`Light sensor ${this.isActive ? 'activated' : 'deactivated'}`);
  }

  calibrate(referenceLux) {
    if (referenceLux && typeof referenceLux === 'number' && referenceLux >= 0) {
      this.currentValue = referenceLux;
      console.log(`Light sensor calibrated to ${referenceLux} ${this.unit}`);
    }
  }

  getStatus() {
    return {
      name: this.name,
      type: this.type,
      active: this.isActive,
      currentValue: this.currentValue,
      unit: this.unit,
      range: `0-1000 ${this.unit}`
    };
  }
}

module.exports = LightSensor;
