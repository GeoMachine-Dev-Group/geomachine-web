/**
 * Textos de interfaz — 4 idiomas (ES/RU/EN/KA).
 *
 * ⚠️ Igual que en catalog-i18n.ts: el georgiano (ka) conviene que lo repase
 * un hablante nativo antes de publicar. El inglés y el ruso tienen menos
 * riesgo pero también merecen una relectura.
 *
 * Textos actualizados respecto al ui.ts original: nuevo eslogan del hero
 * ("De la idea a producción, sin rodeos"), nueva sección "En desarrollo /
 * Entregado" con gagraservis.ru, y el contador de plazas de lanzamiento.
 */

export const languages = { es: 'Español', ru: 'Русский', en: 'English', ka: 'ქართული' } as const;
export type Lang = keyof typeof languages;

/** Ruta de /servicios en cada idioma. */
export const servicesPath: Record<Lang, string> = {
  es: '/es/servicios/',
  ru: '/ru/uslugi/',
  en: '/en/services/',
  ka: '/ka/momsakhurebebi/',
};

export const ui = {
  es: {
    htmlLang: 'es',
    metaTitle: 'Catálogo de servicios — GeoMachine Developer Group',
    metaDescription:
      'Webs, aplicaciones, inteligencia artificial, mantenimiento y posicionamiento. Precios abiertos en euros, rublos y lari georgiano.',
    plate: 'Catálogo de servicios',
    rev: 'Rev. 2026.08',
    company: 'GeoMachine Developer Group',
    heroEyebrow: 'Desarrollo web, aplicaciones e inteligencia artificial',
    heroTitle: 'De la idea a producción, sin rodeos',
    heroBody:
      'Hablas conmigo desde el primer mensaje hasta la entrega — sin capas, sin comerciales, sin esperas. Precio cerrado en el momento, y lo tienes en días, no en meses.',
    heroPlain:
      'Consigues exactamente lo que tu negocio necesita — página, aplicación o automatización — con el precio cerrado desde el primer mensaje y la entrega funcionando, sin que tengas que entender nada de lo técnico.',
    tierLabel: 'Tarifa',
    tierLaunch: 'Lanzamiento',
    tierStandard: 'Estándar',
    currencyLabel: 'Moneda',
    stampLine1: 'Tarifa de lanzamiento',
    stampLine2: 'plazas ocupadas',
    launchNote:
      'La tarifa de lanzamiento se aplica a los primeros clientes, a cambio de poder publicar el resultado como caso de estudio. Después pasa a estándar.',
    standardNote: 'Tarifa estándar. Los clientes de mantenimiento conservan su precio de alta.',
    statusDelivered: 'Entregado',
    statusDev: 'Fase de Desarrollo',
    deliveredProjectDesc:
      'Sitio bilingüe de taxi, excursiones, hoteles y restaurantes en Gagra — entregado y en funcionamiento, con SEO técnico activo.',
    devProjectName: 'MVP Gestión de Transporte',
    devProjectDesc: 'Arquitectura backend escalable (Node.js, Redis, PostgreSQL) y aplicación móvil.',
    colService: 'Servicio',
    colTime: 'Entrega',
    colPrice: 'Precio',
    perMonth: '/mes',
    perHour: '/h',
    plus: 'más',
    thenMonthly: 'después',
    bundlesTitle: 'Paquetes',
    bundlesNote: 'Combinaciones cerradas, ya con descuento aplicado.',
    bundleIncludes: 'Incluye',
    ctaTitle: '¿Cuál de estos necesitas?',
    ctaBody:
      'Escríbeme qué quieres montar y te devuelvo un presupuesto cerrado con fecha de entrega. Sin llamada previa si no te apetece.',
    ctaButton: 'Pedir presupuesto',
    ctaSecondary: 'Escríbeme por Telegram',
    terms: 'Condiciones',
    termsList: [
      'Se factura el 50 % al empezar y el 50 % al entregar.',
      'Los precios no incluyen IVA, dominio ni licencias de terceros.',
      'El rango depende del alcance real; el presupuesto que firmas es cerrado.',
      'Los rublos y el lari no son una conversión del euro: son la tarifa de cada mercado.',
    ],
    showMore: "Ver más",
    showLess: "Ver menos",
    closeSteps: ["Envías tu idea","Recibes precio y fecha","Desarrollo y entrega"],
    footer: 'GeoMachine Developer Group',
  },
  ru: {
    htmlLang: 'ru',
    metaTitle: 'Каталог услуг — GeoMachine Developer Group',
    metaDescription:
      'Сайты, приложения, искусственный интеллект, обслуживание и продвижение. Открытые цены в евро, рублях и лари.',
    plate: 'Каталог услуг',
    rev: 'Ред. 2026.08',
    company: 'GeoMachine Developer Group',
    heroEyebrow: 'Веб-разработка, приложения и искусственный интеллект',
    heroTitle: 'От идеи до продакшена, без лишних кругов',
    heroBody:
      'Вы общаетесь со мной от первого сообщения до сдачи проекта — без посредников, без менеджеров по продажам, без ожидания. Цена фиксируется на месте, результат — за дни, а не за месяцы.',
    heroPlain:
      'Вы получаете именно то, что нужно вашему бизнесу — сайт, приложение или автоматизацию — с ценой, зафиксированной с первого сообщения, и рабочим результатом на выходе, без необходимости разбираться в технике.',
    tierLabel: 'Тариф',
    tierLaunch: 'Стартовый',
    tierStandard: 'Обычный',
    currencyLabel: 'Валюта',
    stampLine1: 'Стартовый тариф',
    stampLine2: 'мест занято',
    launchNote:
      'Стартовый тариф действует для первых клиентов — взамен я публикую результат как кейс. Дальше цена становится обычной.',
    standardNote: 'Обычный тариф. У клиентов на обслуживании цена подключения не меняется.',
    statusDelivered: 'Сдано',
    statusDev: 'В разработке',
    deliveredProjectDesc:
      'Двуязычный сайт такси, экскурсий, отелей и ресторанов в Гагре — сдан и работает, техническое SEO активно.',
    devProjectName: 'MVP приложения такси',
    devProjectDesc: 'Масштабируемая архитектура бэкенда (Node.js, Redis, PostgreSQL) и мобильное приложение.',
    colService: 'Услуга',
    colTime: 'Срок',
    colPrice: 'Цена',
    perMonth: '/мес',
    perHour: '/ч',
    plus: 'плюс',
    thenMonthly: 'далее',
    bundlesTitle: 'Пакеты',
    bundlesNote: 'Готовые связки, скидка уже внутри.',
    bundleIncludes: 'Входит',
    ctaTitle: 'Что из этого вам нужно?',
    ctaBody:
      'Напишите, что хотите построить, и я пришлю фиксированную смету со сроком. Созвон — только если сами захотите.',
    ctaButton: 'Запросить смету',
    ctaSecondary: 'Написать в Telegram',
    terms: 'Условия',
    termsList: [
      '50 % в начале работы, 50 % при сдаче.',
      'Цены без НДС, домена и лицензий третьих сторон.',
      'Разброс зависит от объёма; подписанная смета фиксированная.',
      'Рубли и лари — не пересчёт евро, а отдельный тариф для каждого рынка.',
    ],
    showMore: "Показать ещё",
    showLess: "Свернуть",
    closeSteps: ["Отправляете идею","Получаете цену и срок","Разработка и сдача"],
    footer: 'GeoMachine Developer Group',
  },
  en: {
    htmlLang: 'en',
    metaTitle: 'Service catalog — GeoMachine Developer Group',
    metaDescription:
      'Websites, applications, artificial intelligence, maintenance and search positioning. Open pricing in euros, rubles and Georgian lari.',
    plate: 'Service catalog',
    rev: 'Rev. 2026.08',
    company: 'GeoMachine Developer Group',
    heroEyebrow: 'Web development, applications and artificial intelligence',
    heroTitle: 'From idea to production, no detours',
    heroBody:
      'You talk to me from the first message to delivery — no layers, no salespeople, no waiting. Closed price on the spot, and you have it in days, not months.',
    heroPlain:
      'You get exactly what your business needs — a site, an app or an automation — with the price closed from the first message and delivered working, with no need to understand anything technical.',
    tierLabel: 'Tier',
    tierLaunch: 'Launch',
    tierStandard: 'Standard',
    currencyLabel: 'Currency',
    stampLine1: 'Launch pricing',
    stampLine2: 'slots taken',
    launchNote:
      'Launch pricing applies to the first clients, in exchange for being able to publish the result as a case study. It moves to standard pricing after that.',
    standardNote: 'Standard pricing. Maintenance clients keep the price they signed up at.',
    statusDelivered: 'Delivered',
    statusDev: 'In development',
    deliveredProjectDesc:
      'Bilingual taxi, excursions, hotels and restaurants site in Gagra — delivered and live, with active technical SEO.',
    devProjectName: 'Transport management MVP',
    devProjectDesc: 'Scalable backend architecture (Node.js, Redis, PostgreSQL) and a mobile app.',
    colService: 'Service',
    colTime: 'Delivery',
    colPrice: 'Price',
    perMonth: '/mo',
    perHour: '/h',
    plus: 'plus',
    thenMonthly: 'then',
    bundlesTitle: 'Packages',
    bundlesNote: 'Closed combinations, discount already applied.',
    bundleIncludes: 'Includes',
    ctaTitle: 'Which of these do you need?',
    ctaBody:
      "Tell me what you want to build and I'll send back a closed quote with a delivery date. No call needed unless you want one.",
    ctaButton: 'Request a quote',
    ctaSecondary: 'Message me on Telegram',
    terms: 'Terms',
    termsList: [
      "50% is billed at the start and 50% on delivery.",
      'Prices exclude VAT, domain and third-party licenses.',
      'The range depends on the actual scope; the quote you sign is fixed.',
      'Rubles and lari are not a euro conversion: each is priced for its own market.',
    ],
    showMore: "Show more",
    showLess: "Show less",
    closeSteps: ["You send your idea","You get price and date","Development and delivery"],
    footer: 'GeoMachine Developer Group',
  },
  ka: {
    htmlLang: 'ka',
    metaTitle: 'სერვისების კატალოგი — GeoMachine Developer Group',
    metaDescription:
      'ვებგვერდები, აპლიკაციები, ხელოვნური ინტელექტი, მოვლა და პოზიციონირება. ღია ფასები ევროში, რუბლში და ლარში.',
    plate: 'სერვისების კატალოგი',
    rev: 'რედ. 2026.08',
    company: 'GeoMachine Developer Group',
    heroEyebrow: 'ვებ დეველოპმენტი, აპლიკაციები და ხელოვნური ინტელექტი',
    heroTitle: 'იდეიდან პროდაქშენამდე, პირდაპირ',
    heroBody:
      'ჩემთან ურთიერთობთ პირველი შეტყობინებიდან მიწოდებამდე — შუალედური რგოლების, გამყიდველების და ლოდინის გარეშე. ფასი ფიქსირდება ადგილზევე და მზად არის დღეებში, არა თვეებში.',
    heroPlain:
      'იღებთ ზუსტად იმას, რაც თქვენს ბიზნესს სჭირდება — საიტს, აპლიკაციას ან ავტომატიზაციას — ფასი ფიქსირებულია პირველივე შეტყობინებიდან და მზად ვიღებთ სამუშაოდ, ტექნიკური ცოდნის გარეშეც.',
    tierLabel: 'ტარიფი',
    tierLaunch: 'გაშვების',
    tierStandard: 'სტანდარტული',
    currencyLabel: 'ვალუტა',
    stampLine1: 'გაშვების ტარიფი',
    stampLine2: 'დაკავებული ადგილი',
    launchNote:
      'გაშვების ტარიფი ვრცელდება პირველ კლიენტებზე, სანაცვლოდ ვაქვეყნებ შედეგს, როგორც კეისს. შემდეგ ფასი სტანდარტულზე გადადის.',
    standardNote: 'სტანდარტული ტარიფი. მოვლის კლიენტებს რჩებათ ის ფასი, რომლითაც დარეგისტრირდნენ.',
    statusDelivered: 'მიწოდებული',
    statusDev: 'დამუშავების ფაზაში',
    deliveredProjectDesc:
      'ორენოვანი საიტი — ტაქსი, ექსკურსიები, სასტუმროები და რესტორნები გაგრაში — მიწოდებული და მუშა, აქტიური ტექნიკური SEO-თი.',
    devProjectName: 'ტრანსპორტის მართვის MVP',
    devProjectDesc: 'მასშტაბირებადი ბექენდის არქიტექტურა (Node.js, Redis, PostgreSQL) და მობილური აპლიკაცია.',
    colService: 'სერვისი',
    colTime: 'მიწოდება',
    colPrice: 'ფასი',
    perMonth: '/თვე',
    perHour: '/სთ',
    plus: 'პლუს',
    thenMonthly: 'შემდეგ',
    bundlesTitle: 'პაკეტები',
    bundlesNote: 'დახურული კომბინაციები, ფასდაკლებით.',
    bundleIncludes: 'შედის',
    ctaTitle: 'რომელი მათგანი გჭირდებათ?',
    ctaBody:
      'მომწერეთ რისი აშენება გინდათ და დაგიბრუნებთ დახურულ ხარჯთაღრიცხვას მიწოდების თარიღით. ზარი საჭირო არ არის, თუ თავად არ გსურთ.',
    ctaButton: 'ხარჯთაღრიცხვის მოთხოვნა',
    ctaSecondary: 'მომწერეთ Telegram-ზე',
    terms: 'პირობები',
    termsList: [
      '50% გადაიხდება დაწყებისას, 50% — მიწოდებისას.',
      'ფასები არ მოიცავს დღგ-ს, დომენს და მესამე მხარის ლიცენზიებს.',
      'დიაპაზონი დამოკიდებულია რეალურ მოცულობაზე; ხელმოწერილი ხარჯთაღრიცხვა ფიქსირებულია.',
      'რუბლი და ლარი ევროს კონვერტაცია არ არის — თითოეული საკუთარი ბაზრის ტარიფითაა დაანგარიშებული.',
    ],
    showMore: "მეტის ნახვა",
    showLess: "ჩაკეცვა",
    closeSteps: ["აგზავნით იდეას","იღებთ ფასს და ვადას","დამუშავება და მიწოდება"],
    footer: 'GeoMachine Developer Group',
  },
} as const;
