#!/usr/bin/env bash
# Deploy the React UI to aarya.narukullapati.com (Hostinger static site).
# Requires HOSTINGER_API_TOKEN — generate one in hPanel -> Profile -> API.
set -euo pipefail

DOMAIN="aarya.narukullapati.com"
USERNAME="u374279249"
API="https://developers.hostinger.com/api/hosting/v1"

: "${HOSTINGER_API_TOKEN:?Set HOSTINGER_API_TOKEN first (hPanel -> Profile -> API)}"
AUTH="Authorization: Bearer ${HOSTINGER_API_TOKEN}"

cd "$(dirname "$0")"

echo "==> Building UI"
(cd UI && npm run build)

echo "==> Packaging dist"
TS="$(date +%Y%m%d_%H%M%S)"
ZIP="aarya_${TS}.zip"
python - "${ZIP}" <<'PY'
import os, sys, zipfile
out = sys.argv[1]
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    for root, _, files in os.walk("UI/dist"):
        for f in files:
            p = os.path.join(root, f)
            z.write(p, os.path.relpath(p, "UI/dist").replace(os.sep, "/"))
print(f"created {out}")
PY

echo "==> Generating upload URL"
CREDS=$(curl -fsS -X POST "${API}/files/upload-urls" \
  -H "${AUTH}" -H "Content-Type: application/json" \
  -d "{\"username\": \"${USERNAME}\", \"domain\": \"${DOMAIN}\"}")

read -r UP_URL AUTH_KEY REST_AUTH_KEY <<<"$(CREDS="${CREDS}" python -c "
import json, os
d = json.loads(os.environ['CREDS'])
print(d['url'], d['auth_key'], d['rest_auth_key'])
")"

echo "==> Uploading ${ZIP}"
SIZE=$(stat -c%s "${ZIP}")
curl -fsS -o /dev/null -X POST "${UP_URL}/${ZIP}?override=true" \
  -H "X-Auth: ${AUTH_KEY}" -H "X-Auth-Rest: ${REST_AUTH_KEY}" \
  -H "Tus-Resumable: 1.0.0" -H "Upload-Length: ${SIZE}" -H "Upload-Offset: 0"

curl -fsS -o /dev/null -X PATCH "${UP_URL}/${ZIP}?override=true" \
  -H "X-Auth: ${AUTH_KEY}" -H "X-Auth-Rest: ${REST_AUTH_KEY}" \
  -H "Tus-Resumable: 1.0.0" -H "Content-Type: application/offset+octet-stream" \
  -H "Upload-Offset: 0" --data-binary "@${ZIP}"

echo "==> Deploying"
curl -fsS -X POST "${API}/accounts/${USERNAME}/websites/${DOMAIN}/deploy" \
  -H "${AUTH}" -H "Content-Type: application/json" \
  -d "{\"archive_path\": \"${ZIP}\"}"
echo

rm -f "${ZIP}"

echo "==> Verifying https://${DOMAIN}/"
sleep 5
curl -s "https://${DOMAIN}/" | grep -o "<title>[^<]*</title>" || true
echo "Done."
