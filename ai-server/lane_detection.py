"""
Lane Detection and Vehicle Assignment
Determines which lane each detected vehicle is in based on position
"""

import cv2
import numpy as np
from typing import List, Dict, Tuple

class LaneDetector:
    """
    Detects which lane a vehicle is in based on predefined regions
    """
    
    def __init__(self, frame_width=1280, frame_height=720, num_lanes=4):
        """
        Initialize lane detector with camera dimensions
        
        Args:
            frame_width: Width of camera frame
            frame_height: Height of camera frame
            num_lanes: Number of lanes to detect
        """
        self.frame_width = frame_width
        self.frame_height = frame_height
        self.num_lanes = num_lanes
        
        # Define lane boundaries (can be adjusted based on camera view)
        # These are vertical boundaries dividing the frame into lanes
        self.lane_boundaries = self._calculate_lane_boundaries()
        
    def _calculate_lane_boundaries(self) -> List[int]:
        """
        Calculate equal-width lane boundaries
        Returns list of x-coordinates for lane divisions
        """
        lane_width = self.frame_width // self.num_lanes
        boundaries = [lane_width * i for i in range(self.num_lanes + 1)]
        return boundaries
    
    def set_custom_boundaries(self, boundaries: List[int]):
        """
        Set custom lane boundaries for non-equal lanes
        
        Args:
            boundaries: List of x-coordinates [0, x1, x2, ..., frame_width]
        """
        self.lane_boundaries = boundaries
        self.num_lanes = len(boundaries) - 1
    
    def get_vehicle_lane(self, bbox: Dict) -> int:
        """
        Determine which lane a vehicle is in based on its bounding box
        
        Args:
            bbox: Dictionary with keys 'x1', 'y1', 'x2', 'y2'
            
        Returns:
            Lane number (0-indexed) or -1 if outside lanes
        """
        # Calculate center point of vehicle
        center_x = (bbox['x1'] + bbox['x2']) / 2
        
        # Find which lane the center point falls into
        for i in range(self.num_lanes):
            if self.lane_boundaries[i] <= center_x < self.lane_boundaries[i + 1]:
                return i
        
        return -1  # Outside defined lanes
    
    def assign_vehicles_to_lanes(self, detections: List[Dict]) -> Dict[int, List[Dict]]:
        """
        Assign all detected vehicles to their respective lanes
        
        Args:
            detections: List of detection dictionaries with 'bbox', 'class', 'confidence'
            
        Returns:
            Dictionary mapping lane_number -> list of vehicles in that lane
        """
        lane_assignments = {i: [] for i in range(self.num_lanes)}
        
        for detection in detections:
            lane = self.get_vehicle_lane(detection['bbox'])
            if lane >= 0:
                detection['lane'] = lane
                lane_assignments[lane].append(detection)
        
        return lane_assignments
    
    def draw_lanes(self, frame: np.ndarray, labels: List[str] = None) -> np.ndarray:
        """
        Draw lane boundaries and labels on frame
        
        Args:
            frame: Input frame
            labels: Optional list of lane labels (e.g., ['North', 'South', 'East', 'West'])
            
        Returns:
            Frame with lane boundaries drawn
        """
        frame_copy = frame.copy()
        
        # Default labels if none provided
        if labels is None:
            labels = [f"Lane {i+1}" for i in range(self.num_lanes)]
        
        # Draw vertical lane boundaries
        for i, boundary in enumerate(self.lane_boundaries):
            # Draw boundary line
            if i > 0 and i < len(self.lane_boundaries):
                cv2.line(frame_copy, 
                        (boundary, 0), 
                        (boundary, self.frame_height),
                        (0, 255, 255), 2)  # Yellow lines
        
        # Draw lane labels at top
        for i in range(self.num_lanes):
            center_x = (self.lane_boundaries[i] + self.lane_boundaries[i + 1]) // 2
            label = labels[i] if i < len(labels) else f"Lane {i+1}"
            
            # Draw background rectangle for text
            text_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)[0]
            cv2.rectangle(frame_copy,
                         (center_x - text_size[0]//2 - 5, 10),
                         (center_x + text_size[0]//2 + 5, 40),
                         (0, 0, 0), -1)
            
            # Draw text
            cv2.putText(frame_copy, label,
                       (center_x - text_size[0]//2, 35),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
        
        return frame_copy
    
    def get_lane_statistics(self, lane_assignments: Dict[int, List[Dict]], 
                           labels: List[str] = None) -> Dict:
        """
        Get statistics for each lane
        
        Args:
            lane_assignments: Dictionary from assign_vehicles_to_lanes()
            labels: Optional lane labels
            
        Returns:
            Dictionary with lane statistics
        """
        if labels is None:
            labels = [f"Lane {i+1}" for i in range(self.num_lanes)]
        
        stats = {}
        
        for lane_num, vehicles in lane_assignments.items():
            label = labels[lane_num] if lane_num < len(labels) else f"Lane {lane_num+1}"
            
            # Count by vehicle type
            type_counts = {}
            for vehicle in vehicles:
                v_type = vehicle['class']
                type_counts[v_type] = type_counts.get(v_type, 0) + 1
            
            stats[label] = {
                'total': len(vehicles),
                'by_type': type_counts,
                'vehicles': vehicles
            }
        
        return stats


class DirectionalLaneDetector(LaneDetector):
    """
    Extended lane detector for directional traffic (e.g., 4-way intersection)
    """
    
    def __init__(self, frame_width=1280, frame_height=720):
        super().__init__(frame_width, frame_height, num_lanes=4)
        
        # Define regions for 4-way intersection
        # Format: (x1, y1, x2, y2) for each direction
        self.regions = {
            'north': (0, 0, frame_width // 2, frame_height // 2),
            'south': (frame_width // 2, frame_height // 2, frame_width, frame_height),
            'east': (frame_width // 2, 0, frame_width, frame_height // 2),
            'west': (0, frame_height // 2, frame_width // 2, frame_height)
        }
    
    def set_custom_regions(self, regions: Dict[str, Tuple[int, int, int, int]]):
        """
        Set custom regions for each direction
        
        Args:
            regions: Dict mapping direction -> (x1, y1, x2, y2)
        """
        self.regions = regions
    
    def get_vehicle_direction(self, bbox: Dict) -> str:
        """
        Determine which direction/approach a vehicle is coming from
        
        Args:
            bbox: Bounding box dictionary
            
        Returns:
            Direction string ('north', 'south', 'east', 'west') or 'unknown'
        """
        center_x = (bbox['x1'] + bbox['x2']) / 2
        center_y = (bbox['y1'] + bbox['y2']) / 2
        
        for direction, (x1, y1, x2, y2) in self.regions.items():
            if x1 <= center_x < x2 and y1 <= center_y < y2:
                return direction
        
        return 'unknown'
    
    def assign_vehicles_by_direction(self, detections: List[Dict]) -> Dict[str, List[Dict]]:
        """
        Assign vehicles to directions
        
        Args:
            detections: List of detections
            
        Returns:
            Dictionary mapping direction -> list of vehicles
        """
        direction_assignments = {direction: [] for direction in self.regions.keys()}
        direction_assignments['unknown'] = []
        
        for detection in detections:
            direction = self.get_vehicle_direction(detection['bbox'])
            detection['direction'] = direction
            direction_assignments[direction].append(detection)
        
        return direction_assignments
    
    def draw_directional_regions(self, frame: np.ndarray) -> np.ndarray:
        """
        Draw directional regions on frame
        """
        frame_copy = frame.copy()
        
        colors = {
            'north': (255, 0, 0),    # Blue
            'south': (0, 255, 0),    # Green
            'east': (0, 0, 255),     # Red
            'west': (255, 255, 0)    # Cyan
        }
        
        for direction, (x1, y1, x2, y2) in self.regions.items():
            color = colors.get(direction, (255, 255, 255))
            
            # Draw semi-transparent rectangle
            overlay = frame_copy.copy()
            cv2.rectangle(overlay, (x1, y1), (x2, y2), color, -1)
            cv2.addWeighted(overlay, 0.2, frame_copy, 0.8, 0, frame_copy)
            
            # Draw border
            cv2.rectangle(frame_copy, (x1, y1), (x2, y2), color, 3)
            
            # Draw label
            label_x = (x1 + x2) // 2 - 30
            label_y = (y1 + y2) // 2
            cv2.putText(frame_copy, direction.upper(),
                       (label_x, label_y),
                       cv2.FONT_HERSHEY_SIMPLEX, 1.0, color, 3)
        
        return frame_copy


# Example usage function
def example_usage():
    """Example of how to use the lane detector"""
    
    # Initialize lane detector
    detector = LaneDetector(frame_width=1280, frame_height=720, num_lanes=4)
    
    # Or use custom boundaries
    # detector.set_custom_boundaries([0, 300, 600, 900, 1280])
    
    # Example detections from YOLO
    detections = [
        {'class': 'fire_truck', 'confidence': 0.95, 'bbox': {'x1': 100, 'y1': 200, 'x2': 300, 'y2': 400}},
        {'class': 'police_car', 'confidence': 0.89, 'bbox': {'x1': 500, 'y1': 300, 'x2': 700, 'y2': 500}},
        {'class': 'ambulance', 'confidence': 0.92, 'bbox': {'x1': 900, 'y1': 250, 'x2': 1100, 'y2': 450}},
    ]
    
    # Assign vehicles to lanes
    lane_assignments = detector.assign_vehicles_to_lanes(detections)
    
    # Get statistics
    stats = detector.get_lane_statistics(lane_assignments, 
                                         labels=['North Bound', 'South Bound', 'East Bound', 'West Bound'])
    
    print("Lane Statistics:")
    for lane, info in stats.items():
        print(f"{lane}: {info['total']} vehicles - {info['by_type']}")
    
    return lane_assignments


if __name__ == "__main__":
    example_usage()
