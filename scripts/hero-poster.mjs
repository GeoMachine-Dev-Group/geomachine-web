// Regenera el póster de respaldo de la escultura del hero (src/assets/hero/escultura.webp)
// a partir de la propia escena. Hay que repetirlo si cambian las figuras o la luz.
//
//   npm run dev -- --port 4391     (en otra terminal)
//   npx --yes -p playwright-core node scripts/hero-poster.mjs [http://localhost:4391]
//
// Usa el Chrome del sistema con GPU; sharp ya es dependencia del proyecto.
import { createRequire } from 'node:module';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_CORE ?? 'playwright-core');
const base = process.argv[2] ?? 'http://localhost:4391';

const browser = await chromium.launch({
  executablePath: process.env.CHROME ?? '/usr/bin/google-chrome',
  args: ['--use-angle=gl-egl', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars'],
});
// Fotograma quieto (movimiento reducido) de la primera figura, con fondo transparente.
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
const page = await ctx.newPage();
await page.goto(`${base}/es/servicios/`, { waitUntil: 'load' });
await page.addStyleTag({
  content: `astro-dev-toolbar{display:none!important}
    html,body,.hero--atelier{background:transparent!important}
    .hero--atelier>:not(.hero-scene),.hero-scene__caption,.plate,main>:not(.hero--atelier),.foot,.contact-fab{visibility:hidden!important}`,
});
await page.waitForSelector('.hero-scene.is-live', { timeout: 20000 });
await page.waitForTimeout(2000);
const png = await page.locator('.hero-scene__canvas').screenshot({ omitBackground: true });
const out = new URL('../src/assets/hero/escultura.webp', import.meta.url);
const info = await sharp(png).webp({ quality: 52, alphaQuality: 70, effort: 6 }).toFile(out.pathname);
console.log(`escultura.webp  ${info.width}×${info.height}  ${(info.size / 1024).toFixed(1)} KB`);
await browser.close();
