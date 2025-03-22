import cv2
import numpy as np

# Load the image with unchanged flag to preserve transparency
image_path = "logo.png"
image = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)

# Ensure image is loaded correctly
if image is None:
    raise FileNotFoundError(f"Image at {image_path} not found")

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
output_path = "clipped.png"
cv2.imwrite(output_path, output_image)

print(f"Processed image saved as {output_path}")
