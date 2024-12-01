import json
import cv2
import numpy as np
import zlib
import base64
import struct
import bz2

def decompress_data(compressed_base64):
    compressed_bz2 = base64.b64decode(compressed_base64)
    compressed_zlib = bz2.decompress(compressed_bz2)
    binary_data = zlib.decompress(compressed_zlib)

    data = []
    index = 0
    frame_size = 55 * 55  # Dot grid_size of (55, 55)
    while index < len(binary_data):
        frame = []
        for _ in range(55):
            row = []
            for _ in range(55):
                value = struct.unpack('e', binary_data[index:index+2])[0]
                row.append(value)
                index += 2
            frame.append(row)
        data.append(frame)

    return data

circle_diameters_path = "data/circle_diameters_compressed.json"
with open(circle_diameters_path, "r") as f:
    compressed_data = f.read()
    
circle_diameters_data = decompress_data(compressed_data)

# Function to recreate the video
def create_video_from_json(diameter_arrays, grid_size=(55, 55), frame_size=(1920, 1920), output_path="output.mp4"):
    """
    Creates a video from circle diameter arrays loaded from JSON, using a fixed frame rate of 60 FPS.
    Args:
        diameter_arrays (list): List of 2D arrays containing circle diameters for each frame.
        grid_size (tuple): Dimensions of the grid (rows, cols).
        frame_size (tuple): Size of each frame (width, height) in pixels.
        output_path (str): Path to save the generated video.
    """
    frame_rate = 60

    rows, cols = grid_size
    frame_width, frame_height = frame_size
    cell_width = frame_width // cols
    cell_height = frame_height // rows

    # Define the codec and create VideoWriter
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    video_writer = cv2.VideoWriter(output_path, fourcc, frame_rate, (frame_width, frame_height))

    for frame_idx, diameter_grid in enumerate(diameter_arrays):
        # Create a black canvas for the frame
        frame = np.zeros((frame_height, frame_width, 3), dtype=np.uint8)

        # Draw circles for each cell in the grid
        for i in range(rows):
            for j in range(cols):
                diameter = diameter_grid[i][j]
                if diameter > 0:
                    # Calculate the center and radius
                    center_x = j * cell_width + cell_width // 2
                    center_y = i * cell_height + cell_height // 2
                    radius = int(diameter / 2)

                    # Draw the circle
                    cv2.circle(frame, (center_x, center_y), radius, (88, 88, 88), -1)

        # Write the frame to the video
        video_writer.write(frame)

    # Release the video writer
    video_writer.release()
    print(f"Video saved to {output_path}")

# Generate the video from the JSON data
output_video_path = "data/generated_video_no_smooth.mp4"
create_video_from_json(circle_diameters_data, grid_size=(55, 55), frame_size=(1920, 1920), output_path=output_video_path)

