import axios from 'axios';

const BRIDGE_URL = 'http://localhost:5001';  // Pretrained model server port

export interface DetectionResult {
  class: string;
  confidence: number;
  orientation?: string;
  bbox: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width?: number;
    height?: number;
    center_x?: number;
    center_y?: number;
    area?: number;
    aspect_ratio?: number;
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
  orientation_counts?: OrientationCounts;
  detections: DetectionResult[];
  image_size: {
    width: number;
    height: number;
  };
  preprocessing_applied?: boolean;
  detection_params?: {
    image_size: number;
    confidence_threshold: number;
    iou_threshold: number;
    max_detections: number;
    augment: boolean;
    half_precision: boolean;
    mode: string;
    model_type?: string;
  };
}

/**
 * AI Service for Pretrained YOLO Model (COCO Dataset)
 * Connects to Flask server on port 5001
 */
class AIServicePretrained {
  private intervalIds: Map<number, number> = new Map();
  private nextIntervalId = 1;

  /**
   * Check if AI server is healthy
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${BRIDGE_URL}/health`, { timeout: 5000 });
      return response.data.status === 'healthy' && response.data.model_type === 'pretrained';
    } catch (error) {
      console.error('❌ Pretrained AI server health check failed:', error);
      return false;
    }
  }

  /**
   * Detect vehicles in an image
   */
  async detectVehicles(imageBlob: Blob): Promise<DetectionResponse> {
    try {
      const formData = new FormData();
      formData.append('image', imageBlob, 'frame.jpg');

      const response = await axios.post<DetectionResponse>(
        `${BRIDGE_URL}/detect`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000
        }
      );

      return response.data;
    } catch (error) {
      console.error('❌ Pretrained detection error:', error);
      throw error;
    }
  }

  /**
   * Start real-time detection on a canvas
   */
  startRealtimeDetection(
    canvas: HTMLCanvasElement,
    onDetection: (result: DetectionResponse) => void,
    onError: (error: Error) => void,
    intervalMs: number = 5000
  ): number {
    const intervalId = this.nextIntervalId++;

    const detect = async () => {
      try {
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((b) => {
            if (b) resolve(b);
            else reject(new Error('Failed to convert canvas to blob'));
          }, 'image/jpeg', 0.95);
        });

        const result = await this.detectVehicles(blob);
        onDetection(result);
      } catch (error) {
        onError(error as Error);
      }
    };

    detect();
    const interval = window.setInterval(detect, intervalMs);
    this.intervalIds.set(intervalId, interval);

    return intervalId;
  }

  /**
   * Stop real-time detection
   */
  stopRealtimeDetection(intervalId: number): void {
    const interval = this.intervalIds.get(intervalId);
    if (interval !== undefined) {
      clearInterval(interval);
      this.intervalIds.delete(intervalId);
    }
  }

  /**
   * Draw detection bounding boxes on canvas
   */
  drawDetections(
    canvas: HTMLCanvasElement,
    detections: DetectionResult[],
    rotation?: number,
    skipRotation: boolean = false
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!skipRotation && rotation !== undefined) {
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    // Color mapping for pretrained COCO classes
    const colorMap: Record<string, string> = {
      car: '#00ccff',           // Cyan
      truck: '#ff6b00',         // Orange
      bus: '#ff00ff',           // Magenta
      motorcycle: '#ffff00',    // Yellow
      bicycle: '#00ff00'        // Green
    };

    detections.forEach((det) => {
      const color = colorMap[det.class] || '#ffffff';
      const { x1, y1, x2, y2 } = det.bbox;

      // Draw bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

      // Draw label background
      const label = `${det.class} ${(det.confidence * 100).toFixed(0)}%`;
      ctx.font = 'bold 16px Arial';
      const textMetrics = ctx.measureText(label);
      const textHeight = 20;

      ctx.fillStyle = color;
      ctx.fillRect(x1, y1 - textHeight - 4, textMetrics.width + 8, textHeight + 4);

      // Draw label text
      ctx.fillStyle = '#000000';
      ctx.fillText(label, x1 + 4, y1 - 8);
    });

    if (!skipRotation && rotation !== undefined) {
      ctx.restore();
    }
  }

  /**
   * Stop all active intervals
   */
  stopAll(): void {
    this.intervalIds.forEach((interval) => clearInterval(interval));
    this.intervalIds.clear();
  }
}

export const aiServicePretrained = new AIServicePretrained();
