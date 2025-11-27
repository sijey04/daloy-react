"""
Test lane detection functionality
"""

from lane_detection import LaneDetector, DirectionalLaneDetector
import json

def test_basic_lane_detection():
    """Test basic lane detection"""
    print("\n" + "="*60)
    print("TEST 1: Basic Lane Detection (4 Equal Lanes)")
    print("="*60)
    
    # Initialize detector
    detector = LaneDetector(frame_width=1280, frame_height=720, num_lanes=4)
    
    print(f"Frame size: 1280x720")
    print(f"Number of lanes: {detector.num_lanes}")
    print(f"Lane boundaries: {detector.lane_boundaries}")
    
    # Test detections
    test_detections = [
        {
            'class': 'fire_truck',
            'confidence': 0.95,
            'bbox': {'x1': 100, 'y1': 200, 'x2': 300, 'y2': 400}  # Lane 1
        },
        {
            'class': 'police_car',
            'confidence': 0.89,
            'bbox': {'x1': 400, 'y1': 300, 'x2': 600, 'y2': 500}  # Lane 2
        },
        {
            'class': 'ambulance',
            'confidence': 0.92,
            'bbox': {'x1': 700, 'y1': 250, 'x2': 900, 'y2': 450}  # Lane 3
        },
        {
            'class': 'normal_vehicle',
            'confidence': 0.87,
            'bbox': {'x1': 1000, 'y1': 280, 'x2': 1200, 'y2': 480}  # Lane 4
        },
        {
            'class': 'normal_vehicle',
            'confidence': 0.82,
            'bbox': {'x1': 150, 'y1': 100, 'x2': 350, 'y2': 300}  # Lane 1
        },
    ]
    
    # Assign to lanes
    lane_assignments = detector.assign_vehicles_to_lanes(test_detections)
    
    print(f"\nVehicle assignments:")
    for lane_num, vehicles in lane_assignments.items():
        print(f"  Lane {lane_num + 1}: {len(vehicles)} vehicle(s)")
        for v in vehicles:
            print(f"    - {v['class']} (confidence: {v['confidence']:.2f})")
    
    # Get statistics
    lane_stats = detector.get_lane_statistics(
        lane_assignments,
        labels=['North Bound', 'South Bound', 'East Bound', 'West Bound']
    )
    
    print(f"\nLane Statistics:")
    for lane_name, info in lane_stats.items():
        print(f"\n  {lane_name}:")
        print(f"    Total vehicles: {info['total']}")
        print(f"    By type: {info['by_type']}")
    
    return True


def test_custom_boundaries():
    """Test custom lane boundaries"""
    print("\n" + "="*60)
    print("TEST 2: Custom Lane Boundaries (Unequal Widths)")
    print("="*60)
    
    # Initialize with equal lanes
    detector = LaneDetector(frame_width=1280, frame_height=720, num_lanes=3)
    
    # Set custom boundaries for unequal lanes
    custom_boundaries = [0, 200, 800, 1280]
    detector.set_custom_boundaries(custom_boundaries)
    
    print(f"Custom boundaries: {detector.lane_boundaries}")
    print(f"Lane widths: {[custom_boundaries[i+1] - custom_boundaries[i] for i in range(len(custom_boundaries)-1)]}")
    
    # Test detection
    test_detection = {
        'class': 'fire_truck',
        'confidence': 0.95,
        'bbox': {'x1': 100, 'y1': 200, 'x2': 180, 'y2': 400}
    }
    
    lane = detector.get_vehicle_lane(test_detection['bbox'])
    print(f"\nFire truck at x=100-180 is in: Lane {lane + 1}")
    
    return True


def test_directional_detection():
    """Test directional detection for intersections"""
    print("\n" + "="*60)
    print("TEST 3: Directional Detection (4-Way Intersection)")
    print("="*60)
    
    # Initialize directional detector
    detector = DirectionalLaneDetector(frame_width=1280, frame_height=720)
    
    print(f"Regions configured:")
    for direction, (x1, y1, x2, y2) in detector.regions.items():
        print(f"  {direction}: ({x1}, {y1}) -> ({x2}, {y2})")
    
    # Test detections from different directions
    test_detections = [
        {
            'class': 'fire_truck',
            'confidence': 0.95,
            'bbox': {'x1': 200, 'y1': 100, 'x2': 400, 'y2': 300}  # North
        },
        {
            'class': 'police_car',
            'confidence': 0.89,
            'bbox': {'x1': 800, 'y1': 500, 'x2': 1000, 'y2': 700}  # South
        },
        {
            'class': 'ambulance',
            'confidence': 0.92,
            'bbox': {'x1': 800, 'y1': 100, 'x2': 1000, 'y2': 300}  # East
        },
        {
            'class': 'normal_vehicle',
            'confidence': 0.87,
            'bbox': {'x1': 200, 'y1': 500, 'x2': 400, 'y2': 700}  # West
        },
    ]
    
    # Assign by direction
    direction_assignments = detector.assign_vehicles_by_direction(test_detections)
    
    print(f"\nVehicles by direction:")
    for direction, vehicles in direction_assignments.items():
        if vehicles:
            print(f"\n  {direction.upper()}:")
            for v in vehicles:
                print(f"    - {v['class']} (confidence: {v['confidence']:.2f})")
    
    return True


def test_api_response_format():
    """Test API response format"""
    print("\n" + "="*60)
    print("TEST 4: API Response Format")
    print("="*60)
    
    detector = LaneDetector(frame_width=1280, frame_height=720, num_lanes=4)
    
    test_detections = [
        {
            'class': 'fire_truck',
            'confidence': 0.95,
            'bbox': {'x1': 100, 'y1': 200, 'x2': 300, 'y2': 400}
        },
        {
            'class': 'police_car',
            'confidence': 0.89,
            'bbox': {'x1': 400, 'y1': 300, 'x2': 600, 'y2': 500}
        },
    ]
    
    lane_assignments = detector.assign_vehicles_to_lanes(test_detections)
    lane_stats = detector.get_lane_statistics(
        lane_assignments,
        labels=['Lane 1', 'Lane 2', 'Lane 3', 'Lane 4']
    )
    
    # Simulate API response
    api_response = {
        'success': True,
        'timestamp': '2025-11-02T12:00:00',
        'total_vehicles': len(test_detections),
        'lane_statistics': lane_stats,
        'detections': test_detections
    }
    
    print("\nAPI Response (JSON):")
    print(json.dumps(api_response, indent=2))
    
    return True


def run_all_tests():
    """Run all tests"""
    print("\n🧪 LANE DETECTION TEST SUITE")
    print("="*60)
    
    tests = [
        ("Basic Lane Detection", test_basic_lane_detection),
        ("Custom Boundaries", test_custom_boundaries),
        ("Directional Detection", test_directional_detection),
        ("API Response Format", test_api_response_format),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            success = test_func()
            results.append((test_name, success))
            print(f"\n✅ {test_name}: PASSED")
        except Exception as e:
            results.append((test_name, False))
            print(f"\n❌ {test_name}: FAILED")
            print(f"   Error: {str(e)}")
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    passed = sum(1 for _, success in results if success)
    total = len(results)
    print(f"\nPassed: {passed}/{total}")
    
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"  {status}: {test_name}")
    
    print("\n" + "="*60)
    
    return passed == total


if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)
