import cv2
import numpy as np
import json

def extract_circle_diameters(video_path, grid_size=(55, 55)):
    cap = cv2.VideoCapture(video_path)
    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
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

        diameters_frames.append(diameter_grid.tolist())
        frame_count += 1

    cap.release()
    return diameters_frames

# Path to the video file
video_path = "data/hero-animation-gradient-dots.mp4"

# Extract circle diameters
diameters_data = extract_circle_diameters(video_path, grid_size=(55, 55))

# Save the data as a JSON file
output_file = "data/circle_diameters.json"
with open(output_file, "w") as f:
    json.dump(diameters_data, f)

print(f"Circle diameters data saved to {output_file}")
