/**
 * CATÁLOGO GEOMACHINE — fuente única de precios.
 *
 * Dos tarifas conviven en el mismo archivo:
 *   launch   = tarifa de lanzamiento (primeros clientes)
 *   standard = tarifa estándar
 *
 * Para cambiar de tarifa por defecto, edita DEFAULT_TIER en este archivo.
 * El visitante puede alternar en la página con el conmutador del panel.
 *
 * Rublos: no son una conversión del euro. El mercado ruso se factura a razón
 * de ~60 ₽/€ por decisión comercial, no al cambio de divisa del día.
 */

export type Tier = 'launch' | 'standard';
export type Currency = 'eur' | 'rub';
export type Unit = 'once' | 'month' | 'hour';

export const DEFAULT_TIER: Tier = 'launch';
export const DEFAULT_CURRENCY: Currency = 'eur';

/** Precio: [mínimo, máximo] o [exacto] si solo hay un número. */
type Range = [number] | [number, number];

interface Money {
  eur: Range;
  rub: Range;
}

interface Bilingual {
  es: string;
  ru: string;
}

export interface Item {
  code: string;
  name: Bilingual;
  spec: Bilingual;
  time?: Bilingual;
  unit: Unit;
  launch: Money;
  standard: Money;
  /** Cuota recurrente opcional (servicios de IA con mantenimiento). */
  launchRecurring?: Money;
  standardRecurring?: Money;
}

export interface Line {
  prefix: string;
  title: Bilingual;
  note: Bilingual;
  items: Item[];
}

