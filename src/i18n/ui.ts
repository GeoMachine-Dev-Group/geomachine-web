export const languages = { es: 'Español', ru: 'Русский' } as const;
export type Lang = keyof typeof languages;

/** Ruta de /servicios en cada idioma. Cambia aquí si quieres otro slug. */
export const servicesPath: Record<Lang, string> = {
  es: '/es/servicios/',
  ru: '/ru/uslugi/',
};

export const ui = {
  es: {
    htmlLang: 'es',
    metaTitle: 'Catálogo de servicios — GeoMachine Developer Group',
    metaDescription:
      'Webs, aplicaciones, inteligencia artificial, mantenimiento y posicionamiento. Precios abiertos en euros y rublos, presupuesto cerrado y entrega en días.',
    plate: 'Catálogo de servicios',
    rev: 'Rev. 2026.08',
    company: 'GeoMachine Developer Group',
    sectionsLabel: 'Secciones',
    notFoundTitle: 'Esta página no existe',
    notFoundBody: 'El enlace que has seguido no lleva a ninguna parte. El catálogo completo sigue aquí.',
    notFoundCta: 'Ir al catálogo',
    heroEyebrow: 'Desarrollo web, aplicaciones e inteligencia artificial',
    heroTitle: 'Todo lo que hago,\ncon el precio puesto',
    heroBody:
      'Un solo desarrollador, herramientas de IA que multiplican el trabajo y sin comerciales de por medio. Por eso los presupuestos salen a la mitad y las entregas en días, no en meses.',
    tierLabel: 'Tarifa',
    tierLaunch: 'Lanzamiento',
    tierStandard: 'Estándar',
    currencyLabel: 'Moneda',
    stampLine1: 'Tarifa de lanzamiento',
    stampLine2: 'primeros clientes',
    launchNote:
      'La tarifa de lanzamiento se aplica a los primeros clientes, a cambio de poder publicar el resultado como caso de estudio. Después pasa a estándar.',
    standardNote: 'Tarifa estándar. Los clientes de mantenimiento conservan su precio de alta.',
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
      'Los rublos no son una conversión del euro: son la tarifa del mercado ruso.',
    ],
    footer: 'GeoMachine Developer Group',
  },
  ru: {
    htmlLang: 'ru',
    metaTitle: 'Каталог услуг и цены — GeoMachine Developer Group',
    metaDescription:
      'Сайты, приложения, искусственный интеллект, обслуживание и продвижение. Открытые цены в рублях и евро, фиксированная смета и сдача за дни.',
    plate: 'Каталог услуг',
    rev: 'Ред. 2026.08',
    company: 'GeoMachine Developer Group',
    sectionsLabel: 'Разделы',
    notFoundTitle: 'Такой страницы нет',
    notFoundBody: 'Ссылка, по которой вы перешли, никуда не ведёт. Полный каталог по-прежнему здесь.',
    notFoundCta: 'Открыть каталог',
    heroEyebrow: 'Разработка сайтов, приложений и искусственный интеллект',
    heroTitle: 'Всё, что я делаю,\nсразу с ценой',
    heroBody:
      'Один разработчик, инструменты ИИ, которые ускоряют работу в разы, и никаких менеджеров по продажам. Поэтому смета выходит вдвое ниже, а сроки считаются в днях.',
    tierLabel: 'Тариф',
    tierLaunch: 'Стартовый',
    tierStandard: 'Обычный',
    currencyLabel: 'Валюта',
    stampLine1: 'Стартовый тариф',
    stampLine2: 'первым клиентам',
    launchNote:
      'Стартовый тариф действует для первых клиентов — взамен я публикую результат как кейс. Дальше цена становится обычной.',
    standardNote: 'Обычный тариф. У клиентов на обслуживании цена подключения не меняется.',
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
      'Рубли — не пересчёт евро, а отдельный тариф для российского рынка.',
    ],
    footer: 'GeoMachine Developer Group',
  },
} as const;
