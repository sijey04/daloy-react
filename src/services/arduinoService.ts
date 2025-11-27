// Arduino Bridge API Service
// Handles communication with the Arduino bridge server

const BRIDGE_API_URL = 'http://localhost:3001/api';
const WEBSOCKET_URL = 'ws://localhost:3002';

// Arduino connection status
export interface ArduinoStatus {
  connected: boolean;
  status: {
    northSouth: string;
    eastWest: string;
    road3: string;
    road4: string;
    mode: string;
  };
}

// Traffic light timing configuration
export interface TrafficLightTiming {
  lightId: number;
  direction: string;
  green: number;
  yellow: number;
  red: number;
}

class ArduinoService {
  private ws: WebSocket | null = null;

  // Connect to WebSocket for real-time updates
  connectWebSocket(onStatusUpdate: (status: ArduinoStatus) => void) {
    try {
      this.ws = new WebSocket(WEBSOCKET_URL);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected to Arduino bridge');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'status') {
            onStatusUpdate({
              connected: true,
              status: data.data
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          console.log('Attempting to reconnect...');
          this.connectWebSocket(onStatusUpdate);
        }, 5000);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }

  // Disconnect WebSocket
  disconnectWebSocket() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Get current Arduino status
  async getStatus(): Promise<ArduinoStatus> {
    try {
      const response = await fetch(`${BRIDGE_API_URL}/status`);
      if (!response.ok) {
        throw new Error('Failed to get Arduino status');
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting Arduino status:', error);
      return {
        connected: false,
        status: {
          northSouth: 'UNKNOWN',
          eastWest: 'UNKNOWN',
          road3: 'UNKNOWN',
          road4: 'UNKNOWN',
          mode: 'DISCONNECTED'
        }
      };
    }
  }

  // Set traffic light mode (AUTO, STOP, TEST)
  async setMode(mode: 'AUTO' | 'STOP' | 'TEST'): Promise<boolean> {
    try {
      const response = await fetch(`${BRIDGE_API_URL}/mode/${mode}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to set mode to ${mode}`);
      }
      
      const result = await response.json();
      console.log(`✅ Mode set to ${mode}`, result);
      return result.success;
    } catch (error) {
      console.error(`Error setting mode to ${mode}:`, error);
      return false;
    }
  }

  // Set specific traffic light color
  async setLight(road: 'north-south' | 'east-west' | 'road3' | 'road4', color: 'red' | 'yellow' | 'green'): Promise<boolean> {
    try {
      const response = await fetch(`${BRIDGE_API_URL}/light/${road}/${color}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to set ${road} to ${color}`);
      }
      
      const result = await response.json();
      console.log(`✅ ${road} set to ${color}`, result);
      return result.success;
    } catch (error) {
      console.error(`Error setting ${road} to ${color}:`, error);
      return false;
    }
  }

