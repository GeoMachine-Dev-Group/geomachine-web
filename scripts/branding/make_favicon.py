from PIL import Image

# Load the cropped tesseract
img = Image.open('public/images/tesseract.png')

# The image is 596x558. Let's make it a square by pasting it into the center of a new transparent square image.
size = max(img.width, img.height)
square = Image.new('RGBA', (size, size), (0, 0, 0, 0))
offset = ((size - img.width) // 2, (size - img.height) // 2)
square.paste(img, offset)

# Resize to standard favicon sizes
favicon_32 = square.resize((32, 32), Image.Resampling.LANCZOS)
favicon_192 = square.resize((192, 192), Image.Resampling.LANCZOS)
favicon_512 = square.resize((512, 512), Image.Resampling.LANCZOS)

# Save them
favicon_32.save('public/favicon.png')
favicon_192.save('public/icon-192.png')
favicon_512.save('public/icon-512.png')
favicon_192.save('public/apple-touch-icon.png')

print("Favicons generated!")
