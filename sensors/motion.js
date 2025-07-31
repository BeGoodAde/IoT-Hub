/**
 * Motion Sensor Module
 * Simulates motion detection for IoT dashboard
 * Can be replaced with actual PIR sensor integration
 */
class MotionSensor {
  constructor(sensitivity = 0.1) {
    this.name = 'Motion Sensor';
    this.type = 'motion';
    this.unit = 'boolean';
    this.sensitivity = sensitivity;
    this.lastMotion = false;
    this.motionStartTime = null;
    this.isActive = true;
  }
  
  async readValue() {
    if (!this.isActive) {
      return {
        value: 0,
        unit: this.unit,
        timestamp: new Date().toISOString(),
        sensor: this.type,
        status: 'inactive'
      };
    }

    // Simulate motion detection based on random events
    const motionDetected = Math.random() < this.sensitivity;
    
    if (motionDetected && !this.lastMotion) {
      this.motionStartTime = new Date();
    }
    
    this.lastMotion = motionDetected;
    
    return {
      value: motionDetected ? 1 : 0,
      status: motionDetected ? 'detected' : 'clear',
      duration: this.motionStartTime ? Date.now() - this.motionStartTime.getTime() : 0,
      timestamp: new Date().toISOString(),
      sensor: this.type,
      location: 'Indoor',
      sensitivity: this.sensitivity
    };
  }

  // Legacy method for backward compatibility
  read() {
    return this.readValue().then(data => data.value);
  }

  toggle() {
    this.isActive = !this.isActive;
    console.log(`Motion sensor ${this.isActive ? 'activated' : 'deactivated'}`);
  }

  calibrate(newSensitivity) {
    if (newSensitivity && typeof newSensitivity === 'number' && newSensitivity > 0 && newSensitivity <= 1) {
      this.sensitivity = newSensitivity;
      console.log(`Motion sensor sensitivity set to ${newSensitivity}`);
    }
  }

  getStatus() {
    return {
      name: this.name,
      type: this.type,
      active: this.isActive,
      sensitivity: this.sensitivity,
      lastMotion: this.lastMotion,
      unit: this.unit
    };
  }
}

module.exports = MotionSensor;
