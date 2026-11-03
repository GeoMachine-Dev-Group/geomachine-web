/**
 * Las seis páginas por intención (B5) en un solo sitio, para enlazarlas igual
 * desde todas partes: el bloque de la portada, la ruta de navegación y los
 * «otros servicios» de cada página, y el botón del servicio relacionado en el
 * blog. Si se añade una página por intención, se añade aquí y sale sola en
 * todos esos sitios.
 *
 * `blogCodes`: códigos del catálogo cuyo artículo del blog debe llevar a esta
 * página en vez de al ancla del catálogo. Solo cuando la página trata de ese
 * servicio concreto: WEB-01/WEB-02 (landing, web de varias páginas) no llevan a
 * turismo, porque los artículos de landing no hablan de turismo.
 */
import {
  taxiAppPath,
  directoryPath,
  multilingualPath,
  privateAiPath,
  messagingPath,
  tourismPath,
  type IntentLang,
} from '../i18n/ui';

export type IntentKey = 'taxi' | 'directory' | 'multilingual' | 'privateAi' | 'messaging' | 'tourism';

export interface IntentInfo {
  key: IntentKey;
  paths: Record<IntentLang, string>;
  title: Record<IntentLang, string>;
  text: Record<IntentLang, string>;
  related: IntentKey[];
  blogCodes: string[];
}

export const intents: IntentInfo[] = [
  {
    key: 'taxi',
    paths: taxiAppPath,
    title: { es: 'App de taxi', ru: 'Приложение такси', en: 'Taxi app', ka: 'ტაქსის აპლიკაცია' },
    text: {
      es: 'Pasajero, conductor y panel, con asignación al coche más cercano. Piloto en Abjasia.',
      ru: 'Пассажир, водитель и панель, заказ уходит ближайшей машине. Пилот в Абхазии.',
      en: 'Passenger, driver and admin apps, with nearest-car dispatch. Pilot in Abkhazia.',
      ka: 'მგზავრი, მძღოლი და პანელი, შეკვეთა უახლოეს მანქანას გადაეცემა. პილოტი აფხაზეთში.',
    },
    related: ['messaging', 'directory'],
    blogCodes: ['PACK-04'],
  },
  {
    key: 'directory',
    paths: directoryPath,
    title: { es: 'Directorio local', ru: 'Справочник организаций', en: 'Local directory', ka: 'ბიზნესების ცნობარი' },
    text: {
      es: 'Catálogo de negocios por ciudad y categoría, como abhazservis.com.',
      ru: 'Каталог организаций по городам и категориям, как abhazservis.com.',
      en: 'A business directory by town and category, like abhazservis.com.',
      ka: 'ბიზნესების ცნობარი დასახლებებისა და კატეგორიების მიხედვით, როგორც abhazservis.com.',
    },
    related: ['tourism', 'multilingual'],
    blogCodes: ['PACK-07'],
  },
  {
    key: 'multilingual',
    paths: multilingualPath,
    title: { es: 'Web multiidioma', ru: 'Многоязычный сайт', en: 'Multilingual website', ka: 'მრავალენოვანი საიტი' },
    text: {
      es: 'Tu web en varios idiomas, bien montada para Google y Yandex.',
      ru: 'Сайт на нескольких языках, правильно настроенный для Google и Яндекса.',
      en: 'Your site in several languages, set up properly for Google and Yandex.',
      ka: 'თქვენი საიტი რამდენიმე ენაზე, სწორად აწყობილი Google-ისა და Yandex-ისთვის.',
    },
    related: ['tourism', 'directory'],
    blogCodes: ['WEB-04', 'SEO-04'],
  },
  {
    key: 'privateAi',
    paths: privateAiPath,
    title: { es: 'IA privada', ru: 'Приватный ИИ', en: 'Private AI', ka: 'პირადი AI' },
    text: {
      es: 'Una IA que responde con tus documentos en tu propio equipo, sin sacar los datos.',
      ru: 'ИИ, который отвечает по вашим документам на вашем сервере, данные не уходят наружу.',
      en: 'An AI that answers from your documents on your own machine, with no data leaving it.',
      ka: 'AI, რომელიც თქვენს დოკუმენტებზე თქვენსავე კომპიუტერზე პასუხობს, ისე, რომ მონაცემები მას არ ტოვებს.',
    },
    related: ['messaging', 'multilingual'],
    blogCodes: ['IA-04', 'SYS-03'],
  },
  {
    key: 'messaging',
    paths: messagingPath,
    title: { es: 'WhatsApp y Telegram', ru: 'WhatsApp и Telegram', en: 'WhatsApp and Telegram', ka: 'WhatsApp და Telegram' },
    text: {
      es: 'Formularios que llegan a tu Telegram, avisos y botones para que te escriban.',
      ru: 'Заявки с сайта в ваш Telegram, уведомления и кнопки, чтобы вам писали.',
      en: 'Site forms delivered to your Telegram, alerts and buttons so customers message you.',
      ka: 'საიტის ფორმები თქვენს Telegram-ში, გაფრთხილებები და ღილაკები, რომ კლიენტებმა მოგწერონ.',
    },
    related: ['privateAi', 'taxi'],
    blogCodes: ['IA-03', 'IA-02'],
  },
  {
    key: 'tourism',
    paths: tourismPath,
    title: { es: 'Web de turismo en Abjasia', ru: 'Сайт для туризма в Абхазии', en: 'Tourism website in Abkhazia', ka: 'ტურისტული საიტი აფხაზეთში' },
    text: {
      es: 'Traslados, alojamiento o excursiones, con precios claros y contacto directo.',
      ru: 'Трансферы, жильё или экскурсии, с понятными ценами и прямой связью.',
      en: 'Transfers, stays or tours, with clear prices and direct contact.',
      ka: 'ტრანსფერები, განთავსება ან ექსკურსიები, გასაგები ფასებით და პირდაპირი კონტაქტით.',
    },
    related: ['directory', 'messaging'],
    blogCodes: [],
  },
];

export const intentByKey = Object.fromEntries(intents.map((i) => [i.key, i])) as Record<IntentKey, IntentInfo>;

/** Página por intención que trata ese código del catálogo, si la hay. */
export function intentForCode(code: string): IntentInfo | undefined {
  return intents.find((i) => i.blogCodes.includes(code));
}

export const intentUi: Record<IntentLang, { sectionTitle: string; sectionLead: string; more: string; related: string; home: string }> = {
  es: {
    sectionTitle: 'Qué puedo hacer por ti',
    sectionLead: 'Cada servicio tiene su página, con un proyecto real, el precio y lo que todavía no funciona.',
    more: 'Ver la página',
    related: 'Otros servicios',
    home: 'Servicios',
  },
  ru: {
    sectionTitle: 'С чем могу помочь',
    sectionLead: 'У каждой услуги своя страница: реальный проект, цена и то, что пока не работает.',
    more: 'Подробнее',
    related: 'Другие услуги',
    home: 'Услуги',
  },
  en: {
    sectionTitle: 'What I can build for you',
    sectionLead: 'Each service has its own page, with a real project, the price and what does not work yet.',
    more: 'See the page',
    related: 'Other services',
    home: 'Services',
  },
  // ka: traducido por IA, sin revisar.
  ka: {
    sectionTitle: 'რით შემიძლია დაგეხმაროთ',
    sectionLead: 'ყოველ მომსახურებას თავისი გვერდი აქვს: რეალური პროექტი, ფასი და ის, რაც ჯერ არ მუშაობს.',
    more: 'დაწვრილებით',
    related: 'სხვა მომსახურებები',
    home: 'მომსახურებები',
  },
};
