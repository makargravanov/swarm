# Deployment setup

This project deploys from GitHub Actions on each push to `master`.

## 1) Required GitHub Actions secrets

Add these repository secrets:

- `SSH_HOST` — server IP or hostname (example: `10.67.55.124`)
- `SSH_USER` — ssh user (example: `alex`)
- `SSH_PRIVATE_KEY` — private key content for that user
- `DEPLOY_PATH` — absolute path to repo on server (example: `/home/alex/swarm`)

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
2. SSH to server
3. `git pull --ff-only`
4. `docker compose up -d --build`
