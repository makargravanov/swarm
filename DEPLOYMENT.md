# Deployment setup

Deployment is script-based.
No GitHub Actions workflow and no self-hosted runner are used.

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

## 3) Run deploy on server

```bash
cd /home/alex/swarm
bash scripts/deploy-remote.sh
```

This script performs:
1. `git fetch`
2. `git checkout master`
3. `git pull --ff-only`
4. `docker compose up -d --build`
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
