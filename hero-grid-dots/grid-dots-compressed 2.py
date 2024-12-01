import cv2
import numpy as np
import json
import zlib
import base64
import bz2
import struct

def extract_circle_diameters(video_path, grid_size=(55, 55)):
    cap = cv2.VideoCapture(video_path)
    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    original_fps = cap.get(cv2.CAP_PROP_FPS)
    rows, cols = grid_size
    cell_width = frame_width // cols
    cell_height = frame_height // rows

    diameters_frames = []
    frame_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        blurred_frame = cv2.GaussianBlur(gray_frame, (5, 5), 0)
        _, binary_mask = cv2.threshold(blurred_frame, 50, 220, cv2.THRESH_BINARY)

        diameter_grid = np.zeros((rows, cols))

        for i in range(rows):
            for j in range(cols):
                cell = binary_mask[i * cell_height:(i + 1) * cell_height, j * cell_width:(j + 1) * cell_width]
                contours, _ = cv2.findContours(cell, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                if contours:
                    largest_contour = max(contours, key=cv2.contourArea)
                    (x, y), radius = cv2.minEnclosingCircle(largest_contour)
                    diameter = 2 * radius
                    diameter_grid[i, j] = diameter

        diameters_frames.append(diameter_grid)
        frame_count += 1

    cap.release()

    # Interpolate frames to achieve 60 fps
    target_fps = 60
    interpolation_factor = int(target_fps // original_fps)
    interpolated_diameters_frames = []

    for i in range(len(diameters_frames) - 1):
        current_frame = diameters_frames[i]
        next_frame = diameters_frames[i + 1]

        # Append the current frame
        interpolated_diameters_frames.append(current_frame.tolist())

        # Generate intermediate frames using linear interpolation
        for j in range(1, interpolation_factor):
            alpha = j / interpolation_factor
            interpolated_frame = (1 - alpha) * current_frame + alpha * next_frame
            interpolated_diameters_frames.append(interpolated_frame.tolist())

    # Append the last frame
    interpolated_diameters_frames.append(diameters_frames[-1].tolist())

    # Compress JSON data
    compressed_data = compress_data(interpolated_diameters_frames)

    return compressed_data

def compress_data(data):
    # Convert float values to a more compact representation (e.g., half precision)
    flattened_data = []
    for frame in data:
        for row in frame:
            for value in row:
                # Convert float to half-precision (16-bit) binary representation
                packed_value = struct.pack('e', value)
                flattened_data.append(packed_value)

    # Join the binary data and compress it using zlib followed by bz2 for better compression
    binary_data = b"".join(flattened_data)
    compressed_zlib = zlib.compress(binary_data)
    compressed_bz2 = bz2.compress(compressed_zlib)
    compressed_base64 = base64.b64encode(compressed_bz2).decode('utf-8')
    return compressed_base64

def decompress_data(compressed_base64):
    # Decompress the data in reverse order
    compressed_bz2 = base64.b64decode(compressed_base64)
    compressed_zlib = bz2.decompress(compressed_bz2)
    binary_data = zlib.decompress(compressed_zlib)

    # Convert binary data back to float values
    data = []
    index = 0
    frame_size = 55 * 55  # Assuming grid_size of (55, 55)
    while index < len(binary_data):
        frame = []
        for _ in range(55):
            row = []
            for _ in range(55):
                # Unpack half-precision float (16-bit) from binary data
                value = struct.unpack('e', binary_data[index:index+2])[0]
                row.append(value)
                index += 2
            frame.append(row)
        data.append(frame)

    return data

# Path to the video file
video_path = "data/hero-animation-gradient-dots.mp4"

# Extract circle diameters and interpolate frames
compressed_diameters_data = extract_circle_diameters(video_path, grid_size=(55, 55))

# Save the compressed data as a JSON file
output_file = "data/circle_diameters_compressed.json"
with open(output_file, "w") as f:
    f.write(compressed_diameters_data)

print(f"Compressed circle diameters data saved to {output_file}")
