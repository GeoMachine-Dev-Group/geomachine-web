/**
 * Textos de interfaz — 4 idiomas (ES/RU/EN/KA).
 *
 * ⚠️ Igual que en catalog-i18n.ts: el georgiano (ka) conviene que lo repase
 * un hablante nativo antes de publicar. El inglés y el ruso tienen menos
 * riesgo pero también merecen una relectura.
 *
 * Copy del hero (2026-09-10): título + un solo párrafo, sin eyebrow ni
 * segundo párrafo. El tono es concreto — quién te atiende y qué se entrega —
 * en lugar de las tres formulaciones abstractas que se repetían antes ("sin
 * fricción", "transparencia total", "rendimiento superior"). Si cambias el
 * hero, actualiza también esta nota.
 *
 * Otros textos propios de este ui.ts: la sección "En desarrollo / Entregado"
 * con gagraservis.ru y el contador de plazas de lanzamiento.
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

/**
 * El blog existe en es, ru y en. En georgiano no: todo el `ka` del sitio va
 * traducido por IA y sin revisar por un nativo, y doce artículos largos en esas
 * condiciones hacen más daño a la marca que no tenerlos. Cuando haya revisor,
 * se añade 'ka' aquí y las rutas de src/pages/ka/blog/.
 */
export type BlogLang = 'es' | 'ru' | 'en';

export const blogPath: Record<BlogLang, string> = {
  es: '/es/blog/',
  ru: '/ru/blog/',
  en: '/en/blog/',
};

/** Estrecha el tipo además de responder: dentro del `if` ya se puede indexar
    blogPath con lang sin castearlo. */
export function hasBlog(lang: Lang): lang is BlogLang {
  return lang in blogPath;
}