  // Send raw command to Arduino
  async sendCommand(command: string): Promise<boolean> {
    try {
      const response = await fetch(`${BRIDGE_API_URL}/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send command: ${command}`);
      }
      
      const result = await response.json();
      console.log(`✅ Command sent: ${command}`, result);
      return result.success;
    } catch (error) {
      console.error(`Error sending command ${command}:`, error);
      return false;
    }
  }

  // Emergency stop - set all lights to red
  async emergencyStop(): Promise<boolean> {
    try {
      const response = await fetch(`${BRIDGE_API_URL}/emergency-stop`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to trigger emergency stop');
      }
      
      const result = await response.json();
      console.log('🚨 Emergency stop activated', result);
      return result.success;
    } catch (error) {
      console.error('Error triggering emergency stop:', error);
      return false;
    }
  }

  // Apply traffic light timing configuration
  async applyTimingConfiguration(timings: TrafficLightTiming[], sequence: number[]): Promise<boolean> {
    try {
      console.log('Applying timing configuration:', { timings, sequence });
      
      // First, stop any running AUTO mode
      await this.setMode('STOP');
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
      
      // Send timing configuration for each light
      // We'll use the first light's timing as the global timing
      // (since Arduino uses same timing for all roads)
      if (timings.length > 0) {
        const firstTiming = timings[0];
        
        // Send green duration
        await this.sendCommand(`SET_GREEN:${firstTiming.green}`);
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Send yellow duration
        await this.sendCommand(`SET_YELLOW:${firstTiming.yellow}`);
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Send red duration (not used in AUTO mode, but set anyway)
        await this.sendCommand(`SET_RED:${firstTiming.red}`);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Send sequence configuration
      // sequence array contains indices 0-3 representing the order
      const sequenceStr = sequence.join(',');
      await this.sendCommand(`SET_SEQUENCE:${sequenceStr}`);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Now start AUTO mode with new configuration
      const success = await this.setMode('AUTO');
      
      if (success) {
        console.log('✅ Timing configuration applied');
        console.log(`   Green: ${timings[0]?.green}s, Yellow: ${timings[0]?.yellow}s`);
        console.log(`   Sequence: ${sequence.join(' → ')}`);
        // In future: send actual timing values to Arduino
        // await this.sendCommand(`SET_TIMING:${JSON.stringify(timings)}`);
      }
      
      return success;
    } catch (error) {
      console.error('Error applying timing configuration:', error);
      return false;
    }
  }

  // Manual control - set specific road to green (others go red automatically for safety)
  async setRoadGreen(direction: string): Promise<boolean> {
    const roadMap: { [key: string]: string } = {
      'North': 'north-south',
      'South': 'north-south',
      'East': 'east-west',
      'West': 'east-west',
      'Road 3': 'road3',
      'Road 4': 'road4'
    };

    const road = roadMap[direction];
    if (!road) {
      console.error(`Unknown direction: ${direction}`);
      return false;
    }

    return await this.setLight(road as 'north-south' | 'east-west' | 'road3' | 'road4', 'green');
  }

  // Test all LEDs
  async testAllLEDs(): Promise<boolean> {
    return await this.sendCommand('TEST');
  }

  // Check if bridge server is running
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${BRIDGE_API_URL}/status`);
      return response.ok;
    } catch (error) {
      console.error('Bridge server not reachable:', error);
      return false;
    }
  }

  // ============================================
  // ADAPTIVE TRAFFIC LIGHT CONTROL (AI-DRIVEN)
  // ============================================

  /**
   * Calculate adaptive green light duration based on AI detection results
   * Formula: baseTime + (vehicleCount × timePerVehicle) + waitTimeBonus + emergencyBonus
   * 
   * @param vehicleCount - Number of vehicles detected in lane
   * @param waitTimeSec - How long this lane has been waiting (in seconds)
   * @param hasEmergency - Whether emergency vehicle (ambulance/fire truck/police) detected
   * @returns Optimal green light duration in seconds (clamped to 15-60s)
   */
  calculateAdaptiveGreenTime(
    vehicleCount: number,
    waitTimeSec: number = 0,
    hasEmergency: boolean = false
  ): number {
    const BASE_TIME = 15; // Minimum green time (seconds)
    const TIME_PER_VEHICLE = 3; // Additional seconds per vehicle
    const MAX_GREEN_TIME = 60; // Maximum green time (seconds)
    const MIN_GREEN_TIME = 15; // Minimum green time (seconds)
    const WAIT_TIME_BONUS_FACTOR = 0.5; // Bonus seconds per second of wait time
    const EMERGENCY_BONUS = 30; // Extra seconds for emergency vehicles
    
    // Base calculation
    let greenTime = BASE_TIME;
    
    // Add time based on vehicle count
    greenTime += vehicleCount * TIME_PER_VEHICLE;
    
    // Add bonus for lanes that have been waiting longer (prevent starvation)
    if (waitTimeSec > 30) { // Only apply bonus after 30s of waiting
      const waitBonus = (waitTimeSec - 30) * WAIT_TIME_BONUS_FACTOR;
      greenTime += Math.min(waitBonus, 15); // Cap wait bonus at 15s
    }
    
    // Emergency vehicle priority - significant time extension
    if (hasEmergency) {
      greenTime += EMERGENCY_BONUS;
      console.log('🚨 EMERGENCY VEHICLE DETECTED - Extended green time');
    }
    
    // Clamp to min/max range
    greenTime = Math.max(MIN_GREEN_TIME, Math.min(MAX_GREEN_TIME, Math.round(greenTime)));
    
    console.log(`🟢 Adaptive Green Time: ${greenTime}s (vehicles: ${vehicleCount}, wait: ${waitTimeSec}s, emergency: ${hasEmergency})`);
    
    return greenTime;
  }

  /**
   * Apply AI-driven traffic light decision to Arduino hardware
   * This is the bridge between AI detection and physical traffic lights
   * 
   * @param direction - Lane direction (east/west/south/north)
   * @param greenDuration - Calculated green light duration in seconds
   * @param yellowDuration - Yellow light duration (default 5s)
   * @returns Success status
   */
  async applyTrafficLightDecision(
    direction: 'east' | 'west' | 'south' | 'north',
    greenDuration: number,
    yellowDuration: number = 5
  ): Promise<boolean> {
    try {
      console.log(`🚦 Applying AI decision: ${direction.toUpperCase()} → Green for ${greenDuration}s`);
      
      // Map direction to Arduino road designation
      const roadMap: { [key: string]: 'north-south' | 'east-west' | 'road3' | 'road4' } = {
        'north': 'north-south',
        'south': 'north-south',
        'east': 'east-west',
        'west': 'east-west'
      };
      
      const road = roadMap[direction];
      if (!road) {
        console.error(`Invalid direction: ${direction}`);
        return false;
      }
      
      // Step 1: Set all lights to red for safety (clearance phase)
      await this.setMode('STOP');
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2s all-red clearance
      
      // Step 2: Configure timing for this cycle
      await this.sendCommand(`SET_GREEN:${greenDuration}`);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      await this.sendCommand(`SET_YELLOW:${yellowDuration}`);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Step 3: Activate green light for the calculated direction
      const success = await this.setLight(road, 'green');
      
      if (success) {
        console.log(`✅ ${direction.toUpperCase()} lane activated with ${greenDuration}s green time`);
        
        // Step 4: Schedule yellow light transition
        setTimeout(async () => {
          await this.setLight(road, 'yellow');
          console.log(`🟡 ${direction.toUpperCase()} → Yellow (${yellowDuration}s)`);
          
          // Step 5: Schedule red light after yellow
          setTimeout(async () => {
            await this.setLight(road, 'red');
            console.log(`🔴 ${direction.toUpperCase()} → Red`);
          }, yellowDuration * 1000);
        }, greenDuration * 1000);
      }
      
      return success;
    } catch (error) {
      console.error(`Error applying traffic light decision for ${direction}:`, error);
      // Safety fallback: emergency stop
      await this.emergencyStop();
      return false;
    }
  }
}

// Export singleton instance
export const arduinoService = new ArduinoService();

// Helper function to convert light ID to road name
export function lightIdToRoad(lightId: number): 'north-south' | 'east-west' | 'road3' | 'road4' {
  const map: { [key: number]: 'north-south' | 'east-west' | 'road3' | 'road4' } = {
    1: 'north-south',
    2: 'east-west',
    3: 'road3',
    4: 'road4'
  };
  return map[lightId] || 'north-south';
}
