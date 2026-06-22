# Safe Space Frontend — Setup Guide

This guide covers deploying the frontend on the **DMZ VM** as part of the 3-VM Safe Space setup.

## What this VM runs

A single Docker container (`nginx:1.27-alpine`) that does two things:
- Serves the React SPA (the dashboard)
- Reverse-proxies all backend traffic to the protected backend VM

The browser never talks to the backend directly. Every request goes through this VM on port 80.

---

## Prerequisites

| Requirement | Detail |
|---|---|
| OS | Ubuntu Server 26.04 |
| RAM | 1 GB minimum |
| Disk | 10 GB minimum |
| Internet | Required (to pull Docker images and clone the repo) |
| Backend VM | Must be up and reachable from this VM on ports `5000` and `4001` |

---

## Step 1 — SSH into the DMZ VM

```bash
ssh safespace-dmz@<DMZ_VM_IP>
```

---

## Step 2 — Clone the repository

```bash
git clone https://github.com/Ahmed-Abdelnasser-Dev/safespace-central-unit-frontend.git
cd safespace-central-unit-frontend
```

---

## Step 3 — Run the setup script

```bash
chmod +x setup.sh && ./setup.sh
```

The script will:
1. Install Docker Engine and the Compose plugin
2. Add your user to the `docker` group
3. Open port `80` (HTTP) and `22` (SSH) in `ufw`
4. Create `.env` from `.env.deploy.example` and ask for the **backend VM's IP address**
5. Build and start the Docker container
6. Verify the frontend responds on `http://localhost`

When prompted:
```
Enter the IP address of the BACKEND VM (protected layer).
  Backend VM IP: <enter the backend VM's IP here>
```

---

## Step 4 — Verify

From your **host machine** (laptop/workstation), open a browser:

```
http://<DMZ_VM_IP>
```

You should see the Safe Space login page. If you can log in successfully, the full proxy chain is working.

---

## What the `.env` file looks like

After setup, `.env` in the repo root contains:

```env
BACKEND_HOST=<backend VM IP>   # set by setup.sh
BACKEND_PORT=5000
STREAM_HOST=<backend VM IP>    # same as BACKEND_HOST by default
STREAM_PORT=4001
HTTP_PORT=80
VITE_API_URL=/api
NGINX_ENVSUBST_FILTER=^(BACKEND_|STREAM_)
```

To change the backend IP later, edit `.env` and run:
```bash
docker compose up -d --build
```

---

## Useful commands (after initial setup)

```bash
# View live container logs
docker compose logs -f frontend

# Rebuild and restart after a code update
git pull && docker compose up -d --build

# Check container status
docker compose ps

# Inspect the rendered nginx config (verify backend IP substitution)
docker compose exec frontend cat /etc/nginx/conf.d/default.conf

# Stop the stack
docker compose down

# Restart without rebuild
docker compose restart frontend
```

---

## Troubleshooting

### "permission denied while trying to connect to the Docker socket"
Your user was just added to the `docker` group but the current session hasn't picked it up. Run:
```bash
newgrp docker
cd ~/safespace-central-unit-frontend && docker compose up -d --build
```

### Frontend loads but login fails (network error / CORS error)
The backend VM's `.env` has not been updated with the DMZ origin. See the **Backend Integration Guide** (`docs/backend-integration.md`) — the backend team must set `FRONTEND_URL`, `ALLOWED_ORIGINS`, and `BACKEND_PUBLIC_URL` to `http://<DMZ_VM_IP>` and restart their service.

### Frontend loads but images / uploads are broken
`BACKEND_PUBLIC_URL` on the backend is still set to the backend's own IP. Update it to `http://<DMZ_VM_IP>` and restart the backend.

### Container crashes immediately
```bash
docker compose logs frontend
```
The most common cause is nginx failing to substitute `BACKEND_HOST` — check that `.env` has `BACKEND_HOST` set to a valid IP (not the placeholder `10.0.0.X`).

### Port 80 already in use
Another service is listening on port 80. Either stop it or change `HTTP_PORT` in `.env` (e.g. `HTTP_PORT=8080`) then `docker compose up -d`.
