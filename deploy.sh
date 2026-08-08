#!/usr/bin/env bash
#
# Despliegue del catálogo a un VPS. El sitio es estático: esto compila,
# comprueba que lo compilado está sano y lo sincroniza por rsync. No hay
# nada que reiniciar en el servidor.
#
#   ./deploy.sh                 # despliega
#   ./deploy.sh --dry-run       # enseña qué cambiaría, sin tocar el servidor
#
# Configuración: variables de entorno o un fichero .env.deploy al lado de
# este script (no versionado).

set -Eeuo pipefail

cd "$(dirname "$0")"
[ -f .env.deploy ] && . ./.env.deploy

DEPLOY_HOST="${DEPLOY_HOST:-}"
DEPLOY_USER="${DEPLOY_USER:-}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/geomachine}"
DEPLOY_PORT="${DEPLOY_PORT:-22}"
SITE_DOMAIN="${SITE_DOMAIN:-geomachine.es}"

DRY=""
[ "${1:-}" = "--dry-run" ] && DRY="--dry-run"

die() { printf '\n  ERROR: %s\n\n' "$*" >&2; exit 1; }
step() { printf '\n\033[1m==> %s\033[0m\n' "$*"; }

[ -n "$DEPLOY_HOST" ] || die "Falta DEPLOY_HOST. Copia .env.deploy.example a .env.deploy y rellénalo."
[ -n "$DEPLOY_USER" ] || die "Falta DEPLOY_USER."

# --- 1. El repo debe estar limpio -------------------------------------------
# Desplegar con cambios sin commitear deja el servidor en un estado que no
# corresponde a ningún commit: imposible saber después qué hay publicado.
step "Comprobando el repositorio"
if [ -n "$(git status --porcelain)" ]; then
  git status --short
  die "Hay cambios sin commitear. Commitéalos o guárdalos con git stash."
fi
REV="$(git rev-parse --short HEAD)"
echo "commit $REV"

# --- 2. Compilar desde cero -------------------------------------------------
step "Compilando"
rm -rf dist
npm run build

# --- 3. Validar lo compilado ------------------------------------------------
# Un build que "termina bien" puede aun así haber perdido una ruta o llevar el
# dominio equivocado. Se comprueba antes de que llegue al servidor.
step "Validando dist/"

for f in index.html 404.html es/servicios/index.html ru/uslugi/index.html \
         en/services/index.html ka/momsakhurebebi/index.html \
         sitemap-index.xml robots.txt; do
  [ -s "dist/$f" ] || die "falta o está vacío: dist/$f"
done
echo "6 rutas + sitemap + robots presentes"

grep -q "https://$SITE_DOMAIN/es/servicios/" dist/es/servicios/index.html \
  || die "el canonical no apunta a $SITE_DOMAIN. Revisa 'site' en astro.config.mjs."

for lang in es ru en ka; do
  grep -q "hreflang=\"$lang\"" dist/es/servicios/index.html \
    || die "falta el hreflang de '$lang'"
done
echo "canonical y los 4 hreflang correctos"

python3 - <<'PY' || die "el JSON-LD no es válido"
import json, re, io, sys
for page in ('es/servicios', 'ru/uslugi', 'en/services', 'ka/momsakhurebebi'):
    h = io.open(f'dist/{page}/index.html', encoding='utf-8').read()
    m = re.search(r'<script type="application/ld\+json">(.*?)</script>', h, re.S)
    if not m: sys.exit(f'sin JSON-LD en {page}')
    json.loads(m.group(1))
print('JSON-LD válido en los 4 idiomas')
PY

if grep -rlq "localhost\|127\.0\.0\.1" dist --include=*.html; then
  die "hay referencias a localhost en el HTML compilado"
fi

echo "tamaño: $(du -sh dist | cut -f1)"

# --- 4. Sincronizar ---------------------------------------------------------
# --delete borra en el servidor lo que ya no está en dist/. Sin eso, los
# ficheros con hash de builds anteriores se acumulan sin límite.
step "Sincronizando con $DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PATH${DRY:+  (simulacro)}"
rsync -avz --delete $DRY \
  -e "ssh -p $DEPLOY_PORT -o ConnectTimeout=15" \
  --chmod=D755,F644 \
  dist/ "$DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PATH/"

if [ -n "$DRY" ]; then
  printf '\n  Simulacro: no se ha cambiado nada en el servidor.\n\n'
  exit 0
fi

# --- 5. Comprobar el sitio ya publicado -------------------------------------
step "Comprobando https://$SITE_DOMAIN"
fail=0
for path in / /es/servicios/ /ru/uslugi/ /en/services/ /ka/momsakhurebebi/ /sitemap-index.xml; do
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "https://$SITE_DOMAIN$path" || echo 000)"
  case "$path:$code" in
    /:200|/:301|/:302) echo "  $path -> $code" ;;
    *:200)             echo "  $path -> $code" ;;
    *) echo "  $path -> $code  <-- inesperado"; fail=1 ;;
  esac
done

printf '\n'
[ "$fail" = 0 ] && echo "Desplegado el commit $REV." \
                || echo "Desplegado el commit $REV, pero alguna ruta no responde como debería."
echo "Recuerda enviar https://$SITE_DOMAIN/sitemap-index.xml a Search Console si el contenido cambió mucho."