export const lines: Line[] = [
  {
    prefix: 'WEB',
    title: { es: 'Sitios web', ru: 'Сайты' },
    note: {
      es: 'Estáticos, sin CMS pesado. Cargan en menos de un segundo y no se rompen solos.',
      ru: 'Статические, без тяжёлой CMS. Грузятся меньше секунды и не ломаются сами по себе.',
    },
    items: [
      {
        code: 'WEB-01',
        name: { es: 'Landing page', ru: 'Лендинг' },
        spec: {
          es: 'Una página, formulario de contacto, analítica instalada',
          ru: 'Одна страница, форма обратной связи, аналитика',
        },
        time: { es: '1–2 días', ru: '1–2 дня' },
        unit: 'once',
        launch: { eur: [250, 400], rub: [15000, 25000] },
        standard: { eur: [500, 900], rub: [30000, 55000] },
      },
      {
        code: 'WEB-02',
        name: { es: 'Web corporativa', ru: 'Корпоративный сайт' },
        spec: {
          es: 'Cinco páginas, blog, SEO base, textos revisados',
          ru: 'Пять страниц, блог, базовое SEO, вычитанные тексты',
        },
        time: { es: '3–5 días', ru: '3–5 дней' },
        unit: 'once',
        launch: { eur: [550, 900], rub: [35000, 60000] },
        standard: { eur: [1200, 2500], rub: [70000, 140000] },
      },
      {
        code: 'WEB-03',
        name: { es: 'Segundo idioma', ru: 'Второй язык' },
        spec: {
          es: 'Rutas separadas, hreflang, traducción pensada para buscadores',
          ru: 'Отдельные маршруты, hreflang, перевод под поисковые системы',
        },
        time: { es: '+1 día', ru: '+1 день' },
        unit: 'once',
        launch: { eur: [150, 250], rub: [10000, 15000] },
        standard: { eur: [400, 900], rub: [25000, 55000] },
      },
      {
        code: 'WEB-04',
        name: { es: 'Tienda online', ru: 'Интернет-магазин' },
        spec: {
          es: 'Catálogo, pagos, panel para gestionar pedidos sin tocar código',
          ru: 'Каталог, оплата, панель управления заказами без кода',
        },
        time: { es: '1–2 semanas', ru: '1–2 недели' },
        unit: 'once',
        launch: { eur: [1200, 2200], rub: [80000, 140000] },
        standard: { eur: [2500, 6000], rub: [150000, 350000] },
      },
      {
        code: 'WEB-05',
        name: { es: 'Rediseño y migración', ru: 'Редизайн и миграция' },
        spec: {
          es: 'Tu sitio actual, reconstruido rápido y sin perder posiciones',
          ru: 'Ваш сайт заново — быстрее и без потери позиций',
        },
        time: { es: '2–4 días', ru: '2–4 дня' },
        unit: 'once',
        launch: { eur: [400, 800], rub: [25000, 50000] },
        standard: { eur: [800, 2000], rub: [50000, 120000] },
      },
    ],
  },
  {
    prefix: 'APP',
    title: { es: 'Aplicaciones', ru: 'Приложения' },
    note: {
      es: 'Software a medida cuando la hoja de cálculo se queda corta.',
      ru: 'Софт под задачу, когда таблицы уже не справляются.',
    },
    items: [
      {
        code: 'APP-01',
        name: { es: 'MVP web', ru: 'MVP веб-приложения' },
        spec: {
          es: 'Usuarios, base de datos, panel de gestión, versión funcional',
          ru: 'Пользователи, база данных, панель управления, рабочая версия',
        },
        time: { es: '2–4 semanas', ru: '2–4 недели' },
        unit: 'once',
        launch: { eur: [1800, 4500], rub: [110000, 270000] },
        standard: { eur: [4000, 12000], rub: [240000, 720000] },
      },
      {
        code: 'APP-02',
        name: { es: 'PWA', ru: 'PWA' },
        spec: {
          es: 'Se instala en el móvil, funciona sin conexión, envía avisos',
          ru: 'Ставится на телефон, работает офлайн, шлёт уведомления',
        },
        time: { es: '1–2 semanas', ru: '1–2 недели' },
        unit: 'once',
        launch: { eur: [1200, 2800], rub: [72000, 168000] },
        standard: { eur: [3000, 8000], rub: [180000, 480000] },
      },
      {
        code: 'APP-03',
        name: { es: 'Integraciones', ru: 'Интеграции' },
        spec: {
          es: 'Conectar CRM, pagos, reservas o el sistema que ya usas',
          ru: 'Связать CRM, оплату, бронирование или текущую систему',
        },
        time: { es: '1–3 días', ru: '1–3 дня' },
        unit: 'once',
        launch: { eur: [350, 1200], rub: [21000, 72000] },
        standard: { eur: [800, 3000], rub: [48000, 180000] },
      },
      {
        code: 'APP-04',
        name: { es: 'Bolsa de horas', ru: 'Пакет часов' },
        spec: {
          es: 'Desarrollo suelto, mínimo diez horas, sin caducidad',
          ru: 'Разработка по запросу, минимум десять часов, без срока',
        },
        unit: 'hour',
        launch: { eur: [22, 30], rub: [1300, 1800] },
        standard: { eur: [35, 60], rub: [2100, 3600] },
      },
    ],
  },
  {
    prefix: 'IA',
    title: { es: 'Inteligencia artificial', ru: 'Искусственный интеллект' },
    note: {
      es: 'Incluida la opción local: el modelo corre en el servidor del cliente y sus datos no salen de la empresa.',
      ru: 'Есть локальный вариант: модель работает на сервере клиента, данные не покидают компанию.',
    },
    items: [
      {
        code: 'IA-01',
        name: { es: 'Auditoría de procesos', ru: 'Аудит процессов' },
        spec: {
          es: 'Dónde se pierde tiempo y qué se puede automatizar, por escrito',
          ru: 'Где теряется время и что можно автоматизировать — письменно',
        },
        time: { es: '2–3 días', ru: '2–3 дня' },
        unit: 'once',
        launch: { eur: [150, 300], rub: [9000, 18000] },
        standard: { eur: [400, 800], rub: [24000, 48000] },
      },
      {
        code: 'IA-02',
        name: { es: 'Asistente para clientes', ru: 'Ассистент для клиентов' },
        spec: {
          es: 'Responde en la web y en WhatsApp con los datos reales del negocio',
          ru: 'Отвечает на сайте и в WhatsApp по реальным данным компании',
        },
        time: { es: '3–6 días', ru: '3–6 дней' },
        unit: 'once',
        launch: { eur: [500, 1200], rub: [30000, 72000] },
        standard: { eur: [1200, 3000], rub: [72000, 180000] },
        launchRecurring: { eur: [35, 70], rub: [2100, 4200] },
        standardRecurring: { eur: [60, 150], rub: [3600, 9000] },
      },
      {
        code: 'IA-03',
        name: { es: 'Automatización de tareas', ru: 'Автоматизация задач' },
        spec: {
          es: 'Presupuestos, correos e informes que se generan solos',
          ru: 'Сметы, письма и отчёты формируются сами',
        },
        time: { es: '2–5 días', ru: '2–5 дней' },
        unit: 'once',
        launch: { eur: [350, 900], rub: [21000, 54000] },
        standard: { eur: [800, 2500], rub: [48000, 150000] },
        launchRecurring: { eur: [30, 60], rub: [1800, 3600] },
        standardRecurring: { eur: [50, 120], rub: [3000, 7200] },
      },
      {
        code: 'IA-04',
        name: { es: 'IA privada en tu servidor', ru: 'Приватный ИИ на вашем сервере' },
        spec: {
          es: 'Modelo propio, sin nube, sin enviar nada a terceros',
          ru: 'Своя модель, без облака, ничего не уходит третьим лицам',
        },
        time: { es: '1–2 semanas', ru: '1–2 недели' },
        unit: 'once',
        launch: { eur: [1500, 3500], rub: [90000, 210000] },
        standard: { eur: [3000, 8000], rub: [180000, 480000] },
        launchRecurring: { eur: [90, 200], rub: [5400, 12000] },
        standardRecurring: { eur: [150, 400], rub: [9000, 24000] },
      },
      {
        code: 'IA-05',
        name: { es: 'Formación al equipo', ru: 'Обучение команды' },
        spec: {
          es: 'Cuatro horas prácticas con las herramientas de su día a día',
          ru: 'Четыре часа практики с их же рабочими инструментами',
        },
        time: { es: '1 sesión', ru: '1 сессия' },
        unit: 'once',
        launch: { eur: [200, 350], rub: [12000, 21000] },
        standard: { eur: [400, 700], rub: [24000, 42000] },
      },
    ],
  },
  {
    prefix: 'MNT',
    title: { es: 'Mantenimiento', ru: 'Обслуживание' },
    note: {
      es: 'El precio de tu plan no sube mientras sigas de alta.',
      ru: 'Цена вашего тарифа не растёт, пока действует подписка.',
    },
    items: [
      {
        code: 'MNT-01',
        name: { es: 'Basic', ru: 'Basic' },
        spec: {
          es: 'Alojamiento, copias, certificado, vigilancia de caídas',
          ru: 'Хостинг, бэкапы, сертификат, мониторинг доступности',
        },
        unit: 'month',
        launch: { eur: [25], rub: [1500] },
        standard: { eur: [49], rub: [2900] },
      },
      {
        code: 'MNT-02',
        name: { es: 'Pro', ru: 'Pro' },
        spec: {
          es: 'Todo Basic, más dos horas de cambios e informe mensual',
          ru: 'Всё из Basic плюс два часа правок и ежемесячный отчёт',
        },
        unit: 'month',
        launch: { eur: [55], rub: [3300] },
        standard: { eur: [99], rub: [5900] },
      },
      {
        code: 'MNT-03',
        name: { es: 'Business', ru: 'Business' },
        spec: {
          es: 'Cinco horas, SEO básico, respuesta en 24 horas',
          ru: 'Пять часов, базовое SEO, ответ в течение 24 часов',
        },
        unit: 'month',
        launch: { eur: [110], rub: [6600] },
        standard: { eur: [199], rub: [11900] },
      },
      {
        code: 'MNT-04',
        name: { es: 'Enterprise', ru: 'Enterprise' },
        spec: {
          es: 'Diez horas, acuerdo de servicio, respuesta el mismo día',
          ru: 'Десять часов, SLA, ответ в тот же день',
        },
        unit: 'month',
        launch: { eur: [190], rub: [11400] },
        standard: { eur: [349], rub: [20900] },
      },
    ],
  },
  {
    prefix: 'SEO',
    title: { es: 'Posicionamiento', ru: 'Продвижение' },
    note: {
      es: 'Trabajo medible: se entrega con las posiciones de partida y las de llegada.',
      ru: 'Измеримая работа: отчёт с позициями до и после.',
    },
    items: [
      {
        code: 'SEO-01',
        name: { es: 'Auditoría técnica', ru: 'Технический аудит' },
        spec: {
          es: 'Qué frena al sitio en Google y Yandex, priorizado',
          ru: 'Что мешает сайту в Google и Яндексе, по приоритету',
        },
        time: { es: '2–3 días', ru: '2–3 дня' },
        unit: 'once',
        launch: { eur: [120, 250], rub: [7200, 15000] },
        standard: { eur: [300, 600], rub: [18000, 36000] },
      },
      {
        code: 'SEO-02',
        name: { es: 'Optimización de páginas', ru: 'Оптимизация страниц' },
        spec: {
          es: 'Hasta veinte URLs: títulos, textos, enlaces internos, datos estructurados',
          ru: 'До двадцати URL: заголовки, тексты, перелинковка, микроразметка',
        },
        time: { es: '3–5 días', ru: '3–5 дней' },
        unit: 'once',
        launch: { eur: [250, 500], rub: [15000, 30000] },
        standard: { eur: [600, 1200], rub: [36000, 72000] },
      },
      {
        code: 'SEO-03',
        name: { es: 'SEO multiidioma', ru: 'Многоязычное SEO' },
        spec: {
          es: 'Hreflang, sitemap por idioma, alta en Search Console y Yandex',
          ru: 'Hreflang, карта сайта по языкам, Search Console и Яндекс.Вебмастер',
        },
        time: { es: '4–6 días', ru: '4–6 дней' },
        unit: 'once',
        launch: { eur: [350, 700], rub: [21000, 42000] },
        standard: { eur: [800, 1800], rub: [48000, 108000] },
      },
      {
        code: 'SEO-04',
        name: { es: 'SEO local', ru: 'Локальное SEO' },
        spec: {
          es: 'Ficha de Google, mapas, reseñas, aparecer en tu ciudad',
          ru: 'Карточка Google, карты, отзывы, видимость в своём городе',
        },
        time: { es: '2–4 días', ru: '2–4 дня' },
        unit: 'once',
        launch: { eur: [150, 350], rub: [9000, 21000] },
        standard: { eur: [400, 800], rub: [24000, 48000] },
      },
      {
        code: 'SEO-05',
        name: { es: 'Acompañamiento mensual', ru: 'Ежемесячное ведение' },
        spec: {
          es: 'Contenido, enlaces y ajustes continuos con informe',
          ru: 'Контент, ссылки и постоянные правки с отчётом',
        },
        unit: 'month',
        launch: { eur: [180, 400], rub: [11000, 24000] },
        standard: { eur: [400, 900], rub: [24000, 54000] },
      },
    ],
  },
];

