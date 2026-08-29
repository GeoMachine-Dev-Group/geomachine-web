from PIL import Image
import numpy as np

img = Image.open('public/images/logo_transparent.png')
arr = np.array(img)
alpha = arr[:,:,3]

# The tesseract is bright. The background network lines are dim.
# Threshold alpha to ignore dim background lines (e.g. alpha < 50)
mask = alpha > 50

# Find rows and cols where mask is true
y_indices, x_indices = np.where(mask)

if len(y_indices) > 0 and len(x_indices) > 0:
    y_min, y_max = y_indices.min(), y_indices.max()
    x_min, x_max = x_indices.min(), x_indices.max()
    print(f"Bounding box for bright objects: x=({x_min}, {x_max}), y=({y_min}, {y_max})")
    
    # Let's crop it with some padding
    pad = 20
    x_min = max(0, x_min - pad)
    y_min = max(0, y_min - pad)
    x_max = min(img.width, x_max + pad)
    y_max = min(img.height, y_max + pad)
    
    cropped = img.crop((x_min, y_min, x_max, y_max))
    cropped.save('public/images/tesseract_only.png')
    print("Saved tesseract_only.png")
else:
    print("Nothing found.")
