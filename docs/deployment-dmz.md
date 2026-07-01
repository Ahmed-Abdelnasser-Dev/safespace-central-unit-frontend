# Safe Space — DMZ Deployment Guide

## 3-VM Topology

```
 ┌──────────────────────────────────────────────────────────────┐
 │  Host Machine (your laptop / operator workstation)           │
 │  Browser: http://192.168.122.74                              │
 └────────────────────┬─────────────────────────────────────────┘
                      │  port 80 (HTTP)
         ┌────────────▼──────────────────────────────────────┐
         │  DMZ VM  (192.168.122.74)                          │
         │  ┌──────────────────────────────────────────────┐  │
         │  │  Docker: safespace-dmz-frontend               │  │
         │  │  nginx:1.27-alpine                            │  │
         │  │  • serves the React SPA (static)              │  │
         │  │  • reverse-proxies /api/ → backend:5000       │  │
         │  │  • reverse-proxies /socket.io/ → backend:5000  │  │
         │  │  • reverse-proxies /uploads/ → backend:5000   │  │
         │  │  • reverse-proxies /stream-service/ → stream:4001│
         │  └──────────────────────────────────────────────┘  │
         └────────────────────┬──────────────────────────────┘
                      │  ports 5000 / 4001 (internal only)
         ┌────────────▼──────────────────────────────────────┐
         │  Backend VM  (protected layer)                     │
         │  ┌──────────────┐  ┌──────────────────┐           │
         │  │  Backend     │  │  Stream-service   │           │
         │  │  :5000       │  │  :4001            │           │
         │  │  (API +      │  │  (MJPEG video     │           │
         │  │  Socket.IO + │  │  WebSocket feeds) │           │
         │  │  /uploads)   │  └──────────────────┘           │
         │  └──────┬───────┘                                  │
         │         │  :5432                                   │
         │  ┌──────▼───────┐                                  │
         │  │  PostgreSQL  │                                  │
         │  └──────────────┘                                  │
         └───────────────────────────────────────────────────┘

 Firewall VM sits between the two and enforces:
   • DMZ VM can reach backend:5000 and stream:4001
   • Host/LAN CANNOT reach backend VM directly
   • Host/LAN CAN reach DMZ VM on port 80
```

The browser **only ever talks to the DMZ VM on port 80**. The nginx container forwards traffic internally to the protected VM. No backend IP is ever exposed to the browser.

---

## How it works (same-origin mode)

The React bundle is built with `VITE_API_URL=/api` — a **relative** URL, not an absolute one. At runtime:

| Browser request | nginx action |
|----------------|--------------|
| `GET /api/auth/login` | proxied → `http://BACKEND_HOST:5000/api/auth/login` |
| `GET /socket.io/?…` | proxied → `http://BACKEND_HOST:5000/socket.io/?…` (WS upgrade) |
| `GET /uploads/incidents/…` | proxied → `http://BACKEND_HOST:5000/uploads/incidents/…` |
| `GET /stream-service/cameras` | proxied → `http://STREAM_HOST:4001/cameras` |
| `WS /stream-service/stream/:id` | proxied → `ws://STREAM_HOST:4001/stream/:id` |

Because all requests share the same origin (`http://192.168.122.74`), there are no CORS issues and auth cookies are handled automatically.

---

## Prerequisites

- Ubuntu Server 26.04 VM with internet access (to pull Docker images and the GitHub repo)
- At least 1 GB RAM, 10 GB disk
- The backend VM is running and reachable from the DMZ VM on ports 5000 and 4001

---

## Step-by-step: First deploy

### 1. SSH into the DMZ VM

```bash
ssh safespace-dmz@192.168.122.74
```

### 2. Clone the repository

```bash
git clone https://github.com/Ahmed-Abdelnasser-Dev/safespace-central-unit-frontend.git
cd safespace-central-unit-frontend
```

### 3. Run the setup script

```bash
chmod +x setup.sh
./setup.sh
```

The script will:
- Install Docker Engine + Compose plugin
- Add your user to the `docker` group
- Open port 80 in `ufw`
- Ask you to enter the **backend VM's IP address**
- Build and start the container
- Verify the frontend is reachable on `http://localhost`

> **Note:** If Docker was just installed, the group membership change requires re-login. The script will warn you. Log out, log back in, then re-run `./setup.sh` (idempotent).

