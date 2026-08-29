import re

with open('src/i18n/ui.ts', 'r', encoding='utf-8') as f:
    content = f.read()

payment_paths = """
export const paymentPath: Record<Lang, string> = {
  es: '/es/pago/',
  en: '/en/payment/',
  ru: '/ru/oplata/',
  ka: '/ka/gadakhda/',
};
"""

if "paymentPath:" not in content:
    content = content.replace("export const blogPath:", payment_paths + "\nexport const blogPath:")
    with open('src/i18n/ui.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added paymentPath to ui.ts")
else:
    print("paymentPath already exists.")
