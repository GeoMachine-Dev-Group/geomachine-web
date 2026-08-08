# Publicar en un VPS

El sitio es **estático**: `npm run build` deja en `dist/` unos 1,5 MB sin nada que
ejecutar en el servidor. No hace falta Node en el VPS, ni base de datos, ni proceso
en marcha. Solo un servidor web sirviendo ficheros.

## 1. Construir

    npm ci
    npm run build

Comprobar que `astro.config.mjs` tiene el dominio real en `site:` — de ahí salen
las URL canónicas, el `hreflang`, el sitemap y las `og:image`. Si el dominio cambia,
hay que cambiarlo ahí **y** en `public/robots.txt`.

## 2. Subir

    rsync -avz --delete dist/ usuario@VPS:/var/www/geomachine/

`--delete` borra en el servidor lo que ya no está en `dist/`. Sin eso, los ficheros
con hash de builds anteriores se acumulan indefinidamente.

## 3. nginx

    server {
        listen 443 ssl http2;
        server_name geomachine.es www.geomachine.es;
        root /var/www/geomachine;

        ssl_certificate     /etc/letsencrypt/live/geomachine.es/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/geomachine.es/privkey.pem;

        # La raíz redirige al catálogo en español. Astro genera un dist/index.html
        # con meta-refresh como respaldo, pero un 301 real es más rápido y mejor
        # para SEO, así que se resuelve aquí antes de tocar disco.
        location = / {
            return 301 /es/servicios/;
        }

        # Astro construye en formato directorio: /es/servicios/index.html
        location / {
            try_files $uri $uri/ =404;
        }

        error_page 404 /404.html;

        # Ficheros con hash en el nombre: nunca cambian, se cachean un año.
        location /_astro/ {
            add_header Cache-Control "public, max-age=31536000, immutable";
        }

        # Las fuentes tampoco cambian de nombre, pero se sirven desde /fonts/.
        location /fonts/ {
            add_header Cache-Control "public, max-age=31536000, immutable";
        }

        # El HTML sí cambia en cada despliegue: revalidar siempre.
        location ~* \.html$ {
            add_header Cache-Control "no-cache";
        }

        gzip on;
        gzip_types text/css application/xml image/svg+xml application/json;
        gzip_min_length 1024;
        # Los .woff2 ya vienen comprimidos: recomprimir no aporta nada.

        add_header X-Content-Type-Options nosniff;
        add_header Referrer-Policy strict-origin-when-cross-origin;
    }

    server {
        listen 80;
        server_name geomachine.es www.geomachine.es;
        return 301 https://geomachine.es$request_uri;
    }

TLS con `certbot --nginx -d geomachine.es -d www.geomachine.es`.

## 4. Después de publicar, una vez

- Dar de alta el sitio en Google Search Console y enviar
  `https://geomachine.es/sitemap-index.xml`.
- Comprobar el JSON-LD en <https://validator.schema.org/> con la URL ya publicada.
- Comprobar la tarjeta social pegando la URL en Telegram (es el canal del CTA).
- Verificar que `/es/servicios/` y `/ru/uslugi/` se referencian entre sí en el
  `hreflang` y que ninguna devuelve 404.

## Lo que NO está resuelto

- **No hay remoto.** El repo es local, con una copia desnuda en
  `~/Documentos/WorkSpace/repos/geomachine-astro.git` (remoto `backup`, se
  actualiza con `git push backup --all`). Está en el mismo disco: no protege
  de un fallo de hardware.
- **No hay despliegue automatizado.** El `rsync` de arriba es manual.
- **El georgiano no lo ha revisado un nativo** — ver la cabecera de
  `src/data/catalog.ts`. Se puede publicar y corregir después.
