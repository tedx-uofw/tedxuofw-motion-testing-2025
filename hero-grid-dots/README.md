# Hero Grid Dots Video Processor

A Python-based tool for extracting dot size information from video frames, designed specifically for the TEDxUofW 2025 website's hero animation.

## 🎯 Purpose

This tool processes a video file to extract the size of dots in a grid pattern, down to subpixel precision. The extracted data is used to create smooth, dynamic dot animations in the TEDxUofW website's hero section.

## 🔧 Features

- **Video Frame Processing**: Extracts dot sizes from each frame of a video
- **Grid-based Analysis**: Processes video into a configurable grid (default 55x55)
- **Subpixel Precision**: Measures dot diameters with decimal point precision
- **FPS Interpolation**: Automatically interpolates frames to achieve 60 FPS
- **Optimized Output**: Generates compressed JSON data for web consumption

## 📋 Prerequisites

- Python 3.7+
- OpenCV (`cv2`)
- NumPy
- Required video file in `data/` directory

## 🚀 Usage

1. Place your source video in the `data/` directory
2. Run the processing script:
```bash
python grid-dots-new.py
```

The script will generate a `circle_diameters.json` file in the `data/` directory.

## ⚙️ Configuration

Key parameters in `grid-dots-new.py`:
- `grid_size`: Tuple defining the grid dimensions (default: 55x55)
- `decimal_places`: Precision of diameter measurements (default: 2)
- `target_fps`: Target frame rate for interpolation (default: 60)

## 📤 Output Format

The generated JSON file contains an array of frames, where each frame is a 2D array of dot diameters:
```json
[
    [
        [diameter1, diameter2, ...],
        [diameter1, diameter2, ...],
        ...
    ],
    // Additional frames...
]
```

## 🔍 How It Works

1. **Frame Extraction**: Reads each frame from the source video
2. **Image Processing**:
   - Converts frames to grayscale
   - Applies Gaussian blur for noise reduction
   - Creates binary mask for dot detection
3. **Dot Analysis**:
   - Divides each frame into grid cells
   - Detects circles using contour analysis
   - Measures dot diameters in each cell
4. **Frame Interpolation**:
   - Interpolates between frames to achieve 60 FPS
   - Smooths transitions between keyframes
5. **Data Export**:
   - Rounds values to specified precision
   - Exports data as compressed JSON

## 🔗 Integration

The output JSON file is designed to be used with the React-based animation system in the `tedx-testing` folder. The data drives the dynamic dot animations in the website's hero section.

## 📝 Notes

- Ensure video resolution is sufficient for accurate dot detection
- Higher grid densities will increase processing time
- Consider storage requirements when adjusting precision settings 