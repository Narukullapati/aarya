#!/usr/bin/env bash
# Redeploy the API on the VPS: pull latest main, rebuild, restart via Traefik.
# Requires the SSH key in ~/.ssh/id_ed25519 (added to the VPS as root).
set -euo pipefail

VPS="root@72.60.175.59"
DIR="/root/aarya"

cd "$(dirname "$0")"

echo "==> Updating ${VPS}:${DIR}"
ssh "${VPS}" "cd ${DIR} && git pull --ff-only && docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build api"

echo "==> Verifying https://api.aarya.narukullapati.com/api/health"
sleep 3
curl -s https://api.aarya.narukullapati.com/api/health || true
echo
echo "Done."
