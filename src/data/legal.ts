/**
 * Textos legales (aviso legal, privacidad, cookies) — fuente única.
 *
 * Idiomas: es, ru y en. El georgiano NO tiene versión propia: el `ka` del sitio
 * va traducido por IA sin revisión nativa, y un texto legal mal traducido es
 * peor que ninguno. Las páginas `ka` enlazan a la versión inglesa (legalPath).
 * En todas las versiones consta que, en caso de discrepancia, prevalece la
 * española.
 *
 * Datos del titular: los que faltan van como `TODO:` y el build avisa por
 * consola mientras quede alguno (ver el final del fichero). No publicar la
 * rama con TODO pendientes: se verían tal cual en la página.
 *
 * Base para "sin banner de cookies" (verificado el 2026-09-29): el sitio no
 * pone cookies; solo guarda la moneda elegida en localStorage (`gm-currency`),
 * y Vercel Web Analytics / Speed Insights no usan cookies ni almacenamiento en
 * el navegador (documentación enlazada en la política de cookies; los scripts
 * servidos en geomachine.es no tocan document.cookie ni storage).
 */
import type { Lang } from '../i18n/ui';

export type LegalLang = 'es' | 'ru' | 'en';
export type LegalDoc = 'notice' | 'privacy' | 'cookies';

/** Fecha de la versión vigente. Viaja con cada envío del formulario como
    prueba de qué texto aceptó quien escribe. Cambiarla al tocar los textos. */
export const LEGAL_VERSION = '2026-09-29';

export const HOLDER = {
  name: 'Romeo Mikava',
  trade: 'GeoMachine Developer Group',
  /** NIE, que para un autónomo extranjero hace de NIF (letra de control verificada). */
  nif: 'Z2497033C',
  address: 'Calle Romero, 6, 28292 El Escorial (Madrid), España',
  email: 'hola@geomachine.es',
  site: 'geomachine.es',
  /** Buzón al que se reenvía hola@geomachine.es. Suiza tiene decisión de
      adecuación de la UE: no es una transferencia que requiera consentimiento. */
  mailProvider: 'Proton AG (Suiza)',
};

export const legalPaths: Record<LegalDoc, Record<LegalLang, string>> = {
  notice: { es: '/es/aviso-legal/', ru: '/ru/pravovaya-informatsiya/', en: '/en/legal-notice/' },
  privacy: { es: '/es/privacidad/', ru: '/ru/konfidentsialnost/', en: '/en/privacy/' },
  cookies: { es: '/es/cookies/', ru: '/ru/cookies/', en: '/en/cookies/' },
};

/** Idioma de los textos legales que ve cada idioma del sitio (ka → en). */
export function legalLangFor(lang: Lang): LegalLang {
  return lang === 'ka' ? 'en' : lang;
}

export function legalPath(doc: LegalDoc, lang: Lang): string {
  return legalPaths[doc][legalLangFor(lang)];
}

export interface LegalSection {
  h: string;
  /** Párrafos con HTML propio (enlaces, <strong>), nunca texto de usuarios. */
  p: string[];
}
export interface LegalText {
  title: string;
  description: string;
  updated: string;
  sections: LegalSection[];
}

const a = (href: string, text: string, ext = false) =>
  `<a href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''}>${text}</a>`;
const mail = a(`mailto:${HOLDER.email}`, HOLDER.email);
const VA = 'https://vercel.com/docs/analytics/privacy-policy';
const VSI = 'https://vercel.com/docs/speed-insights/privacy-policy';
const VDPA = 'https://vercel.com/legal/dpa';
const VPRIV = 'https://vercel.com/legal/privacy-policy';
const TGPRIV = 'https://telegram.org/privacy';
const AEPD = 'https://www.aepd.es';

