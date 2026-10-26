#!/usr/bin/env bash
# Runs on the VPS in /opt/qlsx-staging-web (CI copies this file and deploy/staging/docker-compose.yml there, then
# calls it over SSH). Staging copy of deploy/remote-deploy.sh; it never touches production containers or images.
#
#   bash remote-deploy.sh <image>                   # image already present on the machine
#   GHCR_USER=<user> bash remote-deploy.sh <image>  # reads a GHCR token from stdin, then pulls
#
# Pull the new image -> recreate the web container -> wait for its healthcheck -> on failure go back
# to the image that was running before. Manual rollback: run it again with the tag you want
# (tags are staging-v<run number>).
set -euo pipefail

IMAGE="${1:?Usage: remote-deploy.sh <image>}"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WAIT_TIMEOUT="${WAIT_TIMEOUT:-120}"

cd "$APP_DIR"

exec 9>/var/lock/qlsx-staging-web-deploy.lock
flock -n 9 || { echo "Another staging deploy is already running, stopping." >&2; exit 1; }

# Keep the 1 newest staging images (by the run number in the `staging-v<n>` tag) and remove older ones.
# Filtering by tag leaves production (`v<n>`) images alone; `docker rmi` without -f skips an image a container still uses.
prune_old_images() {
  local repo="${1%:*}"
  docker images "$repo" --format '{{.Tag}}' \
    | sed -nE 's/^staging-v([0-9]+)$/\1/p' | sort -nr | tail -n +2 \
    | while read -r run; do docker rmi "$repo:staging-v$run" >/dev/null 2>&1 || true; done
}

if [[ -n "${GHCR_USER:-}" ]]; then
  trap 'docker logout ghcr.io >/dev/null 2>&1 || true' EXIT
  docker login ghcr.io -u "$GHCR_USER" --password-stdin >/dev/null
fi

# A pull needs ~2GB and Postgres shares this disk: stop below 3GB free rather than let the pull eat the DB's room.
if (( $(df --output=avail / | tail -1) < 3 * 1024 * 1024 )); then
  echo "!!! Less than 3GB free on the disk, stopping. Remove old images, then deploy again." >&2
  df -h / >&2
  exit 1
fi

echo "==> Pulling $IMAGE"
docker pull "$IMAGE"

prev_container="$(docker compose ps -q web || true)"
prev_image=""
if [[ -n "$prev_container" ]]; then
  prev_image="$(docker inspect "$prev_container" --format '{{.Config.Image}}')"
fi
echo "==> Currently running: ${prev_image:-<nothing>}"

echo "==> Starting $IMAGE"
if WEB_IMAGE="$IMAGE" docker compose up -d --no-build --wait --wait-timeout "$WAIT_TIMEOUT" web; then
  touch .env
  grep -v '^WEB_IMAGE=' .env > .env.tmp || true
  echo "WEB_IMAGE=$IMAGE" >> .env.tmp
  mv .env.tmp .env
  echo "==> Removing old staging images, keeping only the running one"
  prune_old_images "$IMAGE"
  echo "==> Deployed: $IMAGE"
  exit 0
fi

echo "!!! The new version is not healthy after ${WAIT_TIMEOUT}s. Last 100 log lines:" >&2
docker compose logs --tail 100 web >&2 || true

if [[ -z "$prev_image" ]]; then
  echo "!!! There is no previous version to go back to." >&2
  exit 1
fi

echo "==> Rolling back to $prev_image" >&2
WEB_IMAGE="$prev_image" docker compose up -d --no-build --wait --wait-timeout "$WAIT_TIMEOUT" web >&2
echo "!!! Went back to $prev_image, this deploy failed." >&2
exit 1
