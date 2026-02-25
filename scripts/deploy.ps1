param(
    [string]$HostName = "10.67.55.124",
    [string]$UserName = "alex",
    [string]$RepoDir = "/home/alex/swarm",
    [string]$Branch = "master"
)

$remoteCommand = "set -euo pipefail; cd '$RepoDir'; git fetch --all --prune; git checkout '$Branch'; git pull --ff-only origin '$Branch'; [ -f .env ] || cp .env.example .env; docker compose up -d --build; docker compose ps"
ssh "$UserName@$HostName" $remoteCommand