export const ui = {
  es: {
    htmlLang: 'es',
    metaTitle: 'Webs, apps, IA, mantenimiento y SEO — GeoMachine Developer Group',
    metaDescription:
      'Webs, aplicaciones, inteligencia artificial, mantenimiento y SEO. Precio cerrado desde el primer mensaje, entrega en días. Precios en euros, rublos y lari.',
    plate: 'Catálogo de servicios',
    rev: 'Rev. 2026.08',
    company: 'GeoMachine Developer Group',
    heroTitle: 'El que te atiende es el que escribe el código.',
    heroBody:
      'Webs, aplicaciones e IA que corre en tu propio servidor. Precio cerrado desde el primer mensaje y entrega en días, no en trimestres.',
    currencyLabel: 'Moneda',
    heroAnchorsLabel: 'Precios de entrada',
    slotsTitle: 'Precio de lanzamiento',
    slotsLeft: '{free} de {total} plazas libres',
    heroCtaSlot: 'Solicitar plaza',
    proofLabel: 'Trabajos',
    proofPrivateAi: 'IA privada',
    proofDesktopApp: 'App de escritorio',
    cardStyles: { stack: 'Capas apiladas', tilt: 'Inclinación 3D' },
    priceAnims: { blur: 'Desenfoque suave', odometer: 'Deslizamiento vertical', glow: 'Pulso de brillo', flip: 'Giro 3D' },
    modalTitle: 'Solicitar Presupuesto',
    modalSubtitle: 'Cuéntanos qué necesitas y te responderemos con un precio cerrado en menos de 24 horas.',
    launchNote:
      'La tarifa de lanzamiento se aplica a los primeros clientes, a cambio de poder publicar el resultado como caso de estudio. Después pasa a estándar.',
    statusDelivered: 'Entregado',
    statusDev: 'Fase de Desarrollo',
    devProjectName: 'MVP Gestión de Transporte',
    colService: 'Servicio',
    colTime: 'Entrega',
    colPrice: 'Precio',
    perMonth: '/mes',
    perHour: '/h',
    plus: 'más',
    thenMonthly: 'después',
    priceFrom: 'desde',
    bundlesTitle: 'Paquetes',
    bundlesNote: 'Combinaciones cerradas, ya con descuento aplicado.',
    bundleIncludes: 'Incluye',
    ctaTitle: '¿Cuál de estos necesitas?',
    ctaBody:
      'Escríbeme qué quieres montar y te devuelvo un presupuesto cerrado con fecha de entrega. Sin llamada previa si no te apetece.',
    ctaButton: 'Pedir presupuesto',
    ctaSecondary: 'Escríbeme por Telegram',
    ctaResponseTime: 'Respondo en menos de 24 horas.',
    formName: 'Nombre',
    formNamePh: 'Tu nombre o empresa',
    formContact: 'Email o Telegram',
    formContactPh: 'Email, Telegram o teléfono',
    formService: 'Qué necesitas',
    formServiceOther: 'Aún no lo sé',
    formBudget: 'Presupuesto orientativo (opcional)',
    formBudgetPh: 'Ej: 500–1.000 €',
    formMessage: 'Cuéntame tu proyecto',
    formMessagePh: 'Cuéntanos brevemente qué necesitas...',
    formSending: 'Enviando…',
    formSuccess: '¡Recibido! Te respondo en menos de 24 horas.',
    formError: 'Algo ha fallado. Escríbeme directo por Telegram mientras tanto.',
    faqTitle: 'Preguntas frecuentes',
    faqQ1: '¿Cómo nos comunicamos durante el desarrollo?',
    faqA1: 'Directo, por el mismo canal donde ya hablamos (WhatsApp o Telegram) — sin pasar por un ticket ni un panel de gestión de proyecto. Te aviso de avances reales, no "notificaciones automáticas" genéricas.',
    faqQ2: '¿Qué pasa si quiero hacer cambios sobre el diseño ya entregado?',
    faqA2: 'Depende de si el cambio está dentro del alcance original o es algo nuevo. Ajustes menores (texto, colores, una sección) suelen entrar sin coste extra si se piden justo después de la entrega. Cambios grandes (nueva funcionalidad, rediseño completo de una sección) se cotizan aparte, y te lo digo con precio antes de tocar nada.',
    faqQ3: '¿Cómo funciona el mantenimiento después de la entrega?',
    faqA3Before:
      'Tu web no necesita mantenimiento obligatorio para seguir funcionando — pero si quieres que alguien vigile que no se caiga, tenga copias de seguridad y puedas pedir cambios sin abrir un proyecto nuevo cada vez, ahí están los ',
    faqMntLink: 'planes de mantenimiento',
    faqA3After: '.',
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
    blogSeeArticles: 'Ver artículos de {tema}',
    footer: 'GeoMachine Developer Group',
    blogTitle: 'Blog',
    blogMetaDescription:
      'Artículos sobre desarrollo web, IA aplicada a negocios pequeños, SEO y aplicaciones, con precios reales y casos propios. Los escribe quien hace los proyectos.',
    blogEmpty: 'Todavía no hay artículos publicados.',
    blogBack: '← Volver al blog',
    blogRelated: 'Servicio relacionado',
    blogRelatedArticles: 'Sigue leyendo',
    navHome: 'Inicio',
    navServices: 'Servicios',
    navContact: 'Contacto',
    readingTimeSuffix: 'min de lectura',
    blogIntro:
      'Artículos prácticos sobre webs, IA, SEO y sistemas para negocios pequeños: qué cuesta, qué funciona y qué no merece la pena.',
    blogFilterLabel: 'Filtrar por tema',
    blogFilterAll: 'Todos',
    blogFeatured: 'Destacado',
    blogBy: 'Por',
    blogSeeService: 'Ver en el catálogo',
    blogNavLabel: 'Navegación principal',
    blogBreadcrumbLabel: 'Migas de pan',
  },
  ru: {
    htmlLang: 'ru',
    metaTitle: 'Сайты, приложения, ИИ, сервис и SEO — GeoMachine Developer Group',
    metaDescription:
      'Сайты, приложения, искусственный интеллект, обслуживание и SEO. Цена фиксируется с первого сообщения, результат — за дни. Цены в евро, рублях и грузинском лари.',
    plate: 'Каталог услуг',
    rev: 'Ред. 2026.08',
    company: 'GeoMachine Developer Group',
    heroTitle: 'Вы общаетесь напрямую с разработчиком.',
    heroBody:
      'Сайты, приложения и ИИ на вашем собственном сервере. Точная цена с первого сообщения, сроки — дни, а не кварталы.',
    currencyLabel: 'Валюта',
    heroAnchorsLabel: 'Цены для старта',
    slotsTitle: 'Стартовая цена',
    slotsLeft: 'Свободно мест: {free} из {total}',
    heroCtaSlot: 'Забронировать место',
    proofLabel: 'Работы',
    proofPrivateAi: 'Приватный ИИ',
    proofDesktopApp: 'Десктоп-приложение',
    cardStyles: { stack: 'Слоями', tilt: 'Наклон 3D' },
    priceAnims: { blur: 'Мягкое размытие', odometer: 'Вертикальный сдвиг', glow: 'Свечение', flip: '3D-переворот' },
    modalTitle: 'Запросить расчет',
    modalSubtitle: 'Расскажите о вашем проекте, и мы ответим менее чем за 24 часа с точной ценой.',
    launchNote:
      'Стартовый тариф действует для первых клиентов — взамен я публикую результат как кейс. Дальше цена становится обычной.',
    statusDelivered: 'Сдано',
    statusDev: 'В разработке',
    devProjectName: 'MVP приложения такси',
    colService: 'Услуга',
    colTime: 'Срок',
    colPrice: 'Цена',
    perMonth: '/мес',
    perHour: '/ч',
    plus: 'плюс',
    thenMonthly: 'далее',
    priceFrom: 'от',
    bundlesTitle: 'Пакеты',
    bundlesNote: 'Готовые связки, скидка уже внутри.',
    bundleIncludes: 'Входит',
    ctaTitle: 'Что из этого вам нужно?',
    ctaBody:
      'Напишите, что хотите построить, и я пришлю фиксированную смету со сроком. Созвон — только если сами захотите.',
    ctaButton: 'Запросить смету',
    ctaSecondary: 'Написать в Telegram',
    ctaResponseTime: 'Отвечаю менее чем за 24 часа.',
    formName: 'Имя',
    formNamePh: 'Ваше имя или компания',
    formContact: 'Email или Telegram',
    formContactPh: 'Email, Telegram или телефон',
    formService: 'Что вам нужно',
    formServiceOther: 'Пока не знаю',
    formBudget: 'Ориентировочный бюджет (не обязательно)',
    formBudgetPh: 'Напр.: 30 000–60 000 ₽',
    formMessage: 'Расскажите о проекте',
    formMessagePh: 'Коротко опишите, что вам нужно...',
    formSending: 'Отправка…',
    formSuccess: 'Получено! Отвечу в течение 24 часов.',
    formError: 'Что-то пошло не так. Напишите напрямую в Telegram.',
    faqTitle: 'Частые вопросы',
    faqQ1: 'Как мы общаемся во время разработки?',
    faqA1: 'Напрямую, по тому же каналу, где уже общаемся (WhatsApp или Telegram) — без тикетов и панели управления проектом. Сообщаю о реальном прогрессе, а не отправляю общие «автоматические уведомления».',
    faqQ2: 'Что если я захочу внести правки в уже сданный дизайн?',
    faqA2: 'Зависит от того, входит ли изменение в исходный объём или это что-то новое. Мелкие правки (текст, цвета, один блок) обычно включены без доплаты, если их просят сразу после сдачи. Крупные изменения (новая функциональность, полный редизайн раздела) оцениваются отдельно, и я сообщаю цену заранее, до того как что-либо трогать.',
    faqQ3: 'Как работает обслуживание после сдачи проекта?',
    faqA3Before:
      'Ваш сайт не требует обязательного обслуживания, чтобы продолжать работать — но если хотите, чтобы кто-то следил за тем, чтобы он не упал, делал резервные копии и позволял вносить правки без открытия нового проекта каждый раз, для этого есть ',
    faqMntLink: 'планы обслуживания',
    faqA3After: '.',
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
    blogSeeArticles: 'Статьи: {tema}',
    footer: 'GeoMachine Developer Group',
    blogTitle: 'Блог',
    blogMetaDescription:
      'Статьи о веб-разработке, ИИ для малого бизнеса, SEO и приложениях: реальные цены и собственные кейсы. Пишет тот, кто сам делает проекты.',
    blogEmpty: 'Пока нет опубликованных статей.',
    blogBack: '← Назад в блог',
    blogRelated: 'Похожая услуга',
    blogRelatedArticles: 'Читайте также',
    navHome: 'Главная',
    navServices: 'Услуги',
    navContact: 'Контакты',
    readingTimeSuffix: 'мин чтения',
    blogIntro:
      'Практичные статьи о сайтах, ИИ, SEO и системах для малого бизнеса: сколько это стоит, что работает и на что не стоит тратиться.',
    blogFilterLabel: 'Фильтр по теме',
    blogFilterAll: 'Все',
    blogFeatured: 'Главное',
    blogBy: 'Автор:',
    blogSeeService: 'Смотреть в каталоге',
    blogNavLabel: 'Основная навигация',
    blogBreadcrumbLabel: 'Навигационная цепочка',
  },
  en: {
    htmlLang: 'en',
    metaTitle: 'Websites, apps, AI, support and SEO — GeoMachine Developer Group',
    metaDescription:
      'Websites, applications, artificial intelligence, maintenance and SEO. Price closed from the first message, delivered in days. Pricing in euros, rubles and lari.',
    plate: 'Service catalog',
    rev: 'Rev. 2026.08',
    company: 'GeoMachine Developer Group',
    heroTitle: 'You talk to the person who writes the code.',
    heroBody:
      'Websites, apps, and AI that runs on your own server. Fixed price from the first message, delivered in days, not quarters.',
    currencyLabel: 'Currency',
    heroAnchorsLabel: 'Starting prices',
    slotsTitle: 'Launch pricing',
    slotsLeft: '{free} of {total} spots left',
    heroCtaSlot: 'Request a spot',
    proofLabel: 'Work',
    proofPrivateAi: 'Private AI',
    proofDesktopApp: 'Desktop app',
    cardStyles: { stack: 'Stacked layers', tilt: '3D tilt' },
    priceAnims: { blur: 'Smooth blur', odometer: 'Vertical slide', glow: 'Glow pulse', flip: '3D flip' },
    modalTitle: 'Request a Quote',
    modalSubtitle: 'Tell us about your project and we will respond in less than 24 hours with a fixed price.',
    launchNote:
      'Launch pricing applies to the first clients, in exchange for being able to publish the result as a case study. It moves to standard pricing after that.',
    statusDelivered: 'Delivered',
    statusDev: 'In development',
    devProjectName: 'Transport management MVP',
    colService: 'Service',
    colTime: 'Delivery',
    colPrice: 'Price',
    perMonth: '/mo',
    perHour: '/h',
    plus: 'plus',
    thenMonthly: 'then',
    priceFrom: 'from',
    bundlesTitle: 'Packages',
    bundlesNote: 'Closed combinations, discount already applied.',
    bundleIncludes: 'Includes',
    ctaTitle: 'Which of these do you need?',
    ctaBody:
      "Tell me what you want to build and I'll send back a closed quote with a delivery date. No call needed unless you want one.",
    ctaButton: 'Request a quote',
    ctaSecondary: 'Message me on Telegram',
    ctaResponseTime: 'I respond in under 24 hours.',
    formName: 'Name',
    formNamePh: 'Your name or company',
    formContact: 'Email or Telegram',
    formContactPh: 'Email, Telegram or phone',
    formService: 'What you need',
    formServiceOther: "I'm not sure yet",
    formBudget: 'Rough budget (optional)',
    formBudgetPh: 'e.g. 500–1,000 €',
    formMessage: 'Tell me about your project',
    formMessagePh: 'Briefly, what do you need?...',
    formSending: 'Sending…',
    formSuccess: "Got it! I'll reply within 24 hours.",
    formError: 'Something went wrong. Message me directly on Telegram instead.',
    faqTitle: 'Frequently asked questions',
    faqQ1: 'How do we communicate during development?',
    faqA1: 'Directly, on the same channel we\'re already using (WhatsApp or Telegram) — no tickets, no project management dashboard. I let you know about real progress, not generic "automated notifications".',
    faqQ2: 'What if I want changes to a design that has already been delivered?',
    faqA2: 'Depends on whether the change is within the original scope or something new. Minor tweaks (text, colors, one section) are usually included at no extra cost if requested right after delivery. Bigger changes (new functionality, a full section redesign) are quoted separately, with the price given before touching anything.',
    faqQ3: 'How does maintenance work after delivery?',
    faqA3Before:
      "Your site doesn't need mandatory maintenance to keep working — but if you want someone watching that it doesn't go down, keeping backups, and letting you request changes without opening a new project every time, that's what the ",
    faqMntLink: 'maintenance plans',
    faqA3After: ' are for.',
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
    blogSeeArticles: 'Articles on {tema}',
    blogTitle: 'Blog',
    blogIntro:
      'Practical articles on websites, AI, SEO and systems for small businesses: what it costs, what works and what is not worth paying for.',
    blogMetaDescription:
      'Articles on web development, AI for small businesses, SEO and apps, with real prices and projects of my own. Written by the person who builds them.',
    blogEmpty: 'No articles published yet.',
    blogFeatured: 'Featured',
    blogFilterAll: 'All',
    blogFilterLabel: 'Filter by topic',
    blogBy: 'By',
    blogRelated: 'Related service',
    blogRelatedArticles: 'Keep reading',
    blogSeeService: 'See it in the catalogue',
    blogNavLabel: 'Main navigation',
    blogBreadcrumbLabel: 'Breadcrumb',
    readingTimeSuffix: 'min read',
    footer: 'GeoMachine Developer Group',
  },
  ka: {
    htmlLang: 'ka',
    metaTitle: 'საიტები, აპები, AI, მოვლა და SEO — GeoMachine Developer Group',
    metaDescription:
      'ვებგვერდები, აპლიკაციები, ხელოვნური ინტელექტი, მოვლა და SEO. ფასი ფიქსირდება პირველივე შეტყობინებიდან, მზადდება დღეებში. ფასები ევროში, რუბლში და ლარში.',
    plate: 'სერვისების კატალოგი',
    rev: 'რედ. 2026.08',
    company: 'GeoMachine Developer Group',
    // heroTitle/heroBody: traducidos por IA, PENDIENTES de revisión por un
    // hablante nativo antes de darlos por buenos. Es el primer texto que ve
    // quien entra en /ka/momsakhurebebi/, así que un fallo de registro o de
    // declinación aquí pesa más que en cualquier otra clave. Ver la misma
    // advertencia sobre el georgiano al inicio de este archivo, en catalog.ts
    // y en priceFrom más abajo.
    heroTitle: 'თქვენ პირდაპირ ესაუბრებით დეველოპერს.',
    heroBody:
      'ვებგვერდები, აპლიკაციები და ხელოვნური ინტელექტი თქვენს საკუთარ სერვერზე. ფიქსირებული ფასი პირველივე შეტყობინებიდან, ჩაბარება დღეებში და არა კვარტლებში.',
    currencyLabel: 'ვალუტა',
    // heroAnchorsLabel/slotsTitle/slotsLeft: traducidos por IA, PENDIENTES de
    // revisión nativa. slotsLeft va como "etiqueta: n / total" a propósito,
    // para no depender de la declinación de "plaza" con el número.
    heroAnchorsLabel: 'საწყისი ფასები',
    slotsTitle: 'გაშვების ფასი',
    slotsLeft: 'თავისუფალი ადგილები: {free} / {total}',
    // heroCtaSlot y proof*: traducidos por IA, PENDIENTES de revisión nativa.
    heroCtaSlot: 'ადგილის მოთხოვნა',
    proofLabel: 'ნამუშევრები',
    proofPrivateAi: 'კონფიდენციალური AI',
    proofDesktopApp: 'დესკტოპ აპლიკაცია',
    paletteLabel: 'პალიტრა',
    cardStyleLabel: 'ბარათები',
    priceAnimLabel: 'ფასის ანიმაცია',
    cardStyles: { stack: 'დაწყობილი შრეები', tilt: '3D დახრა' },
    priceAnims: { blur: 'რბილი გაბუნდოვნება', odometer: 'ვერტიკალური სრიალი', glow: 'განათება', flip: '3D ტრიალი' },
    modalTitle: 'ფასის მოთხოვნა',
    modalSubtitle: 'მოგვწერეთ პროექტის შესახებ და 24 საათში მიიღებთ ზუსტ ფასს.',
    launchNote:
      'გაშვების ტარიფი ვრცელდება პირველ კლიენტებზე, სანაცვლოდ ვაქვეყნებ შედეგს, როგორც კეისს. შემდეგ ფასი სტანდარტულზე გადადის.',
    statusDelivered: 'მიწოდებული',
    statusDev: 'დამუშავების ფაზაში',
    devProjectName: 'ტრანსპორტის მართვის MVP',
    colService: 'სერვისი',
    colTime: 'მიწოდება',
    colPrice: 'ფასი',
    perMonth: '/თვე',
    perHour: '/სთ',
    plus: 'პლუს',
    thenMonthly: 'შემდეგ',
    // priceFrom: intencionadamente vacío — "desde" en georgiano se resuelve
    // por declinación del sustantivo, no por prefijo fijo, y una traducción
    // aquí sin revisión nativa podría ser gramaticalmente incorrecta. Con
    // priceFrom vacío, Catalog.astro muestra solo el número ("250 €"), sin
    // prefijo. Ver misma advertencia sobre el georgiano al inicio de este
    // archivo y en catalog.ts.
    priceFrom: '',
    bundlesTitle: 'პაკეტები',
    bundlesNote: 'დახურული კომბინაციები, ფასდაკლებით.',
    bundleIncludes: 'შედის',
    ctaTitle: 'რომელი მათგანი გჭირდებათ?',
    ctaBody:
      'მომწერეთ რისი აშენება გინდათ და დაგიბრუნებთ დახურულ ხარჯთაღრიცხვას მიწოდების თარიღით. ზარი საჭირო არ არის, თუ თავად არ გსურთ.',
    ctaButton: 'ხარჯთაღრიცხვის მოთხოვნა',
    ctaSecondary: 'მომწერეთ Telegram-ზე',
    ctaResponseTime: 'ვპასუხობ 24 საათზე ნაკლებში.',
    formName: 'სახელი',
    formNamePh: 'თქვენი სახელი ან კომპანია',
    formContact: 'ელფოსტა ან Telegram',
    formContactPh: 'ელფოსტა, Telegram ან ტელეფონი',
    formService: 'რა გჭირდებათ',
    formServiceOther: 'ჯერ არ ვიცი',
    formBudget: 'სავარაუდო ბიუჯეტი (არასავალდებულო)',
    formBudgetPh: 'მაგ.: 1 500–3 000 ₾',
    formMessage: 'მომიყევით პროექტის შესახებ',
    formMessagePh: 'მოკლედ აღწერეთ, რა გჭირდებათ...',
    formSending: 'იგზავნება…',
    formSuccess: 'მიღებულია! გიპასუხებთ 24 საათში.',
    formError: 'რაღაც შეცდომა მოხდა. მომწერეთ პირდაპირ Telegram-ზე.',
    faqTitle: 'ხშირად დასმული კითხვები',
    faqQ1: 'როგორ ვურთიერთობთ დეველოპმენტის დროს?',
    faqA1: 'პირდაპირ, იმავე არხით, სადაც უკვე ვსაუბრობთ (WhatsApp ან Telegram) — ტიკეტების ან პროექტის მართვის პანელის გარეშე. გატყობინებთ რეალურ პროგრესზე, არა ზოგად „ავტომატურ შეტყობინებებზე“.',
    faqQ2: 'რა ხდება, თუ უკვე მიწოდებულ დიზაინში ცვლილებების შეტანა მინდა?',
    faqA2: 'დამოკიდებულია იმაზე, თავდაპირველ მოცულობაშია ცვლილება თუ ახალია. მცირე შესწორებები (ტექსტი, ფერები, ერთი სექცია) ჩვეულებრივ უფასოდ შედის, თუ მიწოდებისთანავე მოთხოვნილია. დიდი ცვლილებები (ახალი ფუნქციონალი, სექციის სრული რედიზაინი) ცალკე ფასდება, და ფასს გეტყვით მანამ, სანამ რამეს შევეხები.',
    faqQ3: 'როგორ მუშაობს მოვლა მიწოდების შემდეგ?',
    faqA3Before:
      'თქვენს საიტს არ სჭირდება სავალდებულო მოვლა მუშაობის გასაგრძელებლად — მაგრამ თუ გინდათ ვინმემ დააკვირდეს, რომ არ ჩავარდეს, გქონდეთ სარეზერვო ასლები და შეძლოთ ცვლილებების მოთხოვნა ყოველ ჯერზე ახალი პროექტის გახსნის გარეშე, ამისთვის არის ',
    faqMntLink: 'მოვლის გეგმები',
    faqA3After: '.',
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
    blogSeeArticles: '{tema}: სტატიები',
    footer: 'GeoMachine Developer Group',
  },
} as const;
