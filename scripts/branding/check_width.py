import numpy as np
from PIL import Image

img = Image.open('public/images/tesseract_clean.png')
arr = np.array(img)[:, :, 3]

# Sum columns
col_sums = arr.sum(axis=0)
for i in range(0, len(col_sums), 20):
    print(f"Col {i}: {col_sums[i]}")

