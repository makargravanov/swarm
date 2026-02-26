# Deployment and local development

Deployment is script-based.
No GitHub Actions workflow and no self-hosted runner are used.

## Architecture

- `swarm` service: Rust backend API on port `3000` inside Docker network
- `web` service: Nginx serving built React app and proxying `/api/*` to `swarm:3000`

## 1) Server prerequisites

- Docker engine installed
- Docker Compose plugin installed
- Project cloned to `/home/alex/swarm`

## 2) Runtime config

On server:

```bash
cd /home/alex/swarm
cp .env.example .env
```

Required in `.env`:
- `DATABASE_URL`

Useful defaults from `.env.example`:
- `API_PORT=3000` (backend exposed only on loopback: `127.0.0.1`)
- `WEB_PORT=80` (public frontend port)

## 3) Run deploy on server

```bash
cd /home/alex/swarm
bash scripts/deploy-remote.sh
```

This script performs:
1. `git fetch`
2. `git checkout master`
3. `git pull --ff-only`
4. `docker compose up -d --build --remove-orphans`
5. `docker compose ps`

## 4) Run deploy from local Windows machine

From repository root:

```powershell
./scripts/deploy.ps1
```

Optional parameters:

```powershell
./scripts/deploy.ps1 -HostName 10.67.55.124 -UserName alex -RepoDir /home/alex/swarm -Branch master
```

## 5) Local development

### Option A: run backend natively + frontend with Vite (recommended)

Backend:

```bash
cargo run
```

Frontend:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Notes:
- Frontend dev server runs on `http://localhost:5173`
- `/api/*` is proxied to `VITE_API_PROXY_TARGET` (default `http://localhost:3000`)

### Option B: run backend in Docker + frontend with Vite

```bash
docker compose up -d swarm
cd frontend
npm run dev
```

Backend is reachable locally at `http://localhost:3000` by default.

## 6) Local production-like run

```bash
docker compose up -d --build
```

Check:
- UI: `http://localhost:80` by default
- API via same origin: `http://localhost:80/api/health` by default
