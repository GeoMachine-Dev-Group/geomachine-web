from PIL import Image
import numpy as np

img = Image.open('public/images/logo_transparent.png')

# The center of the image is at x=512.
# The tesseract is in the upper half.
# Let's crop x from 512-150 to 512+150 (300 wide)
# y from 110 to 410 (300 high, or maybe 50 to 350)
# Let's use the alpha channel to find the exact vertical position of the object in the middle columns.
arr = np.array(img)[:, :, 3]
mid_cols = arr[:, 462:562]
row_sums = mid_cols.sum(axis=1)

y_indices = np.where(row_sums > 1000)[0]
y_min = y_indices[0]
y_max = y_indices[-1]
y_center = (y_min + y_max) // 2

# Assume it's roughly square
size = max(y_max - y_min, 200) + 40
half_size = size // 2

x_center = 512
x_min = max(0, x_center - half_size)
x_max = min(img.width, x_center + half_size)
y_min = max(0, y_center - half_size)
y_max = min(img.height, y_center + half_size)

cropped = img.crop((x_min, y_min, x_max, y_max))

# Drop faint background lines
arr_c = np.array(cropped)
alpha = arr_c[:, :, 3]
arr_c[:, :, 3] = np.where(alpha < 50, 0, alpha)

final = Image.fromarray(arr_c)
final.save('public/images/tesseract.png')
print(f"Saved tesseract.png. Size: {final.width}x{final.height}")

