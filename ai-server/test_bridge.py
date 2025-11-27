import requests
from pathlib import Path
import json

print("=" * 80)
print("Testing Arduino Bridge Proxy")
print("=" * 80)

# Test through bridge (what frontend uses)
print("\n1. Testing detection through bridge (http://localhost:3001/api/detect)...")
image_path = Path('../public/images/east.jfif')

try:
    with open(image_path, 'rb') as f:
        files = {'image': ('east.jfif', f, 'image/jpeg')}
        response = requests.post('http://localhost:3001/api/detect', files=files, timeout=10)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Bridge proxy SUCCESS!")
        print(f"   Total vehicles: {data.get('total_vehicles')}")
        print(f"   Vehicle counts: {data.get('vehicle_counts')}")
        print(f"   Detections: {len(data.get('detections', []))}")
    else:
        print(f"❌ Bridge returned status {response.status_code}")
        print(f"   Response: {response.text[:200]}")
    
except Exception as e:
    print(f"❌ Bridge proxy FAILED: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 80)
