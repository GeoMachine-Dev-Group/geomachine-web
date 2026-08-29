from PIL import Image
import numpy as np

img = Image.open('public/images/tesseract_clean.png')
arr = np.array(img)
alpha = arr[:, :, 3]

# Row and Col sums
row_sums = alpha.sum(axis=1)
col_sums = alpha.sum(axis=0)

y_indices = np.where(row_sums > 5000)[0]
x_indices = np.where(col_sums > 5000)[0]

y_min, y_max = y_indices[0], y_indices[-1]
x_min, x_max = x_indices[0], x_indices[-1]

pad = 10
y_min = max(0, y_min - pad)
x_min = max(0, x_min - pad)
y_max = min(img.height, y_max + pad)
x_max = min(img.width, x_max + pad)

final = img.crop((x_min, y_min, x_max, y_max))
final.save('public/images/tesseract_final.png')
print(f"Final bbox: {x_min},{y_min} to {x_max},{y_max}. Size: {final.width}x{final.height}")
