// Shared type definitions for camera and traffic system

export interface Camera {
  id: number;
  name: string;
  status: string;
  orientation: number;
  zoom: number;
  ip: string;
  model: string;
  installation: string;
}

export interface TrafficLight {
  id: number;
  direction: string;
  currentState: string;
  timeRemaining: number;
  cycleTime: {
    green: number;
    yellow: number;
    red: number;
  };
}

export interface TrafficAnalysis {
  vehiclesPerHour: number;
  averageSpeed: number;
  congestionLevel: string;
  peakHours: string[];
  vehicleTypes: {
    cars: number;
    trucks: number;
    buses: number;
    motorcycles: number;
    bicycles: number;
  };
  waitTimes: {
    average: number;
    north: number;
    east: number;
    south: number;
    west: number;
  };
}

export interface IntersectionData {
  id: number;
  name: string;
  location: string;
  status: string;
  trafficLevel: string;
  vehicleCount: number;
  lastUpdated: string;
  cameras: Camera[];
  trafficLights: TrafficLight[];
  trafficAnalysis: TrafficAnalysis;
}

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
