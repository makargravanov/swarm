param(
    [string]$HostName = "10.67.55.124",
    [string]$UserName = "alex",
    [string]$RepoDir = "/home/alex/swarm",
    [string]$Branch = "master"
)

$remoteCommand = "REPO_DIR='$RepoDir' BRANCH='$Branch' bash /home/alex/swarm/scripts/deploy-remote.sh"
ssh "$UserName@$HostName" $remoteCommand