const idLines = {
  es: [
    `<strong>Titular:</strong> ${HOLDER.name}, persona física que ejerce como trabajador autónomo.`,
    `<strong>Nombre comercial:</strong> ${HOLDER.trade}.`,
    `<strong>NIF:</strong> ${HOLDER.nif}.`,
    `<strong>Domicilio:</strong> ${HOLDER.address}.`,
    `<strong>Email:</strong> ${mail}.`,
  ],
  ru: [
    `<strong>Владелец:</strong> ${HOLDER.name}, физическое лицо, зарегистрированное в Испании как индивидуальный предприниматель (autónomo).`,
    `<strong>Коммерческое название:</strong> ${HOLDER.trade}.`,
    `<strong>NIF (налоговый номер):</strong> ${HOLDER.nif}.`,
    `<strong>Адрес:</strong> ${HOLDER.address}.`,
    `<strong>Email:</strong> ${mail}.`,
  ],
  en: [
    `<strong>Owner:</strong> ${HOLDER.name}, an individual registered in Spain as a self-employed professional (autónomo).`,
    `<strong>Trade name:</strong> ${HOLDER.trade}.`,
    `<strong>Tax ID (NIF):</strong> ${HOLDER.nif}.`,
    `<strong>Address:</strong> ${HOLDER.address}.`,
    `<strong>Email:</strong> ${mail}.`,
  ],
};

const prevails = {
  es: 'Este texto existe también en ruso e inglés. En caso de discrepancia entre versiones, prevalece la versión en español.',
  ru: 'Этот текст является переводом. В случае расхождений между версиями преимущественную силу имеет версия на испанском языке.',
  en: 'This text is a translation. In case of any discrepancy between versions, the Spanish version prevails.',
};

