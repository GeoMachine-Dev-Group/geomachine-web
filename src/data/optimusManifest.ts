/**
 * Manifiesto del APK de Optimus. Se publica en app.geomachine.es y se lee en
 * el build; si no responde (o aún no existe) se usa el respaldo local, de modo
 * que el build nunca se rompe por él. El navegador lo vuelve a pedir y refresca
 * la página si ha cambiado (ver el script de NavCamPage.astro).
 */
export const MANIFEST_URL = 'https://app.geomachine.es/descarga/optimus.json';
export const APK_URL = 'https://app.geomachine.es/descarga/optimus.apk';

export interface OptimusManifest {
  version: string;
  versionCode?: number;
  fecha: string; // AAAA-MM-DD
  bytes: number;
  sha256?: string;
  apk: string;
  novedades: Record<string, string[]>;
}

export const FALLBACK: OptimusManifest = {
  version: '2026.10.24',
  fecha: '2026-10-24',
  bytes: 71994813,
  apk: APK_URL,
  novedades: {},
};

function valid(m: any): m is OptimusManifest {
  return (
    m &&
    typeof m.version === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(m.fecha) &&
    Number.isFinite(m.bytes) &&
    m.bytes > 0
  );
}

export async function loadManifest(): Promise<{ manifest: OptimusManifest; source: 'red' | 'respaldo' }> {
  try {
    const res = await fetch(MANIFEST_URL, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const m = await res.json();
      if (valid(m)) {
        return {
          manifest: {
            ...FALLBACK,
            ...m,
            apk: typeof m.apk === 'string' && m.apk.startsWith('https://') ? m.apk : APK_URL,
            novedades: m.novedades && typeof m.novedades === 'object' ? m.novedades : {},
          },
          source: 'red',
        };
      }
    }
  } catch {
    // sin red, 404, JSON roto… se usa el respaldo
  }
  return { manifest: FALLBACK, source: 'respaldo' };
}

/** Novedades en el idioma de la página; si faltan, en inglés. */
export function novedadesFor(m: OptimusManifest, lang: string): string[] {
  const own = m.novedades?.[lang];
  if (Array.isArray(own) && own.length) return own;
  const en = m.novedades?.en;
  return Array.isArray(en) ? en : [];
}

const LOCALES: Record<string, string> = { es: 'es-ES', ru: 'ru-RU', en: 'en-GB', ka: 'ka-GE' };

/** «24 oct 2026» en el idioma de la página (UTC para no desplazar el día). */
export function formatFecha(fecha: string, lang: string): string {
  const d = new Date(`${fecha}T12:00:00Z`);
  return new Intl.DateTimeFormat(LOCALES[lang] ?? 'en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  }).format(d).replace(/\.(?=\s|$)/g, '');
}

export const mb = (bytes: number) => Math.round(bytes / 1_000_000);
