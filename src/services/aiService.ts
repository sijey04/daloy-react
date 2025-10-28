import axios from 'axios';

const BRIDGE_URL = 'http://localhost:3001';

export interface DetectionResult {
  class: string;
  confidence: number;
  orientation?: string;  // NEW: car orientation (front/back/left/right)
  bbox: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width?: number;        // NEW: bbox width
    height?: number;       // NEW: bbox height
    center_x?: number;     // NEW: bbox center x
    center_y?: number;     // NEW: bbox center y
    area?: number;         // NEW: bbox area
    aspect_ratio?: number; // NEW: width/height ratio
  };
}

export interface VehicleCounts {
  car: number;
  truck: number;
  bus: number;
  motorcycle: number;
  bicycle: number;
}

export interface OrientationCounts {
  front: number;
  back: number;
  left: number;
  right: number;
  unknown: number;
}

export interface DetectionResponse {
  success: boolean;
  timestamp: string;
  total_vehicles: number;
  vehicle_counts: VehicleCounts;
  orientation_counts?: OrientationCounts;  // NEW: orientation statistics
  detections: DetectionResult[];
  image_size: {
    width: number;
    height: number;
  };
  preprocessing_applied?: boolean;  // NEW: indicates if preprocessing was used
  detection_params?: {              // NEW: detection parameters used
    confidence_threshold: number;
    iou_threshold: number;
    augment: boolean;
  };
}

export interface AnalyticsData {
  intersection_id: string;
  timestamp: string;
  current_data: {
    total_vehicles: number;
    vehicles_by_type: VehicleCounts;
    fps: number;
  };
  analytics: {
    vehicles_per_hour: number;
    congestion_level: string;
    average_speed: number;
    peak_hours: string[];
  };
}

class AIService {
  private baseURL: string;

  constructor() {
    this.baseURL = BRIDGE_URL;
  }

  /**
   * Check if AI server is healthy
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/api/ai/health`);
      return response.data.status === 'healthy';
    } catch (error) {
      console.error('AI health check failed:', error);
      return false;
    }
  }

  /**
   * Detect vehicles in an image
   */
  async detectVehicles(imageFile: File): Promise<DetectionResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await axios.post(`${this.baseURL}/api/detect`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Detect vehicles from canvas (camera stream)
   */
  async detectFromCanvas(canvas: HTMLCanvasElement): Promise<DetectionResponse> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          reject(new Error('Failed to convert canvas to blob'));
          return;
        }

        const file = new File([blob], 'frame.jpg', { type: 'image/jpeg' });
        try {
          const result = await this.detectVehicles(file);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, 'image/jpeg', 0.8);
    });
  }

  /**
   * Get traffic analytics for an intersection
   */
  async getAnalytics(intersectionId: string): Promise<AnalyticsData> {
    const response = await axios.get(`${this.baseURL}/api/analytics/${intersectionId}`);
    return response.data;
  }

  /**
   * Start real-time detection (polling)
   */
  startRealtimeDetection(
    canvas: HTMLCanvasElement,
    onDetection: (result: DetectionResponse) => void,
    onError: (error: Error) => void,
    interval: number = 1000 // 1 second
  ): number {
    const intervalId = window.setInterval(async () => {
      try {
        const result = await this.detectFromCanvas(canvas);
        onDetection(result);
      } catch (error) {
        onError(error as Error);
      }
    }, interval);

    return intervalId;
  }

  /**
   * Stop real-time detection
   */
  stopRealtimeDetection(intervalId: number): void {
    clearInterval(intervalId);
  }

  /**
   * Draw detections on canvas with improved visualization
   */
  drawDetections(
    canvas: HTMLCanvasElement,
    detections: DetectionResult[],
    colors: Record<string, string> = {
      car: '#00ff00',
      truck: '#ff0000',
      bus: '#0000ff',
      motorcycle: '#ffff00',
      bicycle: '#ff00ff',
      // Toy car colors
      toy_car_front: '#00ff00',
      toy_car_back: '#ff6600',
      toy_car_left: '#00ccff',
      toy_car_right: '#ff00ff',
    }
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each detection
    detections.forEach((detection) => {
      const color = colors[detection.class] || '#ffffff';
      const { x1, y1, x2, y2 } = detection.bbox;

      // Draw bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

      // Build label with orientation if available
      let label = `${detection.class} ${(detection.confidence * 100).toFixed(1)}%`;
      if (detection.orientation) {
        label = `${detection.class} (${detection.orientation}) ${(detection.confidence * 100).toFixed(1)}%`;
      }

      // Draw label background
      ctx.font = '16px Arial';
      const textMetrics = ctx.measureText(label);
      const textHeight = 20;
      const padding = 4;

      ctx.fillStyle = color;
      ctx.fillRect(
        x1,
        y1 - textHeight - padding,
        textMetrics.width + padding * 2,
        textHeight + padding
      );

      // Draw label text
      ctx.fillStyle = '#000000';
      ctx.fillText(label, x1 + padding, y1 - padding);

      // Draw center point if available
      if (detection.bbox.center_x && detection.bbox.center_y) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(detection.bbox.center_x, detection.bbox.center_y, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  }
}

export const aiService = new AIService();
export default aiService;
