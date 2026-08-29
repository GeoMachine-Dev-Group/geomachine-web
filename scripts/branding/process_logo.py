from PIL import Image
import numpy as np

# Load image
img = Image.open('public/images/logo.png').convert('RGB')
arr = np.array(img).astype(np.float32) / 255.0

# Extract the tesseract (crop roughly). 
# Size is 1024x558. Let's crop x from 300 to 724, y from 100 to 400? Let's check aspect ratio.
# We'll first do the transparency math on the whole image, save it, and we can crop.
alpha = np.max(arr, axis=2) # Max channel as alpha

# To avoid divide by zero:
alpha_safe = np.where(alpha == 0, 1.0, alpha)

# Reconstruct color
RGB = arr / alpha_safe[:, :, None]
RGB = np.clip(RGB * 255, 0, 255).astype(np.uint8)

# Output alpha
A = np.clip(alpha * 255, 0, 255).astype(np.uint8)

# Combine
out_arr = np.dstack((RGB, A))
out_img = Image.fromarray(out_arr, 'RGBA')
out_img.save('public/images/logo_transparent.png')
print("Processed full image to logo_transparent.png")
