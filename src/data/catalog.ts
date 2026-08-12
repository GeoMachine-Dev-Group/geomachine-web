/**
 * CATÁLOGO GEOMACHINE — fuente única de precios. v2 (4 idiomas, 3 monedas)
 *
 * Cambios respecto al catalog.ts original:
 *   - Idiomas: se añaden inglés (en) y georgiano (ka), junto a es/ru.
 *   - Monedas: se añade lari georgiano (gel), junto a eur/rub.
 *   - Orden de servicios actualizado (ver notas por categoría).
 *   - Nuevo campo `human`: explicación en lenguaje llano orientada a venta,
 *     mostrada al interactuar con la tarjeta (hover/focus).
 *   - Nueva categoría SYS (Sistemas y Backend) y paquetes PACK-04/05/06.
 *
 * ⚠️ IMPORTANTE — revisión pendiente antes de publicar:
 *   El georgiano (ka) lo ha traducido Claude. Para una web de negocio real,
 *   recomiendo que alguien con georgiano nativo lo revise antes de publicar
 *   — sobre todo los textos de precios y condiciones, donde un matiz mal
 *   traducido puede generar un malentendido comercial. El inglés y el ruso
 *   tienen menos riesgo, pero una relectura rápida nunca está de más.
 *
 * Lari georgiano (₾): igual que el rublo, NO es una conversión exacta del
 * euro. Se usa una tarifa de mercado redonda de 3,0 ₾/€ (el cambio real
 * ronda 1€ = 3,0–3,05₾ en agosto 2026), consistente en todo el catálogo.
 */

export type Tier = 'launch' | 'standard';
export type Currency = 'eur' | 'rub' | 'gel';
export type Unit = 'once' | 'month' | 'hour';
export type Lang = 'es' | 'ru' | 'en' | 'ka';

export const DEFAULT_TIER: Tier = 'launch';
export const DEFAULT_CURRENCY: Currency = 'eur';

/** Precio: [mínimo, máximo] o [exacto] si solo hay un número. */
type Range = [number] | [number, number];

interface Money {
  eur: Range;
  rub: Range;
  gel: Range;
}

interface Localized {
  es: string;
  ru: string;
  en: string;
  ka: string;
}

export interface Item {
  code: string;
  name: Localized;
  spec: Localized;
  time?: Localized;
  unit: Unit;
  /** Explicación en lenguaje llano, orientada a generar la venta. */
  human: Localized;
  launch: Money;
  standard: Money;
  /** Cuota recurrente opcional (servicios de IA con mantenimiento). */
  launchRecurring?: Money;
  standardRecurring?: Money;
}

export interface Line {
  prefix: string;
  title: Localized;
  note: Localized;
  items: Item[];
}

