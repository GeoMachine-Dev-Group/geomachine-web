// Regenera los pósteres de respaldo del hero 3D (src/assets/hero/*.webp) a partir
// de la propia escena. Hay que repetirlo si cambia la escena o su composición.
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
const shots = [
  { name: 'atelier-wide', width: 2000, height: 900, dpr: 1, mobile: false },
  { name: 'atelier-band', width: 430, height: 900, dpr: 2, mobile: true },
];

const browser = await chromium.launch({
  executablePath: process.env.CHROME ?? '/usr/bin/google-chrome',
  args: ['--use-angle=gl-egl', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars'],
});
for (const s of shots) {
  const ctx = await browser.newContext({
    viewport: { width: s.width, height: s.height },
    deviceScaleFactor: s.dpr,
    isMobile: s.mobile,
    reducedMotion: 'reduce', // fotograma quieto: sin deriva ni parpadeo
  });
  const page = await ctx.newPage();
  await page.goto(`${base}/es/servicios/`, { waitUntil: 'load' });
  // Solo la escena: sin texto, sin velos y sin el fundido de los bordes.
  await page.addStyleTag({
    content: `astro-dev-toolbar{display:none!important}
      .hero--atelier>*{visibility:hidden}
      .hero-scene{-webkit-mask-image:none!important;mask-image:none!important}`,
  });
  const canvas = page.locator('.hero-scene__canvas');
  await canvas.scrollIntoViewIfNeeded();
  await page.waitForSelector('.hero-scene.is-live', { timeout: 20000 });
  await page.waitForTimeout(2500);
  const png = await canvas.screenshot();
  const out = new URL(`../src/assets/hero/${s.name}.webp`, import.meta.url);
  const info = await sharp(png).webp({ quality: 72, effort: 6 }).toFile(out.pathname);
  console.log(`${s.name}.webp  ${info.width}×${info.height}  ${(info.size / 1024).toFixed(1)} KB`);
  await ctx.close();
}
await browser.close();
