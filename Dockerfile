# Sitio estático: nginx sirve los ficheros ya construidos, sin runtime de Node.
FROM nginx:alpine

COPY dist/ /usr/share/nginx/html/
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