### 4. Verify from your host machine

Open a browser and navigate to:
```
http://192.168.122.74
```

You should see the Safe Space login page. Log in with a valid account. If the login succeeds, the entire proxy chain is working (API, cookies, Socket.IO).

---

## Manual / re-deploy

After the first setup you don't need `setup.sh` again. Common operations:

```bash
# Pull latest code and rebuild
git pull
docker compose up -d --build

# View logs
docker compose logs -f frontend

# Check nginx rendered config (runtime variable substitution)
docker compose exec frontend cat /etc/nginx/conf.d/default.conf

# Stop the stack
docker compose down

# Restart without rebuild
docker compose restart frontend
```

---

## Environment variables

All variables live in `.env` (gitignored; copy from `.env.deploy.example`).

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BACKEND_HOST` | **Yes** | — | Backend VM IP (e.g. `10.0.0.5`) |
| `BACKEND_PORT` | No | `5000` | Backend HTTP port |
| `STREAM_HOST` | No | `$BACKEND_HOST` | Stream-service VM IP (usually same as backend) |
| `STREAM_PORT` | No | `4001` | Stream-service port |
| `HTTP_PORT` | No | `80` | Host port to expose the frontend on |
| `VITE_API_URL` | No | `/api` | Build-time API prefix. Change only if not using the built-in proxy |
| `NGINX_ENVSUBST_FILTER` | No | `^(BACKEND_\|STREAM_)` | Which vars envsubst replaces in the nginx template |

To change the backend IP after initial deploy, edit `.env` and run:
```bash
docker compose up -d --build
```
(Rebuild is only needed for the `VITE_*` build-time vars; a simple restart suffices for runtime nginx vars, but rebuilding is simpler and always correct.)

---

## Required backend VM configuration

On the backend VM, the central-unit backend `.env` must be updated to reference the **DMZ origin** — not localhost. This ensures:
- CORS headers accept requests from `http://192.168.122.74`
- Auth cookies work (same-origin policy)
- Media URLs embedded in API responses point through the proxy (not the bare backend IP)

```env
FRONTEND_URL=http://192.168.122.74
ALLOWED_ORIGINS=http://192.168.122.74
BACKEND_PUBLIC_URL=http://192.168.122.74
```

> **Why `BACKEND_PUBLIC_URL`?**  
> The backend uses this value to build absolute URLs for uploaded files (incident photos, snapshots). If it is set to the backend's own IP, those URLs will point to a host the browser cannot reach directly. Setting it to the DMZ origin makes the browser fetch them through the nginx `/uploads/` proxy.

After updating the backend `.env`, restart the backend service:
```bash
docker compose restart   # or whatever your backend restart command is
```

---

## Firewall VM rules

Configure the firewall VM (or the host's `iptables`/`nftables`) to enforce these policies:

| Source | Destination | Port | Action |
|--------|-------------|------|--------|
| Host / LAN | DMZ VM | 80/tcp | **ALLOW** |
| Host / LAN | DMZ VM | 22/tcp | ALLOW (SSH) |
| DMZ VM | Backend VM | 5000/tcp | **ALLOW** |
| DMZ VM | Backend VM | 4001/tcp | **ALLOW** |
| Host / LAN | Backend VM | 5000/tcp | **BLOCK** |
| Host / LAN | Backend VM | 4001/tcp | **BLOCK** |
| Host / LAN | Backend VM | 5432/tcp | **BLOCK** |

This ensures the backend is never reachable directly from outside the DMZ.

---

## Notes on HTTP-only (no TLS)

This deployment uses plain HTTP. This is acceptable for an internal VM lab on a private network (`192.168.x.x`). Implications:

- Auth cookies are sent as `SameSite=Lax` without the `Secure` flag. The backend **must not** set `Secure` on cookies when `NODE_ENV=production` if the origin is HTTP.
- Video WebSocket traffic is `ws://` (unencrypted).

To add HTTPS later:
1. Obtain a certificate (Let's Encrypt / self-signed).
2. Update `deploy/nginx/default.conf.template` to listen on 443 and add SSL directives.
3. Mount the cert files into the container and expose port 443.
4. Update `FRONTEND_URL`, `ALLOWED_ORIGINS`, `BACKEND_PUBLIC_URL` on the backend to `https://...`.
