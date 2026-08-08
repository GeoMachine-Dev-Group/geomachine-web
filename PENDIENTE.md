# Pendiente

## 1. Merge i18n + rediseño — HECHO (2026-08-07)

Integrado en el commit `7823900`. 4 idiomas, 3 monedas, campo `human`,
showcase, paleta oscura del prototipo v2_17. En producción.

## 2. Controles interactivos — RESTAURADOS (2026-08-08)

Commit `56fb61f`. Vuelven los cuatro conmutadores del prototipo v2_15: tarifa,
moneda (una a la vez, no las tres juntas), paleta (7) y estilo de tarjeta
(capas apiladas / inclinación 3D), con la elección guardada en `localStorage`.

Revierte a propósito `224c80d` (rotación automática) y `771a444` (tres monedas
simultáneas). Si en algún momento se quiere volver a la versión sin controles,
el punto de partida son esos dos commits, no un `revert` de `56fb61f`.

El JSON-LD sigue declarando la tarifa de lanzamiento en euros, que es lo que se
ve al cargar sin `localStorage` previo — que es lo que rastrea Google.

## 3. Tipografía georgiana — ya resuelta, comprobar al activar `ka`

`Noto Sans Georgian` (400/500/600/700) está autoalojada y añadida como fallback en
`--display`, `--body` y `--data`. Su `unicode-range` la limita a los bloques
georgianos, así que es/ru/en no la descargan. El texto latino de la página `ka` (códigos `WEB-01`, monedas) sigue en
Outfit / IBM Plex Mono -- decisión deliberada.

## 4. Antes de subir a VPS

Ver `DEPLOY.md`.