export const legal: Record<LegalDoc, Record<LegalLang, LegalText>> = {
  // ------------------------------------------------------------------ AVISO LEGAL
  notice: {
    es: {
      title: 'Aviso legal',
      description: 'Datos del titular de geomachine.es, condiciones de uso, propiedad intelectual y legislación aplicable.',
      updated: 'Última actualización: 29 de septiembre de 2026.',
      sections: [
        { h: 'Titular del sitio web', p: [
          'En cumplimiento del artículo 10 de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI), se informa de los datos del titular de geomachine.es:',
          ...idLines.es,
        ] },
        { h: 'Objeto', p: [
          'Este sitio presenta los servicios profesionales del titular: desarrollo de sitios web y aplicaciones, inteligencia artificial, mantenimiento, posicionamiento en buscadores (SEO) y sistemas.',
          'Los precios del catálogo son orientativos, se expresan como rangos o importes «desde» y no incluyen IVA. No constituyen una oferta vinculante: cada encargo se formaliza con un presupuesto cerrado por escrito que ambas partes aceptan.',
        ] },
        { h: 'Condiciones de uso', p: [
          'El acceso a este sitio es gratuito y no requiere registro. Quien lo visita se compromete a usarlo de forma lícita y a no dañar su funcionamiento ni el de los sistemas que lo alojan.',
        ] },
        { h: 'Propiedad intelectual e industrial', p: [
          'Los textos, el diseño, el código, el logotipo y el resto de contenidos propios de este sitio pertenecen al titular. No se permite reproducirlos, distribuirlos ni transformarlos sin su autorización, salvo citas breves con indicación de la fuente.',
          'Los nombres y marcas de terceros que aparecen en el sitio pertenecen a sus respectivos titulares y se citan solo para identificar proyectos o servicios.',
        ] },
        { h: 'Enlaces a otros sitios', p: [
          'El sitio enlaza a servicios de terceros (Telegram, WhatsApp, GitHub y otros). El titular no controla esos sitios ni responde de su contenido ni de sus políticas.',
        ] },
        { h: 'Responsabilidad', p: [
          'El titular procura que la información sea exacta y esté actualizada, pero no garantiza la ausencia de errores ni la disponibilidad continua del sitio, y no responde de los daños derivados de su uso salvo en los casos que la ley no permite excluir.',
        ] },
        { h: 'Idioma', p: [prevails.es] },
        { h: 'Legislación y jurisdicción', p: [
          'Este aviso se rige por la legislación española. Para cualquier controversia, si quien reclama tiene la condición de consumidor, serán competentes los juzgados y tribunales de su domicilio; en los demás casos, los del domicilio del titular.',
        ] },
      ],
    },
    ru: {
      title: 'Правовая информация',
      description: 'Сведения о владельце geomachine.es, условия использования, интеллектуальная собственность и применимое право.',
      updated: 'Последнее обновление: 29 сентября 2026 г.',
      sections: [
        { h: 'Владелец сайта', p: [
          'В соответствии со статьёй 10 испанского Закона 34/2002 об услугах информационного общества и электронной коммерции (LSSI) сообщаем сведения о владельце сайта geomachine.es:',
          ...idLines.ru,
        ] },
        { h: 'Назначение сайта', p: [
          'Сайт представляет профессиональные услуги владельца: разработку сайтов и приложений, искусственный интеллект, техническое обслуживание, поисковое продвижение (SEO) и системное администрирование.',
          'Цены в каталоге ориентировочные, указаны диапазоном или «от» и не включают НДС (IVA). Они не являются обязывающей офертой: каждый заказ оформляется письменной фиксированной сметой, которую принимают обе стороны.',
        ] },
        { h: 'Условия использования', p: [
          'Доступ к сайту бесплатный и не требует регистрации. Посетитель обязуется использовать сайт законным образом и не нарушать его работу и работу систем, на которых он размещён.',
        ] },
        { h: 'Интеллектуальная собственность', p: [
          'Тексты, дизайн, код, логотип и другие собственные материалы сайта принадлежат владельцу. Их воспроизведение, распространение и переработка без его разрешения запрещены, за исключением коротких цитат со ссылкой на источник.',
          'Названия и товарные знаки третьих лиц принадлежат их правообладателям и упоминаются только для обозначения проектов или услуг.',
        ] },
        { h: 'Ссылки на другие сайты', p: [
          'Сайт содержит ссылки на сервисы третьих лиц (Telegram, WhatsApp, GitHub и другие). Владелец не контролирует эти сайты и не отвечает за их содержание и политику.',
        ] },
        { h: 'Ответственность', p: [
          'Владелец стремится поддерживать информацию точной и актуальной, но не гарантирует отсутствие ошибок и непрерывную доступность сайта и не несёт ответственности за ущерб от его использования, кроме случаев, когда закон не допускает такого исключения.',
        ] },
        { h: 'Язык', p: [prevails.ru] },
        { h: 'Применимое право и подсудность', p: [
          'К настоящим условиям применяется законодательство Испании. Если спор возникает с потребителем, он рассматривается судами по месту его жительства; в остальных случаях — судами по месту нахождения владельца.',
        ] },
      ],
    },
    en: {
      title: 'Legal notice',
      description: 'Owner details for geomachine.es, terms of use, intellectual property and governing law.',
      updated: 'Last updated: 29 September 2026.',
      sections: [
        { h: 'Website owner', p: [
          'In accordance with Article 10 of Spanish Law 34/2002 on information society services and electronic commerce (LSSI), the owner of geomachine.es is:',
          ...idLines.en,
        ] },
        { h: 'Purpose', p: [
          'This website presents the owner’s professional services: website and application development, artificial intelligence, maintenance, search engine optimisation (SEO) and systems.',
          'Catalogue prices are indicative, shown as ranges or “from” amounts, and exclude VAT. They are not a binding offer: each project is agreed through a written fixed quote accepted by both parties.',
        ] },
        { h: 'Terms of use', p: [
          'Access to this website is free and requires no registration. Visitors agree to use it lawfully and not to interfere with its operation or with the systems that host it.',
        ] },
        { h: 'Intellectual property', p: [
          'The texts, design, code, logo and other original content of this website belong to the owner. They may not be reproduced, distributed or modified without permission, except for short quotations that cite the source.',
          'Third-party names and trademarks shown on the website belong to their respective owners and are used only to identify projects or services.',
        ] },
        { h: 'Links to other websites', p: [
          'The website links to third-party services (Telegram, WhatsApp, GitHub and others). The owner does not control those sites and is not responsible for their content or policies.',
        ] },
        { h: 'Liability', p: [
          'The owner makes every effort to keep the information accurate and up to date, but does not guarantee that it is error-free or that the website will always be available, and is not liable for damage arising from its use except where the law does not allow such exclusion.',
        ] },
        { h: 'Language', p: [prevails.en] },
        { h: 'Governing law and jurisdiction', p: [
          'This notice is governed by Spanish law. If a dispute involves a consumer, the courts of the consumer’s place of residence have jurisdiction; in all other cases, the courts of the owner’s place of business.',
        ] },
      ],
    },
  },

  // ------------------------------------------------------------------ PRIVACIDAD
  privacy: {
    es: {
      title: 'Política de privacidad',
      description: 'Qué datos trata geomachine.es, para qué, cuánto tiempo, a quién llegan (Telegram, Vercel) y cómo ejercer tus derechos.',
      updated: 'Última actualización: 29 de septiembre de 2026.',
      sections: [
        { h: 'Responsable del tratamiento', p: [
          ...idLines.es,
          'No hay delegado de protección de datos: para cualquier cuestión sobre tus datos, escribe al email anterior.',
        ] },
        { h: 'Qué datos se tratan', p: [
          '<strong>Formulario de contacto:</strong> nombre, el dato de contacto que elijas (email, usuario de Telegram o teléfono), el servicio que te interesa, el presupuesto orientativo si lo indicas y tu mensaje. Junto al envío se registran la fecha y la versión de esta política que aceptaste.',
          '<strong>Mensajes directos:</strong> lo que envíes si escribes por email, Telegram o WhatsApp.',
          '<strong>Datos técnicos:</strong> el proveedor de alojamiento registra, como cualquier servidor, la dirección IP y datos del navegador para servir la página y protegerla frente a abusos.',
          '<strong>Estadísticas:</strong> recuentos agregados y anónimos de visitas, sin cookies (ver la ' + a('/es/cookies/', 'política de cookies') + ').',
        ] },
        { h: 'Para qué y con qué base legal', p: [
          '<strong>Responder a tu consulta y preparar un presupuesto:</strong> tu consentimiento, que das al marcar la casilla del formulario (art. 6.1.a RGPD), y la aplicación de medidas precontractuales a tu petición (art. 6.1.b).',
          '<strong>Prestar el servicio si lo contratas y cumplir las obligaciones fiscales y contables:</strong> la ejecución del contrato (art. 6.1.b) y el cumplimiento de obligaciones legales (art. 6.1.c).',
          '<strong>Seguridad del sitio y filtrado de envíos automáticos:</strong> el interés legítimo en proteger el servicio (art. 6.1.f).',
          'No se toman decisiones automatizadas ni se elaboran perfiles, y tus datos no se usan para enviarte publicidad.',
        ] },
        { h: 'Cómo llega tu mensaje: Telegram, fuera de la UE', p: [
          '<strong>Telegram es el canal por el que recibo los mensajes del formulario.</strong> El formulario no guarda tus datos en ninguna base de datos de esta web: el servidor los reenvía al momento, mediante un bot, a mi cuenta de Telegram, y ahí se leen y se conservan.',
          'Telegram es un servicio de mensajería que opera <strong>fuera de la Unión Europea</strong>, en un país sin decisión de adecuación de la Comisión Europea, y no he firmado con él un contrato de encargo del tratamiento. Por eso la casilla del formulario pide tu consentimiento expreso para esta transferencia (art. 49.1.a RGPD), después de informarte de este riesgo. Política de Telegram: ' + a(TGPRIV, 'telegram.org/privacy', true) + '.',
          '<strong>Si prefieres que tus datos no pasen por Telegram, tienes alternativa:</strong> escríbeme directamente a ' + mail + ', o indica un email en el campo de contacto del formulario y te responderé por email. Ten en cuenta que el propio formulario siempre se entrega por Telegram; para evitarlo del todo, usa el email.',
        ] },
        { h: 'Otros destinatarios y proveedores', p: [
          '<strong>Vercel Inc.</strong> (Estados Unidos) aloja el sitio y ejecuta la función que envía el formulario, como encargado del tratamiento. Vercel aplica las cláusulas contractuales tipo de la Comisión Europea y otras garantías recogidas en su ' + a(VDPA, 'acuerdo de tratamiento de datos', true) + ' (' + a(VPRIV, 'política de privacidad de Vercel', true) + ').',
          '<strong>Correo electrónico:</strong> los emails a ' + HOLDER.email + ' se reciben por reenvío en un buzón de ' + HOLDER.mailProvider + ', país con decisión de adecuación de la Comisión Europea.',
          'Fuera de esto, tus datos no se ceden a terceros, salvo obligación legal.',
        ] },
        { h: 'Cuánto tiempo se conservan', p: [
          'Si no llegamos a contratar nada, borro la conversación y los datos del formulario <strong>12 meses después del último contacto</strong>, también en Telegram.',
          'Si contratas un servicio, los datos se conservan mientras dure la relación y, después, durante los plazos que exige la ley (por ejemplo, seis años para la documentación contable según el Código de Comercio, y los plazos de prescripción tributaria).',
          'Los registros técnicos del alojamiento se conservan durante el tiempo que fija el proveedor. Las estadísticas de visitas no identifican a nadie.',
        ] },
        { h: 'Tus derechos', p: [
          'Puedes pedir acceso a tus datos, su rectificación o supresión, oponerte al tratamiento, pedir su limitación o su portabilidad y <strong>retirar tu consentimiento en cualquier momento</strong>, sin que eso afecte a lo tratado antes. Escribe a ' + mail + ' indicando qué derecho ejerces; respondo en el plazo de un mes.',
          'Si crees que no se han respetado tus derechos, puedes reclamar ante la Agencia Española de Protección de Datos (' + a(AEPD, 'aepd.es', true) + ').',
        ] },
        { h: 'Menores de edad', p: [
          'Los servicios se dirigen a empresas y profesionales. Si tienes menos de 14 años, no envíes datos por el formulario.',
        ] },
        { h: 'Seguridad', p: [
          'La web se sirve siempre por HTTPS, el formulario solo recoge los datos necesarios y las credenciales del bot se guardan como variables de entorno del proveedor, fuera del código.',
        ] },
        { h: 'Cambios e idioma', p: [
          'Si esta política cambia, se actualizará la fecha de arriba; los envíos quedan registrados con la versión aceptada.',
          prevails.es,
        ] },
      ],
    },
    ru: {
      title: 'Политика конфиденциальности',
      description: 'Какие данные обрабатывает geomachine.es, зачем, как долго, кому они передаются (Telegram, Vercel) и как реализовать ваши права.',
      updated: 'Последнее обновление: 29 сентября 2026 г.',
      sections: [
        { h: 'Кто обрабатывает данные', p: [
          ...idLines.ru,
          'Специального инспектора по защите данных нет: по любым вопросам о ваших данных пишите на указанный email.',
        ] },
        { h: 'Какие данные обрабатываются', p: [
          '<strong>Форма обратной связи:</strong> имя, выбранный вами контакт (email, ник в Telegram или телефон), интересующая услуга, ориентировочный бюджет (если укажете) и сообщение. Вместе с заявкой фиксируются дата и версия этой политики, которую вы приняли.',
          '<strong>Прямые сообщения:</strong> то, что вы отправите по email, в Telegram или WhatsApp.',
          '<strong>Технические данные:</strong> хостинг-провайдер, как любой сервер, фиксирует IP-адрес и данные браузера, чтобы показать страницу и защитить её от злоупотреблений.',
          '<strong>Статистика:</strong> обезличенные суммарные данные о посещениях, без cookies (см. ' + a('/ru/cookies/', 'политику cookies') + ').',
        ] },
        { h: 'Цели и правовые основания', p: [
          '<strong>Ответ на ваш запрос и подготовка сметы:</strong> ваше согласие, которое вы даёте, отмечая флажок в форме (ст. 6.1.a GDPR), и преддоговорные действия по вашей просьбе (ст. 6.1.b).',
          '<strong>Оказание услуги, если вы её закажете, и налоговый и бухгалтерский учёт:</strong> исполнение договора (ст. 6.1.b) и выполнение требований закона (ст. 6.1.c).',
          '<strong>Безопасность сайта и отсев автоматических заявок:</strong> законный интерес в защите сервиса (ст. 6.1.f).',
          'Автоматизированные решения и профилирование не применяются, рекламные рассылки не отправляются.',
        ] },
        { h: 'Как доходит ваше сообщение: Telegram, за пределами ЕС', p: [
          '<strong>Telegram — это канал, через который я получаю сообщения из формы.</strong> Форма не сохраняет ваши данные в базе данных сайта: сервер сразу пересылает их через бота в мой аккаунт Telegram, где они читаются и хранятся.',
          'Telegram — мессенджер, работающий <strong>за пределами Европейского союза</strong>, в стране без решения Еврокомиссии об адекватном уровне защиты, и договора об обработке данных с ним у меня нет. Поэтому флажок в форме запрашивает ваше явное согласие на такую передачу (ст. 49.1.a GDPR) после того, как вы проинформированы об этом риске. Политика Telegram: ' + a(TGPRIV, 'telegram.org/privacy', true) + '.',
          '<strong>Если вы не хотите, чтобы данные проходили через Telegram, есть альтернатива:</strong> напишите напрямую на ' + mail + ' или укажите email в поле контакта — я отвечу по email. Учтите, что сама форма всегда доставляется через Telegram; чтобы полностью избежать этого, используйте email.',
        ] },
        { h: 'Другие получатели и поставщики', p: [
          '<strong>Vercel Inc.</strong> (США) размещает сайт и выполняет функцию отправки формы в качестве обработчика данных. Vercel применяет стандартные договорные положения Еврокомиссии и другие гарантии из своего ' + a(VDPA, 'соглашения об обработке данных', true) + ' (' + a(VPRIV, 'политика конфиденциальности Vercel', true) + ').',
          '<strong>Электронная почта:</strong> письма на ' + HOLDER.email + ' пересылаются в почтовый ящик ' + HOLDER.mailProvider + ' — страна, в отношении которой Еврокомиссия признала адекватный уровень защиты данных.',
          'Кроме этого, ваши данные третьим лицам не передаются, если этого не требует закон.',
        ] },
        { h: 'Сроки хранения', p: [
          'Если сотрудничество не состоялось, я удаляю переписку и данные формы <strong>через 12 месяцев после последнего контакта</strong>, в том числе в Telegram.',
          'Если вы заказали услугу, данные хранятся в течение сотрудничества, а затем — в сроки, установленные законом (например, шесть лет для бухгалтерских документов по Торговому кодексу Испании и сроки налоговой давности).',
          'Технические журналы хостинга хранятся в сроки, установленные провайдером. Статистика посещений не позволяет установить личность.',
        ] },
        { h: 'Ваши права', p: [
          'Вы можете запросить доступ к своим данным, их исправление или удаление, возразить против обработки, потребовать её ограничения или переноса данных и <strong>в любой момент отозвать согласие</strong>; это не влияет на законность обработки до отзыва. Напишите на ' + mail + ', указав, какое право вы реализуете; я отвечу в течение месяца.',
          'Если вы считаете, что ваши права нарушены, вы можете подать жалобу в Испанское агентство по защите данных (' + a(AEPD, 'aepd.es', true) + ').',
        ] },
        { h: 'Несовершеннолетние', p: [
          'Услуги предназначены для компаний и специалистов. Если вам меньше 14 лет, не отправляйте данные через форму.',
        ] },
        { h: 'Безопасность', p: [
          'Сайт всегда работает по HTTPS, форма собирает только необходимые данные, а ключи бота хранятся в переменных окружения провайдера, вне кода.',
        ] },
        { h: 'Изменения и язык', p: [
          'При изменении политики дата выше обновляется; каждая заявка сохраняется с принятой версией.',
          prevails.ru,
        ] },
      ],
    },
    en: {
      title: 'Privacy policy',
      description: 'What data geomachine.es processes, why, for how long, who receives it (Telegram, Vercel) and how to exercise your rights.',
      updated: 'Last updated: 29 September 2026.',
      sections: [
        { h: 'Data controller', p: [
          ...idLines.en,
          'There is no data protection officer: for any question about your data, write to the email above.',
        ] },
        { h: 'What data is processed', p: [
          '<strong>Contact form:</strong> your name, the contact detail you choose (email, Telegram username or phone), the service you are interested in, your indicative budget if you give one, and your message. The date and the version of this policy you accepted are recorded with each submission.',
          '<strong>Direct messages:</strong> whatever you send by email, Telegram or WhatsApp.',
          '<strong>Technical data:</strong> like any server, the hosting provider logs IP addresses and browser data to deliver the page and protect it from abuse.',
          '<strong>Statistics:</strong> anonymous, aggregated visit counts without cookies (see the ' + a('/en/cookies/', 'cookie policy') + ').',
        ] },
        { h: 'Purposes and legal bases', p: [
          '<strong>Replying to your enquiry and preparing a quote:</strong> your consent, given by ticking the box on the form (Art. 6(1)(a) GDPR), and pre-contractual steps taken at your request (Art. 6(1)(b)).',
          '<strong>Providing the service if you hire it, and meeting tax and accounting obligations:</strong> performance of the contract (Art. 6(1)(b)) and legal obligations (Art. 6(1)(c)).',
          '<strong>Website security and filtering automated submissions:</strong> legitimate interest in protecting the service (Art. 6(1)(f)).',
          'No automated decisions or profiling take place, and your data is not used for advertising.',
        ] },
        { h: 'How your message arrives: Telegram, outside the EU', p: [
          '<strong>Telegram is the channel through which I receive form messages.</strong> The form does not store your data in any database on this website: the server immediately forwards it, via a bot, to my Telegram account, where it is read and kept.',
          'Telegram is a messaging service operating <strong>outside the European Union</strong>, in a country without an EU adequacy decision, and I have not signed a data processing agreement with it. That is why the form’s checkbox asks for your explicit consent to this transfer (Art. 49(1)(a) GDPR) after informing you of this risk. Telegram’s policy: ' + a(TGPRIV, 'telegram.org/privacy', true) + '.',
          '<strong>If you prefer your data not to go through Telegram, there is an alternative:</strong> email me directly at ' + mail + ', or enter an email address in the form’s contact field and I will reply by email. Note that the form itself is always delivered via Telegram; to avoid it entirely, use email.',
        ] },
        { h: 'Other recipients and providers', p: [
          '<strong>Vercel Inc.</strong> (United States) hosts the website and runs the function that sends the form, as a data processor. Vercel applies the European Commission’s standard contractual clauses and other safeguards set out in its ' + a(VDPA, 'data processing addendum', true) + ' (' + a(VPRIV, 'Vercel privacy policy', true) + ').',
          '<strong>Email:</strong> messages to ' + HOLDER.email + ' are forwarded to a mailbox at ' + HOLDER.mailProvider + ', a country covered by an EU adequacy decision.',
          'Apart from this, your data is not shared with third parties unless required by law.',
        ] },
        { h: 'How long data is kept', p: [
          'If we do not end up working together, I delete the conversation and form data <strong>12 months after the last contact</strong>, including in Telegram.',
          'If you hire a service, data is kept for the duration of the relationship and then for the periods required by law (for example, six years for accounting records under the Spanish Commercial Code, and tax limitation periods).',
          'Hosting logs are kept for the period set by the provider. Visit statistics do not identify anyone.',
        ] },
        { h: 'Your rights', p: [
          'You can request access to your data, its rectification or erasure, object to processing, request restriction or portability, and <strong>withdraw your consent at any time</strong>, without affecting processing carried out before. Write to ' + mail + ' stating which right you are exercising; I reply within one month.',
          'If you believe your rights have not been respected, you can complain to the Spanish Data Protection Agency (' + a(AEPD, 'aepd.es', true) + ').',
        ] },
        { h: 'Minors', p: [
          'The services are aimed at businesses and professionals. If you are under 14, do not submit data through the form.',
        ] },
        { h: 'Security', p: [
          'The website is always served over HTTPS, the form only collects the data needed, and the bot credentials are stored as the provider’s environment variables, outside the code.',
        ] },
        { h: 'Changes and language', p: [
          'If this policy changes, the date above will be updated; each submission is recorded with the version accepted.',
          prevails.en,
        ] },
      ],
    },
  },

  // ------------------------------------------------------------------ COOKIES
  cookies: {
    es: {
      title: 'Política de cookies',
      description: 'geomachine.es no usa cookies. Solo guarda en tu navegador la moneda que eliges, y sus estadísticas no usan cookies.',
      updated: 'Última actualización: 29 de septiembre de 2026.',
      sections: [
        { h: 'Esta web no usa cookies', p: [
          'geomachine.es no instala cookies propias ni de terceros. Por eso no verás ningún aviso ni banner de cookies.',
        ] },
        { h: 'Lo único que se guarda en tu navegador', p: [
          'Si cambias la moneda de los precios (euros, rublos o lari), la web recuerda tu elección en el almacenamiento local del navegador (<code>localStorage</code>), con la clave <code>gm-currency</code>. No se envía a ningún servidor, no te identifica y no caduca sola.',
          'Es un almacenamiento técnico para una función que tú pides, exento de consentimiento según el artículo 22.2 de la LSSI. Puedes borrarlo cuando quieras desde la configuración de tu navegador (datos del sitio geomachine.es).',
        ] },
        { h: 'Estadísticas sin cookies', p: [
          'Para contar visitas se usa Vercel Web Analytics y, para medir la velocidad de carga, Vercel Speed Insights. Según su documentación, no usan cookies: cada visita se identifica con un resumen (hash) de la propia petición que se descarta a las 24 horas, y solo se obtienen datos agregados que no permiten identificarte (' + a(VA, 'Vercel Web Analytics', true) + ', ' + a(VSI, 'Vercel Speed Insights', true) + ').',
        ] },
        { h: 'Enlaces a otros servicios', p: [
          'Los botones de Telegram, WhatsApp y GitHub son enlaces normales: no cargan nada de esos servicios hasta que haces clic. Al abrirlos, se aplican sus propias políticas.',
        ] },
        { h: 'Cambios e idioma', p: [
          'Si en el futuro se añadiera alguna cookie que no sea técnica, se pediría tu consentimiento antes de instalarla y se actualizaría esta página.',
          prevails.es,
        ] },
      ],
    },
    ru: {
      title: 'Политика cookies',
      description: 'geomachine.es не использует cookies. В браузере сохраняется только выбранная валюта, а статистика работает без cookies.',
      updated: 'Последнее обновление: 29 сентября 2026 г.',
      sections: [
        { h: 'Сайт не использует cookies', p: [
          'geomachine.es не устанавливает ни собственных cookies, ни cookies третьих лиц. Поэтому на сайте нет уведомления или баннера о cookies.',
        ] },
        { h: 'Что сохраняется в вашем браузере', p: [
          'Если вы меняете валюту цен (евро, рубли или лари), сайт запоминает выбор в локальном хранилище браузера (<code>localStorage</code>) под ключом <code>gm-currency</code>. Эти данные не отправляются на сервер, не идентифицируют вас и не удаляются автоматически.',
          'Это техническое хранение для функции, которую вы сами запрашиваете; по статье 22.2 испанского закона LSSI согласие на него не требуется. Удалить его можно в любой момент в настройках браузера (данные сайта geomachine.es).',
        ] },
        { h: 'Статистика без cookies', p: [
          'Для подсчёта посещений используется Vercel Web Analytics, для измерения скорости загрузки — Vercel Speed Insights. Согласно их документации, они не используют cookies: посещение определяется по хешу самого запроса, который удаляется через 24 часа, и собираются только суммарные данные, не позволяющие установить вашу личность (' + a(VA, 'Vercel Web Analytics', true) + ', ' + a(VSI, 'Vercel Speed Insights', true) + ').',
        ] },
        { h: 'Ссылки на другие сервисы', p: [
          'Кнопки Telegram, WhatsApp и GitHub — обычные ссылки: они ничего не загружают с этих сервисов, пока вы не нажмёте. После перехода действуют их собственные правила.',
        ] },
        { h: 'Изменения и язык', p: [
          'Если в будущем появятся нетехнические cookies, ваше согласие будет запрошено до их установки, а эта страница будет обновлена.',
          prevails.ru,
        ] },
      ],
    },
    en: {
      title: 'Cookie policy',
      description: 'geomachine.es does not use cookies. It only stores the currency you choose in your browser, and its statistics are cookie-free.',
      updated: 'Last updated: 29 September 2026.',
      sections: [
        { h: 'This website does not use cookies', p: [
          'geomachine.es does not set any first-party or third-party cookies. That is why you will not see a cookie notice or banner.',
        ] },
        { h: 'The only thing stored in your browser', p: [
          'If you change the price currency (euros, roubles or lari), the website remembers your choice in your browser’s local storage (<code>localStorage</code>) under the key <code>gm-currency</code>. It is not sent to any server, does not identify you and does not expire on its own.',
          'This is technical storage for a feature you request, exempt from consent under Article 22.2 of the Spanish LSSI. You can delete it at any time in your browser settings (site data for geomachine.es).',
        ] },
        { h: 'Cookie-free statistics', p: [
          'Vercel Web Analytics is used to count visits and Vercel Speed Insights to measure loading speed. According to their documentation, they do not use cookies: each visit is identified by a hash of the request itself, discarded after 24 hours, and only aggregated data that cannot identify you is collected (' + a(VA, 'Vercel Web Analytics', true) + ', ' + a(VSI, 'Vercel Speed Insights', true) + ').',
        ] },
        { h: 'Links to other services', p: [
          'The Telegram, WhatsApp and GitHub buttons are plain links: nothing is loaded from those services until you click. Once you open them, their own policies apply.',
        ] },
        { h: 'Changes and language', p: [
          'If any non-technical cookie is added in the future, your consent will be requested before it is set and this page will be updated.',
          prevails.en,
        ] },
      ],
    },
  },
};

/* Aviso en el build mientras falten datos del titular. */
const pending = Object.entries(HOLDER).filter(([, v]) => v.includes('TODO'));
if (pending.length) {
  console.warn(`[legal] Faltan datos del titular en src/data/legal.ts: ${pending.map(([k]) => k).join(', ')}. No publicar así.`);
}
