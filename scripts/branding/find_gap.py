from PIL import Image
import numpy as np

img = Image.open('public/images/logo_transparent.png')
arr = np.array(img)
alpha = arr[:,:,3]

mask = alpha > 50

# Profile the rows (sum of bright pixels per row)
row_sums = mask.sum(axis=1)

# Find the gap: a region of rows with 0 or very few bright pixels, between two large blocks of bright pixels.
# The tesseract is on top, text is below.
print("Row sums:", row_sums[150:450:10]) # print sample
