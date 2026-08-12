import { defineCollection, z } from 'astro:content';

/** Debe coincidir con los prefijos reales de src/data/catalog.ts (lines[].prefix). */
const PILLARS = ['WEB', 'IA', 'SEO', 'APP', 'MNT', 'SYS'] as const;

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    /** Meta description SEO — recomendado ~150-160 caracteres. */
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    /** Palabra clave objetivo (SEO on-page), una por artículo. */
    keyword: z.string(),
    /** Pilar de la estrategia de contenido (ver Decisiones/estrategia-contenido.md). */
    pillar: z.enum(PILLARS),
    /**
     * Código real del catálogo (src/data/catalog.ts) al que enlaza el
     * artículo, p.ej. "WEB-01". Editorialmente se espera en todo artículo
     * real, pero opcional a nivel de esquema.
     */
    relatedService: z.string().regex(/^[A-Z]+-\d{2}$/).optional(),
    /**
     * Slug (sin prefijo de idioma) del artículo equivalente en el otro
     * idioma, si existe. ES/RU son piezas hermanas, no traducciones
     * literales — por eso es opcional, no todo post tiene pareja.
     */
    translationSlug: z.string().optional(),
    /** Oculta el artículo del índice y del build de producción (y por
        tanto del sitemap); sigue siendo visible en `astro dev`. */
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
