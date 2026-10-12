# Project notes

- `API/` — FastAPI (uvicorn, :8000) + PyMySQL. `UI/` — React + Vite + TypeScript (:5173).
- Dev API: `cd API && ./.venv/Scripts/python -m uvicorn main:app --reload --env-file .env`. Dev UI: `cd UI && npm run dev`. UI reads `VITE_API_BASE_URL` (prod value in `UI/.env.production`).
- DB: Hostinger MySQL `u374279249_aarya` on `srv901.hstgr.io:3306` (shared hosting DB — remote access is per-IP; `72.60.175.59` VPS and `173.170.98.5` home are whitelisted). Credentials live in `.env` files (root for compose, `API/.env` for dev uvicorn — both gitignored). Audit table: `visits` (auto-created at startup).
- Audit: UI posts `POST /api/track` on load; `GET /api/visits` requires `X-Admin-Token: $AUDIT_ADMIN_TOKEN` (token in `/root/aarya/.env` on the VPS; open when unset in dev).
- Local Docker: `docker compose up --build` → UI :8080, API :8000 (the UI nginx proxies `/api/` to the api service).
- Production UI: static build on Hostinger Premium at `aarya.narukullapati.com` — `./deploy.sh` (needs `HOSTINGER_API_TOKEN` from hPanel → Profile → API). Target recorded in `.hostinger/site.json`.
- Production API: Hostinger VPS `srv1076274.hstgr.cloud` (72.60.175.59, KVM 2, Ubuntu 24.04 + Docker) behind the existing Traefik (`web`/`websecure` entrypoints, `letsencrypt` resolver, `exposedbydefault=false`) at `api.aarya.narukullapati.com` — `./deploy-api.sh`. App dir on VPS: `/root/aarya`; run `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build api`.
- VPS SSH: `ssh root@72.60.175.59` with `~/.ssh/id_ed25519`. VPS also hosts `globalstudenthub.org` (volunteerhub project, `/root/volunteerhub`) — don't touch it.
- Zip archives for Hostinger deploys must have plain entry names (`assets/x.js`) — `./`-prefixed entries make the extractor fail with 500; PowerShell `Compress-Archive` writes backslashes, so `deploy.sh` zips via Python's zipfile.
