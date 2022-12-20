FROM nginx:latest
COPY /dist/machine-witness /usr/share/nginx/html
EXPOSE 80