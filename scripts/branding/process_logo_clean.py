from PIL import Image
import numpy as np

# Load original image
img = Image.open('public/images/logo.png').convert('RGB')
arr = np.array(img).astype(np.float32) / 255.0

# The background has some network lines which are probably dim blue/cyan.
# The tesseract is much brighter.
# Let's compute a lightness
lightness = np.max(arr, axis=2)

# If lightness is below a threshold, set to 0 (drop the faint background)
threshold = 0.20 # 20% brightness
alpha = np.where(lightness < threshold, 0, lightness)

# Now, smooth out the alpha slightly or just keep it
alpha_safe = np.where(alpha == 0, 1.0, alpha)
RGB = arr / alpha_safe[:, :, None]
RGB = np.clip(RGB * 255, 0, 255).astype(np.uint8)

A = np.clip(alpha * 255, 0, 255).astype(np.uint8)

# Now let's crop to just the tesseract (we know it's roughly above y=320)
# But let's find the bounding box dynamically based on the new clean alpha
mask = A > 0
row_sums = mask.sum(axis=1)

in_top_shape = False
tesseract_y_end = 320 # Fallback
for y, s in enumerate(row_sums):
    if s > 10:
        in_top_shape = True
    elif in_top_shape and s == 0:
        # look ahead to confirm it's a real gap
        if sum(row_sums[y:y+15]) == 0:
            tesseract_y_end = y
            break

tesseract_mask = mask[:tesseract_y_end, :]
y_indices, x_indices = np.where(tesseract_mask)

if len(y_indices) > 0 and len(x_indices) > 0:
    y_min, y_max = y_indices.min(), y_indices.max()
    x_min, x_max = x_indices.min(), x_indices.max()
    
    pad = 5
    y_min = max(0, y_min - pad)
    x_min = max(0, x_min - pad)
    y_max = min(img.height, y_max + pad)
    x_max = min(img.width, x_max + pad)
    
    out_arr = np.dstack((RGB, A))
    full_img = Image.fromarray(out_arr, 'RGBA')
    tesseract_img = full_img.crop((x_min, y_min, x_max, y_max))
    tesseract_img.save('public/images/tesseract_clean.png')
    print(f"Cleaned and cropped tesseract! bbox: {x_min},{y_min} to {x_max},{y_max}")
else:
    print("Failed to find tesseract.")
