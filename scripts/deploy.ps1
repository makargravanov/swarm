param(
    [string]$HostName = "10.67.55.124",
    [string]$UserName = "alex",
    [string]$RepoDir = "/home/alex/swarm",
    [string]$Branch = "master"
)

$remoteCommand = "set -euo pipefail; cd '$RepoDir'; git fetch --all --prune; git checkout '$Branch'; git pull --ff-only origin '$Branch'; [ -f .env ] || cp .env.example .env; export DOCKER_BUILDKIT=1; export COMPOSE_DOCKER_CLI_BUILD=1; docker compose up -d --build --remove-orphans; docker compose ps"
ssh "$UserName@$HostName" $remoteCommand
