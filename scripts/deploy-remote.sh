#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="${REPO_DIR:-/home/alex/swarm}"
BRANCH="${BRANCH:-master}"

cd "$REPO_DIR"

git fetch --all --prune
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

if [ ! -f .env ]; then
  cp .env.example .env
fi

export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

docker compose up -d --build --remove-orphans
docker compose ps
