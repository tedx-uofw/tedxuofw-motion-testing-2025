import json
import cv2
import numpy as np

# Load the saved circle diameter data from JSON
circle_diameters_path = "data/circle_diameters.json"
with open(circle_diameters_path, "r") as f:
    circle_diameters_data = json.load(f)

# Function to smooth the circle diameters across frames
def smooth_diameter_data(diameter_arrays, window_size=3):
    """
    Applies temporal smoothing to circle diameter data.
    Args:
        diameter_arrays (list): List of 2D arrays representing circle diameters for each frame.
        window_size (int): Number of frames to include in the smoothing window (must be odd).
    Returns:
        list: Smoothed diameter data.
    """
    if window_size % 2 == 0:
        raise ValueError("Window size must be odd.")

    num_frames = len(diameter_arrays)
    half_window = window_size // 2
    smoothed_data = []

    for frame_idx in range(num_frames):
        # Collect frames in the sliding window
        start_idx = max(0, frame_idx - half_window)
        end_idx = min(num_frames, frame_idx + half_window + 1)
        window = diameter_arrays[start_idx:end_idx]
        
        # Compute the average across the window
        smoothed_frame = np.mean(window, axis=0)
        smoothed_data.append(smoothed_frame.tolist())

    return smoothed_data

# Smooth the data to reduce flickering
window_size = 5  # Adjust this for more or less smoothing
smoothed_diameters_data = smooth_diameter_data(circle_diameters_data, window_size=window_size)

# Function to recreate the video
def create_video_with_interpolation(diameter_arrays, grid_size=(55, 55), frame_size=(1920, 1920), output_path="output.mp4"):
    """
    Creates a video from circle diameter arrays loaded from JSON, with interpolated frames to double the framerate.
    Args:
        diameter_arrays (list): List of 2D arrays containing circle diameters for each frame.
        grid_size (tuple): Dimensions of the grid (rows, cols).
        frame_size (tuple): Size of each frame (width, height) in pixels.
        output_path (str): Path to save the generated video.
    """
    rows, cols = grid_size
    frame_width, frame_height = frame_size
    cell_width = frame_width // cols
    cell_height = frame_height // rows

    # Define the codec and create VideoWriter
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    video_writer = cv2.VideoWriter(output_path, fourcc, 60.0, (frame_width, frame_height))  # Set framerate to 60

    num_frames = len(diameter_arrays)
    for frame_idx in range(num_frames - 1):
        # Original frame
        original_frame = diameter_arrays[frame_idx]
        next_frame = diameter_arrays[frame_idx + 1]

        # Create a black canvas for the original frame
        frame = np.zeros((frame_height, frame_width, 3), dtype=np.uint8)

        # Draw circles for each cell in the grid for the original frame
        for i in range(rows):
            for j in range(cols):
                diameter = original_frame[i][j]
                if diameter > 0:
                    center_x = j * cell_width + cell_width // 2
                    center_y = i * cell_height + cell_height // 2
                    radius = int(diameter / 2)
                    cv2.circle(frame, (center_x, center_y), radius, (88, 88, 88), -1)

        # Write the original frame to the video
        video_writer.write(frame)

        # Interpolated frame
        interpolated_frame = (np.array(original_frame) + np.array(next_frame)) / 2

        # Create a black canvas for the interpolated frame
        frame = np.zeros((frame_height, frame_width, 3), dtype=np.uint8)

        # Draw circles for each cell in the grid for the interpolated frame
        for i in range(rows):
            for j in range(cols):
                diameter = interpolated_frame[i][j]
                if diameter > 0:
                    center_x = j * cell_width + cell_width // 2
                    center_y = i * cell_height + cell_height // 2
                    radius = int(diameter / 2)
                    cv2.circle(frame, (center_x, center_y), radius, (88, 88, 88), -1)

        # Write the interpolated frame to the video
        video_writer.write(frame)

    # Write the last original frame
    frame = np.zeros((frame_height, frame_width, 3), dtype=np.uint8)
    for i in range(rows):
        for j in range(cols):
            diameter = diameter_arrays[-1][i][j]
            if diameter > 0:
                center_x = j * cell_width + cell_width // 2
                center_y = i * cell_height + cell_height // 2
                radius = int(diameter / 2)
                cv2.circle(frame, (center_x, center_y), radius, (88, 88, 88), -1)
    video_writer.write(frame)

    # Release the video writer
    video_writer.release()
    print(f"Video saved to {output_path}")

# Generate the video with interpolated frames
output_video_path = "data/interpolated_generated_video.mp4"
create_video_with_interpolation(smoothed_diameters_data, grid_size=(55, 55), frame_size=(1920, 1920), output_path=output_video_path)