export interface Bundle {
  code: string;
  name: Bilingual;
  includes: { es: string[]; ru: string[] };
  launch: Money;
  standard: Money;
}

export const bundles: Bundle[] = [
  {
    code: 'PACK-01',
    name: { es: 'Arranque', ru: 'Старт' },
    includes: {
      es: ['Landing page', 'Ficha de Google', 'Tres meses de mantenimiento'],
      ru: ['Лендинг', 'Карточка Google', 'Три месяца обслуживания'],
    },
    launch: { eur: [450], rub: [27000] },
    standard: { eur: [990], rub: [59000] },
  },
  {
    code: 'PACK-02',
    name: { es: 'Negocio conectado', ru: 'Связанный бизнес' },
    includes: {
      es: ['Web de cinco páginas', 'SEO base', 'Asistente para clientes'],
      ru: ['Сайт из пяти страниц', 'Базовое SEO', 'Ассистент для клиентов'],
    },
    launch: { eur: [1400], rub: [84000] },
    standard: { eur: [2900], rub: [174000] },
  },
  {
    code: 'PACK-03',
    name: { es: 'Salto a la IA', ru: 'Переход на ИИ' },
    includes: {
      es: ['Auditoría de procesos', 'Dos automatizaciones', 'Formación al equipo'],
      ru: ['Аудит процессов', 'Две автоматизации', 'Обучение команды'],
    },
    launch: { eur: [1500], rub: [90000] },
    standard: { eur: [3500], rub: [210000] },
  },
];
