# ── Stage 1: Build the SPA ───────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm config set fetch-retries 5 \
  && npm config set fetch-retry-mintimeout 20000 \
  && npm config set fetch-retry-maxtimeout 120000 \
  && npm config set fetch-timeout 300000 \
  && npm ci --no-audit

COPY . .

# VITE_API_URL is baked into the JS bundle at build time.
# Default /api makes the bundle use the DMZ reverse proxy (same-origin mode).
# Override via docker compose build args if you need an absolute URL.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ── Stage 2: Serve via nginx reverse proxy ───────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Remove the default nginx config so our template is the only one loaded
RUN rm /etc/nginx/conf.d/default.conf

# Copy the envsubst template — the official nginx entrypoint processes
# /etc/nginx/templates/*.template → /etc/nginx/conf.d/ at container start.
COPY deploy/nginx/default.conf.template /etc/nginx/templates/default.conf.template

# Copy the built SPA
COPY --from=build /app/dist /usr/share/nginx/html

# Runtime env vars consumed by the nginx template (set in docker-compose.yml).
# Providing defaults here means the image is runnable with docker run without
# a compose file (override BACKEND_HOST with -e before docker run).
ENV BACKEND_HOST=127.0.0.1
ENV BACKEND_PORT=5000
ENV STREAM_HOST=127.0.0.1
ENV STREAM_PORT=4001

# Only substitute our custom vars; leaves nginx $uri/$host/$http_upgrade etc. intact.
ENV NGINX_ENVSUBST_FILTER=^(BACKEND_|STREAM_)

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost/ || exit 1
