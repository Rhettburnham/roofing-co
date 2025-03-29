import cv2
import numpy as np
import os

# Set up paths
script_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.dirname(script_dir)
input_path = os.path.join(data_dir, "raw_data", "step_1", "logo.png")
output_dir = os.path.join(data_dir, "raw_data", "step_3")
output_path = os.path.join(output_dir, "clipped.png")

# Create output directory if it doesn't exist
os.makedirs(output_dir, exist_ok=True)

# Load the image with unchanged flag to preserve transparency
image = cv2.imread(input_path, cv2.IMREAD_UNCHANGED)

# Ensure image is loaded correctly
if image is None:
    raise FileNotFoundError(f"Image at {input_path} not found")

# Convert to grayscale to remove saturation (desaturate the image)
gray = cv2.cvtColor(image[:, :, :3], cv2.COLOR_BGR2GRAY)

# Apply thresholding to create a mask to remove the background
_, binary_mask = cv2.threshold(gray, 50, 255, cv2.THRESH_BINARY_INV)

# Create an alpha channel based on the binary mask
alpha_channel = np.where(binary_mask == 255, 255, 0).astype(np.uint8)

# Convert grayscale to a 3-channel image
gray_3channel = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)

# Merge grayscale image with new alpha channel
output_image = cv2.merge((gray_3channel, alpha_channel))

# Save the processed image with transparency
cv2.imwrite(output_path, output_image)

# Also copy to the root raw_data directory for other scripts to use
root_output = os.path.join(data_dir, "raw_data", "clipped.png")
cv2.imwrite(root_output, output_image)

print(f"Processed image saved as {output_path}")
print(f"Also copied to {root_output} for other scripts to use")
