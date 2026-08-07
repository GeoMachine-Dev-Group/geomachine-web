# Pendiente

## 1. Merge i18n + rediseño — HECHO (2026-08-07)

Integrado en el commit `7823900`. 4 idiomas, 3 monedas, campo `human`,
showcase, paleta oscura del prototipo v2_17. En producción.

## 2. Tipografía georgiana — ya resuelta, comprobar al activar `ka`

`Noto Sans Georgian` (400/500/600/700) está autoalojada y añadida como fallback en
`--display`, `--body` y `--data`. Su `unicode-range` la limita a los bloques
georgianos, así que es/ru/en no la descargan. El texto latino de la página `ka` (códigos `WEB-01`, monedas) sigue en
Outfit / IBM Plex Mono -- decisión deliberada.

## 3. Antes de subir a VPS

Ver `DEPLOY.md`.
