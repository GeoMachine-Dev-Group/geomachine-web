/**
 * Retrato de Romeo Mikava para la sección de cierre (`.close` en
 * Catalog.astro) y para el `image` del nodo Person del JSON-LD.
 *
 * ── DÓNDE DEJAR LA FOTO ─────────────────────────────────────────────────
 *   public/images/romeo.webp
 *   · Retrato vertical 4:5, 800×1000 px, en .webp (calidad ~80, < 150 KB).
 *   · Si se usa otro tamaño, cambiar FOUNDER_PHOTO_SIZE para que width y
 *     height del <img> sigan siendo los reales (evita saltos de maquetación).
 *
 * En cuanto ese archivo exista, el siguiente `npm run build` lo usa solo: la
 * sección de cierre deja de mostrar el recuadro «RM / Foto de Romeo» y el
 * JSON-LD pasa a apuntar a él. No hay que tocar nada más.
 *
 * La comprobación se hace en el build (todas las páginas que lo usan son
 * estáticas), así que nunca se publica un <img> ni un `image` hacia una foto
 * que no está.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

/** Ruta pública de la foto definitiva del cierre. */
export const FOUNDER_PHOTO_SRC = '/images/romeo.webp';
export const FOUNDER_PHOTO_SIZE = { width: 800, height: 1000 } as const;

/** Selfi provisional de la página "Sobre mí" (660×660). Solo se usa como
    respaldo del JSON-LD mientras no llegue la foto definitiva. */
const PROVISIONAL_PHOTO_SRC = '/romeo-mikava.webp';

function publicFileExists(src: string): boolean {
  return existsSync(join(process.cwd(), 'public', src));
}

/** true si Romeo ya ha dejado public/images/romeo.webp. */
export function hasFounderPhoto(): boolean {
  return publicFileExists(FOUNDER_PHOTO_SRC);
}

/** Ruta de la mejor foto disponible para el JSON-LD, o null si no hay
    ninguna (y entonces el nodo Person va sin `image`). */
export function founderImagePath(): string | null {
  if (hasFounderPhoto()) return FOUNDER_PHOTO_SRC;
  if (publicFileExists(PROVISIONAL_PHOTO_SRC)) return PROVISIONAL_PHOTO_SRC;
  return null;
}
