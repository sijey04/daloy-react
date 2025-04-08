# Demand-Driven Traffic Light Optimization System

An AI-powered solution designed to revolutionize urban traffic management by replacing costly proprietary systems like SCATS.

## Overview

This system leverages computer vision and machine learning to analyze traffic patterns in real-time and optimize traffic signal timings accordingly. By using affordable, open-source technologies, we provide an accessible alternative to expensive proprietary traffic management systems while delivering superior performance.

## Key Features

- **Real-time Vehicle Detection**: Uses OpenCV and YOLO (You Only Look Once) for accurate, low-latency vehicle detection
- **Dynamic Intersection Monitoring**: Employs two 360-degree rotating cameras to provide comprehensive coverage of intersections
- **Adaptive Signal Control**: Automatically adjusts traffic light timings based on current traffic volume and patterns
- **Cost-Effective Hardware**: Minimizes infrastructure costs while maximizing efficacy
- **User-Friendly Dashboard**: Modern React-based interface for traffic monitoring and system management

## Technical Architecture

- **Frontend**: React + TypeScript + Vite for a responsive, high-performance user interface
- **Computer Vision**: OpenCV and YOLO for vehicle detection and classification
- **Analytics**: Real-time and historical traffic pattern analysis
- **Hardware**: Optimized for standard cameras and computing hardware

## Benefits

- **Reduced Congestion**: Intelligent signal timing reduces vehicle wait times
- **Lower Emissions**: Less idling time means reduced vehicle emissions
- **Improved Urban Mobility**: More efficient traffic flow for all road users
- **Cost Savings**: Significant reduction in implementation costs compared to proprietary systems
- **Scalability**: Easily deployable across multiple intersections

## Development

This project uses React with TypeScript and Vite. Below are instructions for developers working on the system.

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

### Available Scripts

- `npm run dev` - Starts the development server
- `npm run build` - Builds the app for production
- `npm run lint` - Runs the linter
- `npm run preview` - Previews the built app locally

## License

[MIT License](LICENSE)

---

## For Developers

### Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```
```