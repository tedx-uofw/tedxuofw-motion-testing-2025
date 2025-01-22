# TEDxUofW Motion Testing 2025 - Web App

React web app for the TEDxUofW 2025 website's dot grid animations.

## ✨ Features

- Interactive dot grid animation
- Dynamic hero section
- Responsive design
- Route-based navigation
- Performance optimized
- Customizable themes

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- npm/yarn
- Animation data from hero-grid-dots

### Installation

1. Install dependencies:
```bash
cd tedx-testing
npm install
```

2. Start dev server:
```bash
npm start
```

Opens at `http://localhost:3000`

## 🎨 Components

### DotGrid
Grid animation component properties:
- `dotSize`: Base dot size (default: 10)
- `dotColor`: Dot color
- `maxDotSize`: Maximum dot size
- `distanceThreshold`: Interaction distance
- `dotSpacing`: Space between dots
- `gridRows/gridColumns`: Grid dimensions
- `smoothFactor`: Animation smoothness
- `shape`: Dot shape ("circle" default)
- `enableLookAt`: Look-at behavior

### HeroAnimation
Main hero section with dot grid animation.

## ⚙️ Configuration

### Environment Variables
In `.env`:
```
REACT_APP_ANIMATION_SPEED=1
REACT_APP_DEFAULT_THEME=dark
```

### Performance Tips
- Keep grid below 60x60
- `smoothFactor`: 0.3-0.7
- Adjust `distanceThreshold` to screen

## 🐛 Common Issues

1. **Slow Animation**
   - Reduce grid density
   - Lower `maxDotSize`
   - Disable `enableLookAt`

2. **Build Errors**
   - Clear cache: `npm cache clean --force`
   - Reinstall node_modules
   - Check Node.js version
