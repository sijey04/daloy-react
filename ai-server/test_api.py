import requests
import json
from pathlib import Path

print("=" * 80)
print("Testing AI Server API Response")
print("=" * 80)

# Wait for server to start
import time
print("\nWaiting 3 seconds for server to start...")
time.sleep(3)

# Test health endpoint
print("\n1. Testing health endpoint...")
try:
    response = requests.get('http://localhost:5000/health', timeout=5)
    print(f"✅ Health check: {response.json()}")
except Exception as e:
    print(f"❌ Health check failed: {e}")
    exit(1)

# Test detection endpoint
print("\n2. Testing detection endpoint with east.jfif...")
image_path = Path('../public/images/east.jfif')

if not image_path.exists():
    print(f"❌ Image not found: {image_path}")
    exit(1)

try:
    with open(image_path, 'rb') as f:
        files = {'image': ('east.jfif', f, 'image/jpeg')}
        response = requests.post('http://localhost:5000/detect', files=files, timeout=10)
    
    data = response.json()
    
    print("\n3. Response Structure:")
    print(f"   Success: {data.get('success')}")
    print(f"   Total vehicles: {data.get('total_vehicles')}")
    print(f"   Vehicle counts: {data.get('vehicle_counts')}")
    print(f"   Number of detections: {len(data.get('detections', []))}")
    
    print("\n4. Sample Detection:")
    if data.get('detections'):
        det = data['detections'][0]
        print(f"   Class: {det.get('class')}")
        print(f"   Confidence: {det.get('confidence'):.2%}")
        print(f"   BBox: {det.get('bbox')}")
    
    print("\n5. Full Response:")
    print(json.dumps(data, indent=2))
    
except Exception as e:
    print(f"❌ Detection test failed: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 80)