export const lines: Line[] = [
  {
    prefix: 'WEB',
    title: { es: 'Sitios web', ru: 'Сайты', en: 'Websites', ka: 'ვებგვერდები' },
    note: {
      es: 'Estáticos, sin CMS pesado. Cargan en menos de un segundo y no se rompen solos. Pasa el cursor por una tarjeta para ver qué significa en la práctica.',
      ru: 'Статические, без тяжёлой CMS. Загружаются меньше секунды и не ломаются сами. Наведите курсор на карточку, чтобы увидеть, что это значит на практике.',
      en: "Static, no heavy CMS. They load in under a second and don't break on their own. Hover a card to see what it means in practice.",
      ka: 'სტატიკური, მძიმე CMS-ის გარეშე. იტვირთება წამზე ნაკლებ დროში და თავისით არ იშლება. გადაატარეთ კურსორი ბარათზე პრაქტიკული მნიშვნელობის სანახავად.',
    },
    // Orden: Landing → Corporativa → Tienda online → Segundo idioma → Rediseño
    items: [
      {
        code: 'WEB-01',
        name: { es: 'Landing page', ru: 'Лендинг', en: 'Landing page', ka: 'ლენდინგ გვერდი' },
        spec: {
          es: 'Una página, formulario de contacto, analítica instalada',
          ru: 'Одна страница, форма обратной связи, аналитика',
          en: 'One page, contact form, analytics installed',
          ka: 'ერთი გვერდი, საკონტაქტო ფორმა, დაყენებული ანალიტიკა',
        },
        time: { es: '1–2 días', ru: '1–2 дня', en: '1–2 days', ka: '1–2 დღე' },
        unit: 'once',
        human: {
          es: 'Consigues una página lista en 1–2 días para captar contactos — así apareces en Google ya, no dentro de un mes, y dejas de perder al cliente que te busca hoy.',
          ru: 'Вы получаете готовую страницу за 1–2 дня для сбора заявок — попадаете в Google уже сейчас, а не через месяц, и не теряете клиента, который ищет вас сегодня.',
          en: "You get a page ready in 1–2 days to capture leads — so you show up on Google now, not in a month, and stop losing the customer looking for you today.",
          ka: 'იღებთ მზა გვერდს 1–2 დღეში კონტაქტების მისაღებად — Google-ში ჩნდებით ახლავე და აღარ კარგავთ დღეს თქვენს მაძებნელ კლიენტს.',
        },
        launch: { eur: [250, 400], rub: [15000, 25000], gel: [750, 1200] },
        standard: { eur: [500, 900], rub: [30000, 55000], gel: [1500, 2700] },
      },
      {
        code: 'WEB-02',
        name: { es: 'Web corporativa', ru: 'Корпоративный сайт', en: 'Corporate website', ka: 'კორპორატიული საიტი' },
        spec: {
          es: 'Cinco páginas, blog, SEO base, textos revisados',
          ru: 'Пять страниц, блог, базовое SEO, проверенные тексты',
          en: 'Five pages, blog, base SEO, reviewed copy',
          ka: 'ხუთი გვერდი, ბლოგი, საბაზისო SEO, გადამოწმებული ტექსტები',
        },
        time: { es: '3–5 días', ru: '3–5 дней', en: '3–5 days', ka: '3–5 დღე' },
        unit: 'once',
        human: {
          es: 'Consigues tu negocio explicado en varias páginas, con blog y SEO base — así cuando alguien te busca y no te encuentra, ya no elige a otro.',
          ru: 'Вы получаете бизнес, объяснённый на нескольких страницах, с блогом и базовым SEO — так что вас находят, а не выбирают конкурента.',
          en: "You get your business explained across several pages, with a blog and base SEO — so when someone searches for you and can't find you, they no longer pick someone else.",
          ka: 'იღებთ თქვენი ბიზნესის აღწერას რამდენიმე გვერდზე, ბლოგით და საბაზისო SEO-თი — ასე აღარ კარგავთ კლიენტს, ვინც ვერ გპოულობთ.',
        },
        launch: { eur: [550, 900], rub: [35000, 60000], gel: [1650, 2700] },
        standard: { eur: [1200, 2500], rub: [70000, 140000], gel: [3600, 7500] },
      },
      {
        code: 'WEB-03',
        name: { es: 'Tienda online', ru: 'Интернет-магазин', en: 'Online store', ka: 'ონლაინ მაღაზია' },
        spec: {
          es: 'Catálogo, pagos, panel para gestionar pedidos sin tocar código',
          ru: 'Каталог, оплата, панель управления заказами без программирования',
          en: 'Catalog, payments, order-management panel, no coding required',
          ka: 'კატალოგი, გადახდები, შეკვეთების მართვის პანელი კოდის გარეშე',
        },
        time: { es: '1–2 semanas', ru: '1–2 недели', en: '1–2 weeks', ka: '1–2 კვირა' },
        unit: 'once',
        human: {
          es: 'Consigues una tienda que vende sola, de día y de noche — así dejas de perder ventas solo por estar cerrado.',
          ru: 'Вы получаете магазин, который продаёт сам, днём и ночью — так вы перестаёте терять продажи только потому, что закрыты.',
          en: "You get a store that sells on its own, day and night — so you stop losing sales just because you're closed.",
          ka: 'იღებთ მაღაზიას, რომელიც თავად ყიდის, დღედაღამ — ასე აღარ კარგავთ გაყიდვებს მხოლოდ დახურვის გამო.',
        },
        launch: { eur: [1200, 2200], rub: [80000, 140000], gel: [3600, 6600] },
        standard: { eur: [2500, 6000], rub: [150000, 350000], gel: [7500, 18000] },
      },
      {
        code: 'WEB-04',
        name: { es: 'Segundo idioma', ru: 'Второй язык', en: 'Second language', ka: 'მეორე ენა' },
        spec: {
          es: 'Rutas separadas, hreflang, traducción pensada para buscadores',
          ru: 'Отдельные маршруты, hreflang, перевод, рассчитанный на поисковики',
          en: 'Separate routes, hreflang, translation built for search engines',
          ka: 'ცალკე მარშრუტები, hreflang, საძიებო სისტემებისთვის მორგებული თარგმანი',
        },
        time: { es: '+1 día', ru: '+1 день', en: '+1 day', ka: '+1 დღე' },
        unit: 'once',
        human: {
          es: 'Consigues la misma web también en otro idioma — así duplicas tu mercado sin duplicar el trabajo.',
          ru: 'Вы получаете тот же сайт ещё на одном языке — так удваиваете рынок, не удваивая работу.',
          en: "You get the same site in another language too — so you double your market without doubling the work.",
          ka: 'იღებთ იმავე საიტს სხვა ენაზეც — ასე აორმაგებთ ბაზარს სამუშაოს გაორმაგების გარეშე.',
        },
        launch: { eur: [150, 250], rub: [10000, 15000], gel: [450, 750] },
        standard: { eur: [400, 900], rub: [25000, 55000], gel: [1200, 2700] },
      },
      {
        code: 'WEB-05',
        name: { es: 'Rediseño y migración', ru: 'Редизайн и миграция', en: 'Redesign and migration', ka: 'რედიზაინი და მიგრაცია' },
        spec: {
          es: 'Tu sitio actual, reconstruido rápido y sin perder posiciones',
          ru: 'Ваш текущий сайт, быстро пересобранный без потери позиций',
          en: 'Your current site, rebuilt fast without losing rankings',
          ka: 'თქვენი მიმდინარე საიტი, სწრაფად აღდგენილი პოზიციების დაკარგვის გარეშე',
        },
        time: { es: '2–4 días', ru: '2–4 дня', en: '2–4 days', ka: '2–4 დღე' },
        unit: 'once',
        human: {
          es: 'Consigues tu web renovada y más rápida sin perder lo ganado en Google — así una web anticuada deja de alejar clientes antes de que lean una línea.',
          ru: 'Вы получаете обновлённый и более быстрый сайт, не теряя того, что уже заработано в Google.',
          en: "You get your site renewed and faster without losing what you've already earned on Google — so an outdated site stops turning customers away before they read a line.",
          ka: 'იღებთ განახლებულ და უფრო სწრაფ საიტს Google-ში მოპოვებულის დაკარგვის გარეშე.',
        },
        launch: { eur: [400, 800], rub: [25000, 50000], gel: [1200, 2400] },
        standard: { eur: [800, 2000], rub: [50000, 120000], gel: [2400, 6000] },
      },
    ],
  },
  {
    prefix: 'APP',
    title: { es: 'Aplicaciones', ru: 'Приложения', en: 'Applications', ka: 'აპლიკაციები' },
    note: {
      es: 'Software a medida cuando la hoja de cálculo se queda corta.',
      ru: 'Программное обеспечение под задачу, когда таблицы уже не хватает.',
      en: "Custom software for when a spreadsheet isn't enough anymore.",
      ka: 'მორგებული პროგრამული უზრუნველყოფა მაშინ, როცა ცხრილი აღარ კმარა.',
    },
    // Orden: MVP web → Arquitectura Backend → Bolsa de horas → PWA → Integraciones
    items: [
      {
        code: 'APP-01',
        name: { es: 'MVP web', ru: 'MVP веб', en: 'Web MVP', ka: 'MVP ვები' },
        spec: {
          es: 'Usuarios, base de datos, panel de gestión, versión funcional',
          ru: 'Пользователи, база данных, панель управления, рабочая версия',
          en: 'Users, database, management panel, working version',
          ka: 'მომხმარებლები, მონაცემთა ბაზა, მართვის პანელი, სამუშაო ვერსია',
        },
        time: { es: '2–4 semanas', ru: '2–4 недели', en: '2–4 weeks', ka: '2–4 კვირა' },
        unit: 'once',
        human: {
          es: 'Consigues una versión funcional real de tu idea — usuarios, datos, panel de gestión — así pasas de tener una idea a tener algo que la gente puede usar y pagar.',
          ru: 'Вы получаете реальную рабочую версию своей идеи — пользователей, данные, панель управления.',
          en: "You get a real, working version of your idea — users, data, a management panel — so you go from having an idea to having something people can use and pay for.",
          ka: 'იღებთ თქვენი იდეის რეალურ, სამუშაო ვერსიას — მომხმარებლებს, მონაცემებს, მართვის პანელს.',
        },
        launch: { eur: [1800, 4500], rub: [110000, 270000], gel: [5400, 13500] },
        standard: { eur: [4000, 12000], rub: [240000, 720000], gel: [12000, 36000] },
      },
      {
        code: 'APP-02',
        name: { es: 'Arquitectura Backend', ru: 'Архитектура бэкенда', en: 'Backend architecture', ka: 'ბექენდის არქიტექტურა' },
        spec: {
          es: 'Node.js, PostgreSQL, Redis, ecosistema escalable',
          ru: 'Node.js, PostgreSQL, Redis, масштабируемая экосистема',
          en: 'Node.js, PostgreSQL, Redis, scalable ecosystem',
          ka: 'Node.js, PostgreSQL, Redis, მასშტაბირებადი ეკოსისტემა',
        },
        time: { es: '3–5 semanas', ru: '3–5 недель', en: '3–5 weeks', ka: '3–5 კვირა' },
        unit: 'once',
        human: {
          es: 'Consigues un backend capaz de aguantar miles de usuarios a la vez — con matching de conductores por geolocalización en tiempo real (Redis geosearch, sin guardar el histórico de puntos GPS más de lo necesario) y bloqueo de concurrencia real a nivel de base de datos, para que dos peticiones simultáneas nunca generen un error de cobro duplicado. Así un pico de demanda no tumba lo que has construido.',
          ru: 'Вы получаете бэкенд, способный выдержать тысячи пользователей одновременно — с подбором водителей по геолокации в реальном времени (Redis geosearch, без хранения истории GPS-точек дольше необходимого) и реальной блокировкой параллелизма на уровне базы данных, чтобы два одновременных запроса никогда не привели к двойному списанию. Так пиковый спрос не обрушивает то, что вы построили.',
          en: "You get a backend capable of handling thousands of users at once — with driver matching by real-time geolocation (Redis geosearch, without storing GPS point history longer than necessary) and real concurrency locking at the database level, so two simultaneous requests never produce a duplicate charge. So a spike in demand doesn't bring down what you've built.",
          ka: 'იღებთ ბექენდს, რომელსაც ათასობით მომხმარებლის ერთდროულად დაძლევა შეუძლია — მძღოლების შერჩევით რეალურ დროში გეოლოკაციით (Redis geosearch, GPS წერტილების ისტორიის საჭიროზე მეტხანს შენახვის გარეშე) და მონაცემთა ბაზის დონეზე რეალური კონკურენტულობის ბლოკირებით, რათა ორმა ერთდროულმა მოთხოვნამ არასდროს გამოიწვიოს ორმაგი დათვლა. ასე მოთხოვნის პიკი არ ანგრევს აშენებულს.',
        },
        launch: { eur: [2500, 5500], rub: [150000, 330000], gel: [7500, 16500] },
        standard: { eur: [6000, 12000], rub: [360000, 720000], gel: [18000, 36000] },
      },
      {
        code: 'APP-03',
        name: { es: 'Bolsa de horas', ru: 'Пакет часов', en: 'Hours bundle', ka: 'საათების პაკეტი' },
        spec: {
          es: 'Desarrollo suelto, mínimo diez horas, sin caducidad',
          ru: 'Свободная разработка, минимум десять часов, без срока действия',
          en: 'Loose development, ten-hour minimum, no expiry',
          ka: 'თავისუფალი დეველოპმენტი, მინიმუმ ათი საათი, ვადის გარეშე',
        },
        unit: 'hour',
        human: {
          es: 'Compras un bloque de horas (mínimo diez) que no caducan nunca, y se descuentan por el tiempo real que dedico a cada petición, no por tarea completa redondeada al alza — así sabes exactamente en qué se gasta cada hora. Se entrega un registro de tiempos exacto de cada microtarea, incluido en el informe mensual.',
          ru: 'Вы покупаете блок часов (минимум десять), которые никогда не сгорают, и списываются по фактически потраченному времени на каждую задачу, а не округляются в большую сторону — вы точно знаете, на что уходит каждый час. Предоставляется точный учёт времени по каждой микрозадаче, включённый в ежемесячный отчёт.',
          en: "You buy a block of hours (ten minimum) that never expire, deducted by the actual time spent on each request, not rounded up per task — so you know exactly where every hour goes. You get an exact time log for every micro-task, included in the monthly report.",
          ka: 'ყიდულობთ საათების პაკეტს (მინიმუმ ათი), რომელიც არასდროს იწურება და იჭრება თითოეულ მოთხოვნაზე დახარჯული რეალური დროის მიხედვით, არა დამრგვალებული ამოცანით — ზუსტად იცით, სად იხარჯება ყოველი საათი. მოწოდებულია ზუსტი დროის აღრიცხვა თითოეულ მიკროამოცანაზე, შეტანილი ყოველთვიურ ანგარიშში.',
        },
        launch: { eur: [22, 30], rub: [1300, 1800], gel: [66, 90] },
        standard: { eur: [35, 60], rub: [2100, 3600], gel: [105, 180] },
      },
      {
        code: 'APP-04',
        name: { es: 'PWA', ru: 'PWA', en: 'PWA', ka: 'PWA' },
        spec: {
          es: 'Se instala en el móvil, funciona sin conexión, envía avisos',
          ru: 'Устанавливается на телефон, работает без интернета, отправляет уведомления',
          en: 'Installs on mobile, works offline, sends notifications',
          ka: 'იდგმება მობილურზე, მუშაობს ინტერნეტის გარეშეც, აგზავნის შეტყობინებებს',
        },
        time: { es: '1–2 semanas', ru: '1–2 недели', en: '1–2 weeks', ka: '1–2 კვირა' },
        unit: 'once',
        human: {
          es: 'Consigues una app que tus clientes instalan como cualquier otra, sin pasar por Apple ni Google — así no dependes de las tiendas para llegar a ellos.',
          ru: 'Вы получаете приложение, которое клиенты устанавливают как обычное, без App Store и Google Play.',
          en: "You get an app your customers install like any other, without going through Apple or Google — so you don't depend on app stores to reach them.",
          ka: 'იღებთ აპლიკაციას, რომელსაც კლიენტები აყენებენ ჩვეულებრივად, Apple-ისა და Google-ის მაღაზიების გარეშე.',
        },
        launch: { eur: [1200, 2800], rub: [72000, 168000], gel: [3600, 8400] },
        standard: { eur: [3000, 8000], rub: [180000, 480000], gel: [9000, 24000] },
      },
      {
        code: 'APP-05',
        name: { es: 'Integraciones', ru: 'Интеграции', en: 'Integrations', ka: 'ინტეგრაციები' },
        spec: {
          es: 'Conectar CRM, pagos, reservas o el sistema que ya usas',
          ru: 'Подключение CRM, платежей, бронирований или уже используемой системы',
          en: 'Connect CRM, payments, bookings, or the system you already use',
          ka: 'CRM-ის, გადახდების, ჯავშნების ან უკვე არსებული სისტემის დაკავშირება',
        },
        time: { es: '1–3 días', ru: '1–3 дня', en: '1–3 days', ka: '1–3 დღე' },
        unit: 'once',
        human: {
          es: 'Consigues que tus herramientas hablen entre sí — cobros, reservas, CRM — así dejas de perder horas copiando datos a mano.',
          ru: 'Вы получаете инструменты, которые общаются между собой — платежи, бронирования, CRM.',
          en: "You get your tools talking to each other — payments, bookings, CRM — so you stop wasting hours copying data by hand.",
          ka: 'იღებთ იმას, რომ თქვენი ხელსაწყოები ერთმანეთს ესაუბრებიან — გადახდები, ჯავშნები, CRM.',
        },
        launch: { eur: [350, 1200], rub: [21000, 72000], gel: [1050, 3600] },
        standard: { eur: [800, 3000], rub: [48000, 180000], gel: [2400, 9000] },
      },
    ],
  },
  {
    prefix: 'IA',
    title: { es: 'Inteligencia artificial', ru: 'Искусственный интеллект', en: 'Artificial intelligence', ka: 'ხელოვნური ინტელექტი' },
    note: {
      es: 'Incluida la opción local: el modelo corre en el servidor del cliente y sus datos no salen de la empresa.',
      ru: 'Включая локальный вариант: модель работает на сервере клиента, и данные не покидают компанию.',
      en: "Including the local option: the model runs on the client's own server and its data never leaves the company.",
      ka: 'მათ შორის ლოკალური ვარიანტი: მოდელი მუშაობს კლიენტის სერვერზე და მისი მონაცემები კომპანიიდან არ გადის.',
    },
    items: [
      {
        code: 'IA-01',
        name: { es: 'Auditoría de procesos', ru: 'Аудит процессов', en: 'Process audit', ka: 'პროცესების აუდიტი' },
        spec: {
          es: 'Dónde se pierde tiempo y qué se puede automatizar, por escrito',
          ru: 'Где теряется время и что можно автоматизировать, письменно',
          en: 'Where time is lost and what can be automated, in writing',
          ka: 'სად იკარგება დრო და რისი ავტომატიზირება შეიძლება, წერილობით',
        },
        time: { es: '2–3 días', ru: '2–3 дня', en: '2–3 days', ka: '2–3 დღე' },
        unit: 'once',
        human: {
          es: 'Consigues un informe claro de qué automatizar primero — así dejas de perder tiempo en tareas que ya podrían hacerse solas.',
          ru: 'Вы получаете чёткий отчёт о том, что стоит автоматизировать в первую очередь.',
          en: "You get a clear report on what's worth automating first — so you stop wasting time on tasks that could already run themselves.",
          ka: 'იღებთ ნათელ ანგარიშს, რისი ავტომატიზირება ღირს პირველ რიგში.',
        },
        launch: { eur: [150, 300], rub: [9000, 18000], gel: [450, 900] },
        standard: { eur: [400, 800], rub: [24000, 48000], gel: [1200, 2400] },
      },
      {
        code: 'IA-02',
        name: { es: 'Asistente para clientes', ru: 'Ассистент для клиентов', en: 'Customer assistant', ka: 'ასისტენტი კლიენტებისთვის' },
        spec: {
          es: 'Responde en la web y en WhatsApp con los datos reales del negocio',
          ru: 'Отвечает на сайте и в WhatsApp с реальными данными бизнеса',
          en: "Answers on the website and WhatsApp using your business's real data",
          ka: 'პასუხობს საიტზე და WhatsApp-ში ბიზნესის რეალური მონაცემებით',
        },
        time: { es: '3–6 días', ru: '3–6 дней', en: '3–6 days', ka: '3–6 დღე' },
        unit: 'once',
        human: {
          es: 'Consigues un asistente que responde en la web y WhatsApp con tus datos reales — así no pierdes al cliente que pregunta a las 11 de la noche.',
          ru: 'Вы получаете ассистента, который отвечает на сайте и в WhatsApp вашими реальными данными.',
          en: "You get an assistant that answers on the site and WhatsApp with your real data — so you don't lose the customer asking at 11pm.",
          ka: 'იღებთ ასისტენტს, რომელიც პასუხობს საიტზე და WhatsApp-ში თქვენი რეალური მონაცემებით.',
        },
        launch: { eur: [500, 1200], rub: [30000, 72000], gel: [1500, 3600] },
        standard: { eur: [1200, 3000], rub: [72000, 180000], gel: [3600, 9000] },
        launchRecurring: { eur: [35, 70], rub: [2100, 4200], gel: [105, 210] },
        standardRecurring: { eur: [60, 150], rub: [3600, 9000], gel: [180, 450] },
      },
      {
        code: 'IA-03',
        name: { es: 'Automatización de tareas', ru: 'Автоматизация задач', en: 'Task automation', ka: 'ამოცანების ავტომატიზაცია' },
        spec: {
          es: 'Presupuestos, correos e informes que se generan solos',
          ru: 'Сметы, письма и отчёты создаются сами',
          en: 'Quotes, emails and reports that generate themselves',
          ka: 'ხარჯთაღრიცხვები, წერილები და ანგარიშები, რომლებიც თავად იქმნება',
        },
        time: { es: '2–5 días', ru: '2–5 дней', en: '2–5 days', ka: '2–5 დღე' },
        unit: 'once',
        human: {
          es: 'Consigues que presupuestos, correos e informes se generen solos — así ese informe del lunes deja de robarte la mañana.',
          ru: 'Вы получаете сметы, письма и отчёты, которые формируются сами.',
          en: "You get quotes, emails and reports generated automatically — so that Monday report stops eating your morning.",
          ka: 'იღებთ იმას, რომ ხარჯთაღრიცხვები, წერილები და ანგარიშები თავად იქმნება.',
        },
        launch: { eur: [350, 900], rub: [21000, 54000], gel: [1050, 2700] },
        standard: { eur: [800, 2500], rub: [48000, 150000], gel: [2400, 7500] },
        launchRecurring: { eur: [30, 60], rub: [1800, 3600], gel: [90, 180] },
        standardRecurring: { eur: [50, 120], rub: [3000, 7200], gel: [150, 360] },
      },
      {
        code: 'IA-04',
        name: { es: 'IA privada en tu servidor', ru: 'Приватный ИИ на вашем сервере', en: 'Private AI on your server', ka: 'პირადი AI თქვენს სერვერზე' },
        spec: {
          es: 'Modelo propio, sin nube, sin enviar nada a terceros',
          ru: 'Собственная модель, без облака, без передачи третьим лицам',
          en: 'Your own model, no cloud, nothing sent to third parties',
          ka: 'საკუთარი მოდელი, ღრუბლის გარეშე, მესამე პირებთან გაზიარების გარეშე',
        },
        time: { es: '1–2 semanas', ru: '1–2 недели', en: '1–2 weeks', ka: '1–2 კვირა' },
        unit: 'once',
        human: {
          es: 'Consigues la misma potencia de IA corriendo en tu propio servidor — así los datos de tus clientes nunca salen de tu empresa.',
          ru: 'Вы получаете ту же мощность ИИ на собственном сервере.',
          en: "You get the same AI power running on your own server — so your customers' data never leaves your company.",
          ka: 'იღებთ იმავე ძალის AI-ს, თქვენს საკუთარ სერვერზე გაშვებულს.',
        },
        launch: { eur: [1500, 3500], rub: [90000, 210000], gel: [4500, 10500] },
        standard: { eur: [3000, 8000], rub: [180000, 480000], gel: [9000, 24000] },
        launchRecurring: { eur: [90, 200], rub: [5400, 12000], gel: [270, 600] },
        standardRecurring: { eur: [150, 400], rub: [9000, 24000], gel: [450, 1200] },
      },
      {
        code: 'IA-05',
        name: { es: 'Formación al equipo', ru: 'Обучение команды', en: 'Team training', ka: 'გუნდის მომზადება' },
        spec: {
          es: 'Cuatro horas prácticas con las herramientas de su día a día',
          ru: 'Четыре практических часа с инструментами повседневной работы',
          en: 'Four hands-on hours with the tools they use every day',
          ka: 'ოთხი პრაქტიკული საათი ყოველდღიური ხელსაწყოებით',
        },
        time: { es: '1 sesión', ru: '1 сессия', en: '1 session', ka: '1 სესია' },
        unit: 'once',
        human: {
          es: 'Consigues que tu equipo entero sepa usar estas herramientas, no solo tú — cuatro horas bastan para que dejen de tenerles miedo.',
          ru: 'Вы получаете команду, которая умеет пользоваться этими инструментами, а не только вы.',
          en: "You get your whole team knowing how to use these tools, not just you — four hours is enough for them to stop being afraid of it.",
          ka: 'იღებთ იმას, რომ მთელი გუნდი, არა მხოლოდ თქვენ, იცის ამ ხელსაწყოების გამოყენება.',
        },
        launch: { eur: [200, 350], rub: [12000, 21000], gel: [600, 1050] },
        standard: { eur: [400, 700], rub: [24000, 42000], gel: [1200, 2100] },
      },
    ],
  },
  {
    prefix: 'MNT',
    title: { es: 'Mantenimiento', ru: 'Обслуживание', en: 'Maintenance', ka: 'მოვლა' },
    note: {
      es: 'El precio de tu plan no sube mientras sigas de alta.',
      ru: 'Цена вашего плана не растёт, пока вы остаётесь клиентом.',
      en: "Your plan's price doesn't go up as long as you stay subscribed.",
      ka: 'თქვენი გეგმის ფასი არ იზრდება, სანამ აქტიური ხართ.',
    },
    items: [
      {
        code: 'MNT-01',
        name: { es: 'Basic', ru: 'Basic', en: 'Basic', ka: 'Basic' },
        spec: {
          es: 'Alojamiento, copias, certificado, vigilancia de caídas',
          ru: 'Хостинг, резервные копии, сертификат, мониторинг доступности',
          en: 'Hosting, backups, certificate, downtime monitoring',
          ka: 'ჰოსტინგი, სარეზერვო ასლები, სერტიფიკატი, გათიშვის მონიტორინგი',
        },
        unit: 'month',
        human: {
          es: 'Consigues tu web alojada y vigilada — así nunca se cae sin que nadie se entere hasta que sea tarde.',
          ru: 'Вы получаете размещённый и отслеживаемый сайт — так он никогда не упадёт незамеченным.',
          en: "You get your site hosted and monitored — so it never goes down without anyone noticing until it's too late.",
          ka: 'იღებთ საიტს განთავსებულს და მონიტორინგში.',
        },
        launch: { eur: [25], rub: [1500], gel: [75] },
        standard: { eur: [49], rub: [2900], gel: [147] },
      },
      {
        code: 'MNT-02',
        name: { es: 'Pro', ru: 'Pro', en: 'Pro', ka: 'Pro' },
        spec: {
          es: 'Todo Basic, más dos horas de cambios e informe mensual',
          ru: 'Всё из Basic плюс два часа правок и ежемесячный отчёт',
          en: 'Everything in Basic, plus two hours of changes and a monthly report',
          ka: 'ყველაფერი Basic-დან, პლუს თვეში ორი საათი ცვლილებებისთვის',
        },
        unit: 'month',
        human: {
          es: 'Consigues, además de la vigilancia, dos horas al mes de retoques — así no reabres un proyecto entero por cambiar una foto.',
          ru: 'Вы получаете, помимо мониторинга, два часа правок в месяц.',
          en: "You get, on top of monitoring, two hours a month of tweaks — so you don't reopen a whole project just to change a photo.",
          ka: 'იღებთ, მონიტორინგის გარდა, თვეში ორ საათს წვრილმან ცვლილებებზე.',
        },
        launch: { eur: [55], rub: [3300], gel: [165] },
        standard: { eur: [99], rub: [5900], gel: [297] },
      },
      {
        code: 'MNT-03',
        name: { es: 'Business', ru: 'Business', en: 'Business', ka: 'Business' },
        spec: {
          es: 'Cinco horas, SEO básico, respuesta en 24 horas',
          ru: 'Пять часов, базовое SEO, ответ в течение 24 часов',
          en: 'Five hours, basic SEO, 24-hour response',
          ka: 'ხუთი საათი, საბაზისო SEO, პასუხი 24 საათში',
        },
        unit: 'month',
        human: {
          es: 'Consigues respuesta en menos de 24 horas — así un fallo no te cuesta clientes mientras esperas una semana.',
          ru: 'Вы получаете ответ менее чем за 24 часа.',
          en: "You get a response in under 24 hours — so a glitch doesn't cost you customers while you wait a week.",
          ka: 'იღებთ პასუხს 24 საათზე ნაკლებში.',
        },
        launch: { eur: [110], rub: [6600], gel: [330] },
        standard: { eur: [199], rub: [11900], gel: [597] },
      },
      {
        code: 'MNT-04',
        name: { es: 'Enterprise', ru: 'Enterprise', en: 'Enterprise', ka: 'Enterprise' },
        spec: {
          es: 'Diez horas, acuerdo de servicio, respuesta el mismo día',
          ru: 'Десять часов, соглашение об уровне обслуживания, ответ в тот же день',
          en: 'Ten hours, service agreement, same-day response',
          ka: 'ათი საათი, მომსახურების ხელშეკრულება, პასუხი იმავე დღეს',
        },
        unit: 'month',
        human: {
          es: 'Consigues acuerdo de servicio por escrito y respuesta el mismo día — así tu web crítica nunca se queda esperando.',
          ru: 'Вы получаете письменное соглашение об обслуживании и ответ в тот же день.',
          en: "You get a written service agreement and same-day response — so your critical site is never left waiting.",
          ka: 'იღებთ წერილობით მომსახურების ხელშეკრულებას და პასუხს იმავე დღეს.',
        },
        launch: { eur: [190], rub: [11400], gel: [570] },
        standard: { eur: [349], rub: [20900], gel: [1047] },
      },
    ],
  },
  {
    prefix: 'SEO',
    title: { es: 'Posicionamiento', ru: 'Продвижение', en: 'Search positioning', ka: 'პოზიციონირება' },
    note: {
      es: 'Trabajo medible: se entrega con las posiciones de partida y las de llegada.',
      ru: 'Измеримая работа: сдаётся с начальными и итоговыми позициями.',
      en: 'Measurable work: delivered with starting and ending rankings.',
      ka: 'საზომი სამუშაო: მიწოდება ხდება საწყისი და საბოლოო პოზიციების მითითებით.',
    },
    // Orden: Auditoría técnica → Optimización de páginas → SEO local → SEO multiidioma → Acompañamiento
    items: [
      {
        code: 'SEO-01',
        name: { es: 'Auditoría técnica', ru: 'Технический аудит', en: 'Technical audit', ka: 'ტექნიკური აუდიტი' },
        spec: {
          es: 'Qué frena al sitio en Google y Yandex, priorizado',
          ru: 'Что тормозит сайт в Google и Яндексе, по приоритету',
          en: "What's holding the site back on Google and Yandex, prioritized",
          ka: 'რა აფერხებს საიტს Google-სა და Yandex-ში, პრიორიტეტების მიხედვით',
        },
        time: { es: '2–3 días', ru: '2–3 дня', en: '2–3 days', ka: '2–3 დღე' },
        unit: 'once',
        human: {
          es: 'Consigues saber, en orden de prioridad, qué te frena en Google y Yandex — así arreglas lo que ya tienes antes de gastar en anuncios.',
          ru: 'Вы получаете список приоритетов того, что тормозит вас в Google и Яндексе.',
          en: "You get to know, in priority order, what's holding you back on Google and Yandex — so you fix what you already have before spending on ads.",
          ka: 'იღებთ ცოდნას, პრიორიტეტების მიხედვით, რა გაფერხებთ ყველაზე მეტად.',
        },
        launch: { eur: [120, 250], rub: [7200, 15000], gel: [360, 750] },
        standard: { eur: [300, 600], rub: [18000, 36000], gel: [900, 1800] },
      },
      {
        code: 'SEO-02',
        name: { es: 'Optimización de páginas', ru: 'Оптимизация страниц', en: 'Page optimization', ka: 'გვერდების ოპტიმიზაცია' },
        spec: {
          es: 'Hasta veinte URLs: títulos, textos, enlaces internos, datos estructurados',
          ru: 'До двадцати URL: заголовки, тексты, внутренние ссылки, структурированные данные',
          en: 'Up to twenty URLs: titles, copy, internal links, structured data',
          ka: 'ოცამდე URL: სათაურები, ტექსტები, შიდა ბმულები, სტრუქტურირებული მონაცემები',
        },
        time: { es: '3–5 días', ru: '3–5 дней', en: '3–5 days', ka: '3–5 დღე' },
        unit: 'once',
        human: {
          es: 'Consigues hasta veinte páginas reescritas para que Google las entienda — sin tocar el diseño que ya te gusta.',
          ru: 'Вы получаете до двадцати переписанных страниц, понятных Google.',
          en: "You get up to twenty pages rewritten so Google understands them better — without touching the design you already like.",
          ka: 'იღებთ ოცამდე ხელახლა დაწერილ გვერდს, რომ Google-მა უკეთ გაიგოს.',
        },
        launch: { eur: [250, 500], rub: [15000, 30000], gel: [750, 1500] },
        standard: { eur: [600, 1200], rub: [36000, 72000], gel: [1800, 3600] },
      },
      {
        code: 'SEO-03',
        name: { es: 'SEO local', ru: 'Локальное SEO', en: 'Local SEO', ka: 'ლოკალური SEO' },
        spec: {
          es: 'Ficha de Google, mapas, reseñas, aparecer en tu ciudad',
          ru: 'Карточка Google, карты, отзывы, появление в вашем городе',
          en: 'Google listing, maps, reviews, showing up in your city',
          ka: 'Google-ის პროფილი, რუკები, შეფასებები, გამოჩენა თქვენს ქალაქში',
        },
        time: { es: '2–4 días', ru: '2–4 дня', en: '2–4 days', ka: '2–4 დღე' },
        unit: 'once',
        human: {
          es: 'Consigues tu ficha de Google Maps optimizada — así apareces tú, no tu competencia, cuando alguien busca "cerca de mí".',
          ru: 'Вы получаете оптимизированную карточку Google Карт — находят именно вас, а не конкурента.',
          en: 'You get your Google Maps listing optimized — so you show up, not your competitor, when someone searches "near me".',
          ka: 'იღებთ ოპტიმიზირებულ Google Maps პროფილს — თქვენ ჩნდებით, არა კონკურენტი.',
        },
        launch: { eur: [150, 350], rub: [9000, 21000], gel: [450, 1050] },
        standard: { eur: [400, 800], rub: [24000, 48000], gel: [1200, 2400] },
      },
      {
        code: 'SEO-04',
        name: { es: 'SEO multiidioma', ru: 'Многоязычное SEO', en: 'Multilingual SEO', ka: 'მრავალენოვანი SEO' },
        spec: {
          es: 'Hreflang, sitemap por idioma, alta en Search Console y Yandex',
          ru: 'Hreflang, карта сайта по языкам, регистрация в Search Console и Яндексе',
          en: 'Hreflang, per-language sitemap, listed on Search Console and Yandex',
          ka: 'Hreflang, ენების მიხედვით sitemap, რეგისტრაცია Search Console-სა და Yandex-ში',
        },
        time: { es: '4–6 días', ru: '4–6 дней', en: '4–6 days', ka: '4–6 დღე' },
        unit: 'once',
        human: {
          es: 'Consigues que cada visitante caiga en la versión correcta de tu web según su idioma — automáticamente, sin que muevas un dedo.',
          ru: 'Вы получаете автоматический переход каждого посетителя на нужную языковую версию сайта.',
          en: 'You get every visitor landing on the right version of your site for their language — automatically, without lifting a finger.',
          ka: 'იღებთ იმას, რომ ყოველი ვიზიტორი ხვდება საიტის სწორ ენობრივ ვერსიაზე ავტომატურად.',
        },
        launch: { eur: [350, 700], rub: [21000, 42000], gel: [1050, 2100] },
        standard: { eur: [800, 1800], rub: [48000, 108000], gel: [2400, 5400] },
      },
      {
        code: 'SEO-05',
        name: { es: 'Acompañamiento mensual', ru: 'Ежемесячное сопровождение', en: 'Monthly follow-up', ka: 'ყოველთვიური თანხლება' },
        spec: {
          es: 'Contenido, enlaces y ajustes continuos con informe',
          ru: 'Постоянный контент, ссылки и правки с отчётом',
          en: 'Ongoing content, links and tweaks, with a report',
          ka: 'მუდმივი კონტენტი, ბმულები და კორექტირება, ანგარიშით',
        },
        unit: 'month',
        human: {
          es: 'Consigues contenido y enlaces trabajados mes a mes — así sigues subiendo en vez de estancarte a la tercera semana.',
          ru: 'Вы получаете работу над контентом и ссылками месяц за месяцем.',
          en: 'You get content and links worked on month after month — so you keep climbing instead of stalling in week three.',
          ka: 'იღებთ კონტენტსა და ბმულებზე მუშაობას თვიდან თვემდე.',
        },
        launch: { eur: [180, 400], rub: [11000, 24000], gel: [540, 1200] },
        standard: { eur: [400, 900], rub: [24000, 54000], gel: [1200, 2700] },
      },
    ],
  },
  {
    prefix: 'SYS',
    title: { es: 'Sistemas y Backend', ru: 'Системы и бэкенд', en: 'Systems & Backend', ka: 'სისტემები და ბექენდი' },
    note: {
      es: 'Los cimientos invisibles. Infraestructura robusta y arquitecturas preparadas para escalar sin romperse.',
      ru: 'Невидимый фундамент. Надёжная инфраструктура, готовая расти без поломок.',
      en: 'The invisible foundations. Robust infrastructure built to scale without breaking.',
      ka: 'უხილავი საძირკველი. მდგრადი ინფრასტრუქტურა, მზად გაფართოებისთვის ჩავარდნის გარეშე.',
    },
    items: [
      {
        code: 'SYS-02',
        name: { es: 'Infraestructura Linux', ru: 'Инфраструктура Linux', en: 'Linux infrastructure', ka: 'Linux ინფრასტრუქტურა' },
        spec: {
          es: 'Despliegue local, optimización de hardware y SO',
          ru: 'Локальное развёртывание, оптимизация железа и ОС',
          en: 'Local deployment, hardware and OS optimization',
          ka: 'ლოკალური განთავსება, ტექნიკისა და ოპერაციული სისტემის ოპტიმიზაცია',
        },
        time: { es: '1–2 semanas', ru: '1–2 недели', en: '1–2 weeks', ka: '1–2 კვირა' },
        unit: 'once',
        human: {
          es: 'Consigues tu equipo o servidor optimizado para lo que necesitas — desde ir más rápido hasta correr tu propia IA sin depender de la nube.',
          ru: 'Вы получаете оптимизированный под ваши задачи компьютер или сервер.',
          en: 'You get your machine or server optimized for what you need — from running faster to hosting your own AI without depending on the cloud.',
          ka: 'იღებთ თქვენი კომპიუტერის ან სერვერის ოპტიმიზაციას საჭიროებისამებრ.',
        },
        launch: { eur: [600, 1200], rub: [36000, 72000], gel: [1800, 3600] },
        standard: { eur: [1500, 3000], rub: [90000, 180000], gel: [4500, 9000] },
      },
      {
        code: 'SYS-03',
        name: { es: 'Auditoría de Hardware', ru: 'Аудит железа', en: 'Hardware audit', ka: 'ტექნიკის აუდიტი' },
        spec: {
          es: 'Selección de componentes para flujos pesados',
          ru: 'Подбор компонентов для тяжёлых нагрузок',
          en: 'Component selection for heavy workloads',
          ka: 'კომპონენტების შერჩევა მძიმე დატვირთვისთვის',
        },
        time: { es: '2–4 días', ru: '2–4 дня', en: '2–4 days', ka: '2–4 დღე' },
        unit: 'once',
        human: {
          es: 'Consigues saber qué piezas valen la pena antes de gastarte el dinero — así no pagas de más por specs que no vas a usar.',
          ru: 'Вы получаете понимание, какие детали действительно стоят денег.',
          en: "You get to know which parts are actually worth it before spending the money — no overpaying for specs you'll never use.",
          ka: 'იღებთ ცოდნას, რომელი ნაწილები ღირს ფულის დახარჯვამდე.',
        },
        launch: { eur: [150, 300], rub: [9000, 18000], gel: [450, 900] },
        standard: { eur: [350, 600], rub: [21000, 36000], gel: [1050, 1800] },
      },
    ],
  },
];

