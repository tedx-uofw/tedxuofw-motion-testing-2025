from moviepy.editor import VideoFileClip
from PIL import Image, ImageDraw
import numpy as np

# Load the video and extract a frame
video_path = "data/hero-animation-gradient-dots.mp4"
output_image_path = "output_grid_dots.png"

# Extract the first frame of the video
clip = VideoFileClip(video_path)
frame = clip.get_frame(0)  # Extract the first frame as a numpy array
clip.close()

# Convert the frame to grayscale and resize it for a grid
frame_image = Image.fromarray(frame)
frame_image = frame_image.convert("L")  # Convert to grayscale
grid_width, grid_height = 100, 100  # Size of the grid
frame_image = frame_image.resize((grid_width, grid_height))

# Create the dot grid representation
dot_image = Image.new("RGB", (grid_width * 10, grid_height * 10), "white")
draw = ImageDraw.Draw(dot_image)

# Draw dots on the grid based on intensity
for y in range(grid_height):
    for x in range(grid_width):
        intensity = frame_image.getpixel((x, y))
        radius = int((255 - intensity) / 255 * 5)  # Scale dot size with intensity
        center = (x * 10 + 5, y * 10 + 5)  # Center of the dot
        if radius > 0:
            draw.ellipse(
                (center[0] - radius, center[1] - radius, center[0] + radius, center[1] + radius),
                fill="black",
            )

# Save the dot grid image
dot_image.save(output_image_path)
print(f"Dot grid image saved to {output_image_path}")
