# Deployment setup

This project deploys from GitHub Actions on each push to `master`.

## 1) Required GitHub Actions setup

No SSH secrets are required for deploy anymore.
Deploy runs on a self-hosted runner on your server.

Runner requirements:

- Linux host in the same network as your deployment target
- Docker + Compose plugin installed
- Runner user has permission to run `docker` (usually via `docker` group)
- Project checked out at `/home/alex/swarm` (or update `DEPLOY_PATH` in workflow)

## 2) One-time server bootstrap

On server, clone the repository once:

```bash
git clone https://github.com/makargravanov/swarm.git /home/alex/swarm
cd /home/alex/swarm
```

Install Docker + Docker Compose plugin if not installed, then test manually once:

```bash
docker compose up -d --build
```

## 3) Runtime config

`.env` is local-only and ignored by git. Use `.env.example` as template.

```bash
cp .env.example .env
```

## 4) Deployment behavior

Workflow file: `.github/workflows/ci-cd.yml`

On push to `master` it does:
1. `cargo check --locked`
2. Runs deploy job on self-hosted runner
3. `git pull --ff-only`
4. `docker compose up -d --build`

## 5) Install self-hosted runner

On GitHub: repository `Settings` → `Actions` → `Runners` → `New self-hosted runner` → Linux x64.

Then run provided commands on your server (example flow):

```bash
mkdir -p /home/alex/actions-runner && cd /home/alex/actions-runner
# Download + extract commands from GitHub UI
./config.sh --url https://github.com/makargravanov/swarm --token <RUNNER_TOKEN>
sudo ./svc.sh install
sudo ./svc.sh start
```

Check status:

```bash
sudo ./svc.sh status
```