export interface Bundle {
  code: string;
  name: Localized;
  time?: Localized;
  includes: { es: string[]; ru: string[]; en: string[]; ka: string[] };
  human: Localized;
  launch: Money;
  standard: Money;
}

export const bundles: Bundle[] = [
  {
    code: 'PACK-01',
    name: { es: 'Arranque', ru: 'Старт', en: 'Kickoff', ka: 'დაწყება' },
    time: { es: '3–5 días', ru: '3–5 дней', en: '3–5 days', ka: '3–5 დღე' },
    includes: {
      es: ['Landing page', 'Ficha de Google', 'Tres meses de mantenimiento'],
      ru: ['Лендинг', 'Карточка Google', 'Три месяца обслуживания'],
      en: ['Landing page', 'Google listing', 'Three months of maintenance'],
      ka: ['ლენდინგ გვერდი', 'Google პროფილი', 'სამი თვის მოვლა'],
    },
    human: {
      es: 'Consigues web, ficha de Google y tres meses de mantenimiento en un solo paquete — así empiezas a aparecer en internet esta misma semana.',
      ru: 'Вы получаете сайт, карточку Google и три месяца обслуживания в одном пакете.',
      en: 'You get a site, your Google listing and three months of maintenance in one package — so you start showing up online this very week.',
      ka: 'იღებთ საიტს, Google პროფილს და სამი თვის მოვლას ერთ პაკეტში.',
    },
    launch: { eur: [450], rub: [27000], gel: [1350] },
    standard: { eur: [990], rub: [59000], gel: [2970] },
  },
  {
    code: 'PACK-02',
    name: { es: 'Negocio conectado', ru: 'Связанный бизнес', en: 'Connected business', ka: 'დაკავშირებული ბიზნესი' },
    time: { es: '5–8 días', ru: '5–8 дней', en: '5–8 days', ka: '5–8 დღე' },
    includes: {
      es: ['Web de cinco páginas', 'SEO base', 'Asistente para clientes'],
      ru: ['Сайт из пяти страниц', 'Базовое SEO', 'Ассистент для клиентов'],
      en: ['Five-page website', 'Base SEO', 'Customer assistant'],
      ka: ['ხუთგვერდიანი საიტი', 'საბაზისო SEO', 'ასისტენტი კლიენტებისთვის'],
    },
    human: {
      es: 'Consigues web completa más un asistente que responde solo — así dejas de no dar abasto con los mensajes.',
      ru: 'Вы получаете полноценный сайт плюс ассистента, который отвечает сам.',
      en: 'You get a complete site plus an assistant that answers on its own — so you stop falling behind on messages.',
      ka: 'იღებთ სრულ საიტს პლუს ასისტენტს, რომელიც თავად პასუხობს.',
    },
    launch: { eur: [1400], rub: [84000], gel: [4200] },
    standard: { eur: [2900], rub: [174000], gel: [8700] },
  },
  {
    code: 'PACK-03',
    name: { es: 'Salto a la IA', ru: 'Переход на ИИ', en: 'Leap into AI', ka: 'ნახტომი AI-ში' },
    time: { es: '5–8 días', ru: '5–8 дней', en: '5–8 days', ka: '5–8 დღე' },
    includes: {
      es: ['Auditoría de procesos', 'Dos automatizaciones', 'Formación al equipo'],
      ru: ['Аудит процессов', 'Две автоматизации', 'Обучение команды'],
      en: ['Process audit', 'Two automations', 'Team training'],
      ka: ['პროცესების აუდიტი', 'ორი ავტომატიზაცია', 'გუნდის მომზადება'],
    },
    human: {
      es: 'Consigues auditoría, automatizaciones y formación en un solo paso — así dejas de decir "algún día miro esto de la IA".',
      ru: 'Вы получаете аудит, автоматизации и обучение за один шаг.',
      en: 'You get an audit, automations and training in one step — so you stop saying "I\'ll look into AI someday".',
      ka: 'იღებთ აუდიტს, ავტომატიზაციებს და მომზადებას ერთ ნაბიჯში.',
    },
    launch: { eur: [1500], rub: [90000], gel: [4500] },
    standard: { eur: [3500], rub: [210000], gel: [10500] },
  },
  {
    code: 'PACK-04',
    name: { es: 'MVP App de Transporte', ru: 'MVP приложения такси', en: 'Transport app MVP', ka: 'ტრანსპორტის აპის MVP' },
    time: { es: '3–5 semanas', ru: '3–5 недель', en: '3–5 weeks', ka: '3–5 კვირა' },
    includes: {
      es: ['Backend a medida y base de datos', 'Gestión de reservas en tiempo real', 'Panel de administración de rutas'],
      ru: ['Индивидуальный бэкенд и база данных', 'Управление бронированиями в реальном времени', 'Панель администрирования маршрутов'],
      en: ['Custom backend and database', 'Real-time booking management', 'Route admin panel'],
      ka: ['მორგებული ბექენდი და მონაცემთა ბაზა', 'ჯავშნების მართვა რეალურ დროში', 'მარშრუტების ადმინ პანელი'],
    },
    human: {
      es: 'Consigues backend, reservas en tiempo real y panel de rutas — con la misma arquitectura que ya aplico en mi propio prototipo: asignación de conductores por proximidad real, y bloqueos de transacción (advisory locks) que garantizan que ninguna comisión se calcule dos veces por accidente. El punto de partida serio para tu propia app de transporte, no un prototipo de juguete.',
      ru: 'Вы получаете бэкенд, бронирования в реальном времени и панель маршрутов — с той же архитектурой, что я уже применяю в собственном прототипе: назначение водителей по реальной близости и блокировки транзакций (advisory locks), которые гарантируют, что ни одна комиссия не будет случайно посчитана дважды. Серьёзная стартовая точка для вашего собственного транспортного приложения, а не игрушечный прототип.',
      en: 'You get a backend, real-time bookings and a route panel — with the same architecture I\'m already using in my own prototype: driver assignment by real proximity, and transaction locks (advisory locks) that guarantee no commission ever gets calculated twice by accident. A serious starting point for your own transport app, not a toy prototype.',
      ka: 'იღებთ ბექენდს, რეალურ დროში ჯავშნებს და მარშრუტების პანელს — იმავე არქიტექტურით, რომელსაც უკვე ვიყენებ საკუთარ პროტოტიპში: მძღოლების მინიჭება რეალური სიახლოვის მიხედვით და ტრანზაქციის ბლოკირებები (advisory locks), რომლებიც უზრუნველყოფენ, რომ კომისია არასდროს დაითვლება ორჯერ შემთხვევით. სერიოზული საწყისი წერტილი თქვენი ტრანსპორტის აპლიკაციისთვის, არა სათამაშო პროტოტიპი.',
    },
    launch: { eur: [3800], rub: [220000], gel: [11400] },
    standard: { eur: [8500], rub: [510000], gel: [25500] },
  },
  {
    code: 'PACK-05',
    name: { es: 'Tienda lista para vender', ru: 'Магазин, готовый к продажам', en: 'Store ready to sell', ka: 'მაღაზია გასაყიდად მზად' },
    time: { es: '1–2 semanas', ru: '1–2 недели', en: '1–2 weeks', ka: '1–2 კვირა' },
    includes: {
      es: ['Tienda online', 'SEO local', 'Mantenimiento Pro (3 meses)'],
      ru: ['Интернет-магазин', 'Локальное SEO', 'Обслуживание Pro (3 месяца)'],
      en: ['Online store', 'Local SEO', 'Pro maintenance (3 months)'],
      ka: ['ონლაინ მაღაზია', 'ლოკალური SEO', 'Pro მოვლა (3 თვე)'],
    },
    human: {
      es: 'Consigues tu tienda montada, encontrable en tu zona y con quien la vigile los primeros meses — así empiezas a vender sin estar pendiente de si algo se rompe.',
      ru: 'Вы получаете собранный магазин, заметный в вашем регионе, и того, кто присмотрит за ним первые месяцы.',
      en: 'You get your store built, findable in your area, and someone watching it for the first few months — so you start selling without worrying about what might break.',
      ka: 'იღებთ აშენებულ, თქვენს რეგიონში მოძებნად მაღაზიას და ვინმეს, ვინც პირველ თვეებში ადევნებს თვალს.',
    },
    launch: { eur: [1550], rub: [95000], gel: [4650] },
    standard: { eur: [3200], rub: [190000], gel: [9600] },
  },
  {
    code: 'PACK-06',
    name: { es: 'Migración sin sustos', ru: 'Миграция без сюрпризов', en: 'Migration without surprises', ka: 'მიგრაცია გაუთვალისწინებლობის გარეშე' },
    time: { es: '1–2 semanas', ru: '1–2 недели', en: '1–2 weeks', ka: '1–2 კვირა' },
    includes: {
      es: ['Rediseño y migración', 'SEO multiidioma', 'Mantenimiento Business (3 meses)'],
      ru: ['Редизайн и миграция', 'Многоязычное SEO', 'Обслуживание Business (3 месяца)'],
      en: ['Redesign and migration', 'Multilingual SEO', 'Business maintenance (3 months)'],
      ka: ['რედიზაინი და მიგრაცია', 'მრავალენოვანი SEO', 'Business მოვლა (3 თვე)'],
    },
    human: {
      es: 'Consigues tu web renovada, con SEO técnico revisado y tres meses de vigilancia incluidos — así cambias de sitio sin arriesgarte a perder lo que ya tienes ganado.',
      ru: 'Вы получаете обновлённый сайт с проверенным техническим SEO и тремя месяцами мониторинга.',
      en: "You get your site renewed, with technical SEO reviewed and three months of monitoring included — so you switch sites without risking what you've already earned.",
      ka: 'იღებთ განახლებულ საიტს, გადამოწმებული ტექნიკური SEO-თი და სამი თვის მონიტორინგით.',
    },
    launch: { eur: [1050], rub: [63000], gel: [3150] },
    standard: { eur: [2400], rub: [144000], gel: [7200] },
  },
];
