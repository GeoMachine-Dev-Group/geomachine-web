# Los dos sitios en un nginx

Dos sitios estáticos no necesitan contenedores: `server_name` ya los separa.
No comparten procesos, ni ficheros, ni estado. Con esto basta:

    sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx rsync

## 1. Antes de nada, el DNS

Los dos dominios (y sus `www`) deben apuntar ya a la IP del VPS. Certbot
verifica por HTTP: si el DNS no resuelve, la emisión falla.

    dig +short geomachine.es gagraservis.ru

## 2. Directorios

    sudo mkdir -p /var/www/geomachine /var/www/gagraservis /var/www/certbot
    sudo chown -R $USER:www-data /var/www/geomachine /var/www/gagraservis
    sudo chmod -R 755 /var/www/geomachine /var/www/gagraservis

El dueño es tu usuario para que `rsync` pueda escribir sin `sudo`.

## 3. Certificados primero

Los ficheros definitivos apuntan a certificados que todavía no existen; si los
activas ahora, `nginx -t` falla. Por eso se arranca con `bootstrap.conf`:

    sudo cp bootstrap.conf /etc/nginx/sites-available/
    sudo ln -sf /etc/nginx/sites-available/bootstrap.conf /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t && sudo systemctl reload nginx

    sudo certbot certonly --webroot -w /var/www/certbot \
      -d geomachine.es -d www.geomachine.es
    sudo certbot certonly --webroot -w /var/www/certbot \
      -d gagraservis.ru -d www.gagraservis.ru

`certonly` obtiene el certificado sin reescribir tu configuración, que es justo
lo que quieres teniendo una escrita a mano.

## 4. Configuración definitiva

    sudo cp snippets/*.conf /etc/nginx/snippets/
    sudo cp geomachine.es.conf gagraservis.ru.conf /etc/nginx/sites-available/
    sudo rm -f /etc/nginx/sites-enabled/bootstrap.conf
    sudo ln -sf /etc/nginx/sites-available/geomachine.es.conf  /etc/nginx/sites-enabled/
    sudo ln -sf /etc/nginx/sites-available/gagraservis.ru.conf /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx

**`nginx -t` es la validación real de estos ficheros** — no se han podido
comprobar en local. Si se queja de `http2 on;`, tu nginx es anterior a 1.25:
quita esa línea y usa `listen 443 ssl http2;`.

## 5. Subir el contenido

    ./deploy.sh            # geomachine.es, desde el repo

Para gagraservis, su propio rsync a `/var/www/gagraservis/`.

## 6. Comprobar

    curl -I https://geomachine.es/es/servicios/     # 200
    curl -I https://geomachine.es/                  # 301 -> /es/servicios/
    curl -I http://geomachine.es/                   # 301 -> https
    curl -I https://www.geomachine.es/              # 301 -> sin www
    curl -I https://geomachine.es/nope              # 404 con la página propia
    curl -I https://gagraservis.ru/                 # 200

Que la renovación automática funciona:

    sudo certbot renew --dry-run

## Detalle que suele romper esto

En nginx, un `add_header` dentro de un `location` **descarta los heredados del
`server`**. Por eso las cabeceras de seguridad están en
`snippets/seguridad.conf` y se incluyen otra vez dentro de cada `location` que
añade las suyas. Si añades un `location` con `add_header`, incluye el snippet
ahí también o esa ruta se queda sin cabeceras.
