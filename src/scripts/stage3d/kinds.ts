/**
 * Las piezas 3D que existen, una por clave. La misma clave sirve en
 * ServiceStage.astro (prop `visual` y mapa VISUALS de import()), en
 * StageVisual.astro (mapa DRAW del SVG estático) y en Catalog.astro (qué
 * línea lleva cuál). Sin three.js: se puede importar desde cualquier sitio.
 */
export type StageKind = 'web' | 'app' | 'sys' | 'ia' | 'mnt' | 'seo' | 'pack';
