from PIL import Image
import numpy as np

img = Image.open('public/images/logo_transparent.png')
arr = np.array(img)
alpha = arr[:,:,3]
mask = alpha > 50
row_sums = mask.sum(axis=1)

# Find where the tesseract ends.
# We expect a chunk of positive values, then some zeros, then the text.
in_top_shape = False
tesseract_y_end = 0

for y, s in enumerate(row_sums):
    if s > 10:
        in_top_shape = True
    elif in_top_shape and s <= 2: # small gap
        # look ahead to confirm it's a real gap
        if sum(row_sums[y:y+10]) <= 10:
            tesseract_y_end = y
            break

print("Tesseract ends at y =", tesseract_y_end)

# Let's also find the x bounding box for JUST the tesseract part
tesseract_mask = mask[:tesseract_y_end, :]
y_indices, x_indices = np.where(tesseract_mask)
if len(y_indices) > 0 and len(x_indices) > 0:
    y_min, y_max = y_indices.min(), y_indices.max()
    x_min, x_max = x_indices.min(), x_indices.max()
    print(f"Tesseract BBox: x=({x_min}, {x_max}), y=({y_min}, {y_max})")
    
    pad = 10
    x_min = max(0, x_min - pad)
    y_min = max(0, y_min - pad)
    x_max = min(img.width, x_max + pad)
    y_max = min(img.height, y_max + pad)
    
    cropped = img.crop((x_min, y_min, x_max, y_max))
    cropped.save('public/images/tesseract_only.png')
    print("Cropped successfully!")
