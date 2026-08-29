import re

with open('src/i18n/ui.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the new keys for each language
new_keys = {
    'es': """
    paymentTitle: 'Pago de Proyecto',
    paymentSubtitle: 'Abono de anticipo (50%) para inicio de desarrollo.',
    payTotalBudget: 'Presupuesto Total:',
    payAdvanceAmount: 'Adelanto a abonar ahora (50%):',
    payRemainingAmount: 'Restante (a la entrega):',
    payReference: 'Referencia / Concepto:',
    paySuccess: '¡Anticipo recibido con éxito! Empezamos a trabajar.',
    payError: 'Ocurrió un error con el pago. Contacta con nosotros.'""",
    'en': """
    paymentTitle: 'Project Payment',
    paymentSubtitle: 'Secure advance payment (50%) to start development.',
    payTotalBudget: 'Total Project Budget:',
    payAdvanceAmount: 'Advance to pay now (50%):',
    payRemainingAmount: 'Remaining (on delivery):',
    payReference: 'Reference / Concept:',
    paySuccess: 'Advance received successfully! We are starting work.',
    payError: 'An error occurred with the payment. Please contact us.'""",
    'ru': """
    paymentTitle: 'Оплата Проекта',
    paymentSubtitle: 'Безопасная предоплата (50%) для начала разработки.',
    payTotalBudget: 'Общий бюджет проекта:',
    payAdvanceAmount: 'Предоплата сейчас (50%):',
    payRemainingAmount: 'Остаток (при сдаче):',
    payReference: 'Справка / Концепция:',
    paySuccess: 'Предоплата успешно получена! Начинаем работу.',
    payError: 'Произошла ошибка при оплате. Пожалуйста, свяжитесь с нами.'""",
    'ka': """
    paymentTitle: 'პროექტის გადახდა',
    paymentSubtitle: 'უსაფრთხო წინასწარი გადახდა (50%) დეველოპმენტის დასაწყებად.',
    payTotalBudget: 'პროექტის საერთო ბიუჯეტი:',
    payAdvanceAmount: 'წინასწარ გადასახდელი (50%):',
    payRemainingAmount: 'დარჩენილი (ჩაბარებისას):',
    payReference: 'რეფერენსი / კონცეფცია:',
    paySuccess: 'წინასწარი გადახდა მიღებულია! ვიწყებთ მუშაობას.',
    payError: 'გადახდისას დაფიქსირდა შეცდომა. გთხოვთ დაგვიკავშირდეთ.'"""
}

for lang, keys in new_keys.items():
    lang_pattern = f"  {lang}: {{"
    if lang_pattern in content:
        start_idx = content.find(lang_pattern)
        end_idx = content.find("  },", start_idx) + 4
        block = content[start_idx:end_idx]
        
        new_block = re.sub(r"(footer: '.*?',)", r"\1\n" + keys + ",", block)
        content = content[:start_idx] + new_block + content[end_idx:]

with open('src/i18n/ui.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("ui.ts patched successfully.")
