# ---- Build stage ----
FROM node:20-alpine AS build

WORKDIR /app

# Turnstile site key — passed as a build arg from docker-compose (.env).
# Vite reads this at build time and bakes it into the JS bundle.
# Site keys are public by design (they're visible in the browser anyway).
ARG VITE_TURNSTILE_SITE_KEY
ENV VITE_TURNSTILE_SITE_KEY=$VITE_TURNSTILE_SITE_KEY

COPY package.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM nginx:1.27-alpine

# Static output lives in /app/dist after `vite build`
COPY --from=build /app/dist /usr/share/nginx/html

# SPA fallback + API proxy + uploads proxy
RUN printf 'server {\n\
  listen 80;\n\
  server_name _;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
\n\
  client_max_body_size 10M;\n\
\n\
  location /api/ {\n\
    proxy_pass http://backend:8000;\n\
    proxy_set_header Host $host;\n\
    proxy_set_header X-Real-IP $remote_addr;\n\
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
  }\n\
\n\
  location /uploads/ {\n\
    proxy_pass http://backend:8000;\n\
    proxy_set_header Host $host;\n\
    proxy_set_header X-Real-IP $remote_addr;\n\
  }\n\
\n\
  location / { try_files $uri $uri/ /index.html; }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
