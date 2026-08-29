import re

with open('src/layouts/Base.astro', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update imports
if "paymentPath" not in content:
    content = content.replace("blogPath, languages", "blogPath, paymentPath, languages")

# 2. Add nav link
nav_link = """
          <a href={paymentPath[lang]} class="plate__blog-link" style="color: var(--accent); font-weight: 600;">
            {t.paymentTitle}
          </a>
"""

if "paymentPath[lang]" not in content:
    # Insert before blog link
    pattern = r"(<nav class=\"plate__links\">\s*\{)"
    content = re.sub(pattern, r'<nav class="plate__links">' + nav_link + r'\n          {', content)

with open('src/layouts/Base.astro', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched Base.astro")
