# AI Traffic Management Component

## Overview
The AI Traffic Management tab displays a 4-camera grid (East, West, South, North) with real-time vehicle detection and adaptive traffic light control.

## Component Location
- **Main Component**: `src/components/AITrafficManagement.tsx`
- **Parent Component**: `src/components/CameraDetail.tsx`
- **Camera Stream**: Uses `DynamicCameraStream` from `CameraDetail.tsx`

## How to Add Images for Each Lane

### Option 1: Replace with Static Images (Quick Test)

To replace the camera streams with static images for testing:

1. **Add your images** to `public/images/lanes/`:
   ```
   public/images/lanes/east.jpg
   public/images/lanes/west.jpg
   public/images/lanes/south.jpg
   public/images/lanes/north.jpg
   ```

2. **Edit `AITrafficManagement.tsx`** - Replace the `DynamicCameraStream` component with an `img` tag:

   ```tsx
   {/* East Camera - BEFORE */}
   {cameras[0] && (
     <DynamicCameraStream 
       camera={cameras[0]}
       enableDetection={detectionEnabled && aiServerHealthy === true}
       onDetection={(result) => onDirectionDetection('east', result)}
     />
   )}

   {/* East Camera - AFTER */}
   <Box
     component="img"
     src="/images/lanes/east.jpg"
     alt="East Lane"
     sx={{
       width: '100%',
       height: '100%',
       objectFit: 'cover'
     }}
   />
   ```

3. **Repeat for West, South, and North** cameras (lines 156, 206, 256).

### Option 2: Use Actual Camera Feeds

The component already uses `DynamicCameraStream` which accesses your USB cameras. To use different cameras for each direction:

1. **Update camera mapping** in `CameraDetail.tsx` - modify `getIntersectionData()`:
   ```tsx
   cameras: [
     { id: 1, name: 'East Camera', ... },
     { id: 2, name: 'West Camera', ... },
     { id: 3, name: 'South Camera', ... },
     { id: 4, name: 'North Camera', ... }
   ]
   ```

2. **Update `AITrafficManagement.tsx`** to use correct camera indices:
   ```tsx
   {/* East - use camera 0 */}
   {cameras[0] && <DynamicCameraStream camera={cameras[0]} ... />}
   
   {/* West - use camera 1 */}
   {cameras[1] && <DynamicCameraStream camera={cameras[1]} ... />}
   
   {/* South - use camera 2 */}
   {cameras[2] && <DynamicCameraStream camera={cameras[2]} ... />}
   
   {/* North - use camera 3 */}
   {cameras[3] && <DynamicCameraStream camera={cameras[3]} ... />}
   ```

### Option 3: Upload Images via Props (Recommended for Easy Customization)

1. **Add image URLs to the component props**:

   Edit `AITrafficManagement.tsx` interface:
   ```tsx
   interface AITrafficManagementProps {
     // ... existing props
     laneImages?: {
       east?: string;
       west?: string;
       south?: string;
       north?: string;
     };
   }
   ```

2. **Use conditional rendering**:
   ```tsx
   {/* East Camera */}
   {laneImages?.east ? (
     <Box
       component="img"
       src={laneImages.east}
       alt="East Lane"
       sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
     />
   ) : cameras[0] && (
     <DynamicCameraStream camera={cameras[0]} ... />
   )}
   ```

3. **Pass images from parent**:
   ```tsx
   <AITrafficManagement
     laneImages={{
       east: '/images/lanes/east.jpg',
       west: '/images/lanes/west.jpg',
       south: '/images/lanes/south.jpg',
       north: '/images/lanes/north.jpg'
     }}
     // ... other props
   />
   ```

## Component Structure

```
AITrafficManagement.tsx
├── Left Side (flex: 1)
│   ├── Top Row (flex: 1)
│   │   ├── East Camera (Paper)
│   │   │   ├── Label (absolute, top-left)
│   │   │   ├── Vehicle Count Badge (absolute, top-right)
│   │   │   └── DynamicCameraStream
│   │   └── West Camera (Paper)
│   │       └── [same structure]
│   └── Bottom Row (flex: 1)
│       ├── South Camera (Paper)
│       └── North Camera (Paper)
└── Right Side (width: 350px)
    ├── Header (Adaptive AI Control)
    ├── Traffic Light Signals (scrollable)
    │   └── [4 direction cards sorted by priority]
    └── Algorithm Info
```

## Customizing the Layout

### Change Camera Grid Layout
In `AITrafficManagement.tsx`, modify the grid structure (currently 2x2):

```tsx
{/* Change to 1x4 (horizontal) */}
<Box sx={{ flex: 1, display: 'flex', flexDirection: 'row', gap: 2 }}>
  {/* All 4 cameras in a row */}
</Box>

{/* Change to 4x1 (vertical) */}
<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
  {/* All 4 cameras stacked */}
</Box>
```

### Change Right Panel Width
Adjust the width of the adaptive control panel:

```tsx
{/* Default: 350px */}
<Box sx={{ width: 350, ... }}>

{/* Wider: 450px */}
<Box sx={{ width: 450, ... }}>
```

### Adjust Camera Labels
Modify the label position and style:

```tsx
<Box
  sx={{
    position: 'absolute',
    top: 10,      // Distance from top
    left: 10,     // Distance from left
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#fff',
    px: 2,        // Horizontal padding
    py: 0.5,      // Vertical padding
    borderRadius: 1,
    zIndex: 10,
    fontWeight: 600
  }}
>
  East
</Box>
```

## Tips for Adding Lane Images

1. **Image Size**: Use consistent dimensions (e.g., 1920x1080 or 1280x720) for all lane images
2. **Aspect Ratio**: The container uses `flex: 1`, so images will scale proportionally
3. **Object Fit**: Set to `'cover'` to fill the container, or `'contain'` to fit within
4. **Image Format**: JPG for photos, PNG for transparency needs
5. **Optimization**: Compress images to reduce load time (use tools like TinyPNG)

## File Locations

- Component: `src/components/AITrafficManagement.tsx`
- Parent: `src/components/CameraDetail.tsx`
- Types: Both files define their own types, but share `DetectionResponse` from `aiService.ts`
- Static Images: `public/images/lanes/` (recommended location)

## Testing the Component

1. Navigate to any intersection detail page
2. Click the "🤖 AI Traffic Management" tab
3. Toggle AI detection on/off to see vehicle counting
4. Watch the right panel update priorities and green times based on vehicle counts

## Next Steps

To fully integrate with real lane images:

1. Place your 4 lane images in `public/images/lanes/`
2. Choose one of the 3 options above
3. Update the component code accordingly
4. Test in the browser
5. Adjust styling as needed (border, spacing, labels)
