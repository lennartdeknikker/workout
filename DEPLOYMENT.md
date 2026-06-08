# Deploying Trainmate (Raspberry Pi)

Trainmate runs as a Node server (`adapter-node`) + Postgres in Docker, reached over HTTPS via a
**Cloudflare Tunnel** (recommended — no port-forwarding) or a **Caddy** reverse proxy. ARM64.

## 1. Prerequisites

- Raspberry Pi (64-bit OS) with **Docker** + **docker compose**.
- A public hostname: either a Cloudflare-managed domain (Tunnel) or a domain whose A record points at
  your public IP with ports 80/443 forwarded (Caddy).
- This repo cloned on the Pi.

## 2. Configure `.env`

```bash
cp .env.example .env
```

Set at least:

| Var                  | Value                                                          |
| -------------------- | -------------------------------------------------------------- |
| `POSTGRES_PASSWORD`  | a strong password                                              |
| `DATABASE_URL`       | leave as-is — compose overrides it to talk to the `db` service |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32`                                      |
| `BETTER_AUTH_URL`    | your public URL, e.g. `https://trainmate.example.com`          |
| `PUBLIC_APP_URL`     | same public URL                                                |
| `ORIGIN`             | same public URL (so SvelteKit accepts form POSTs)              |

> `DATABASE_URL` in `.env` is for host tools (migrations/backups from the Pi). The **app container**
> always uses the in-compose `postgres://…@db:5432/trainmate` from `docker-compose.yml`.

Migrations (`migrations/*.sql`, auth + app tables) run **automatically** on app startup — no manual step.

## 3a. Ingress option A — Cloudflare Tunnel (recommended)

1. In the Cloudflare Zero Trust dashboard → **Networks → Tunnels**, create a tunnel; copy its **token**.
2. Add a **public hostname**: `trainmate.example.com` → service `http://app:3000`.
3. In `.env`: `TUNNEL_TOKEN=<token>` and `ADDRESS_HEADER=cf-connecting-ip`.
4. Launch:

```bash
docker compose --env-file .env -f docker/docker-compose.yml --profile tunnel up -d --build
```

Cloudflare terminates TLS and proxies to the app over the compose network. The app port is **not**
published to the host.

## 3b. Ingress option B — Caddy

1. Point `APP_DOMAIN`'s A record at your public IP; forward ports 80 + 443 to the Pi.
2. In `.env`: `APP_DOMAIN=trainmate.example.com`, `PROTOCOL_HEADER=x-forwarded-proto`,
   `HOST_HEADER=x-forwarded-host`, `ADDRESS_HEADER=x-forwarded-for`, `XFF_DEPTH=1`.
3. Launch:

```bash
docker compose --env-file .env -f docker/docker-compose.yml --profile caddy up -d --build
```

Caddy obtains a Let's Encrypt certificate automatically (see `Caddyfile`).

## 4. Verify

- Visit the public URL → redirected to `/login`.
- Sign up, then install to your phone's home screen (PWA — needs the HTTPS origin).
- Headers/CSP/rate-limiting are built into the app (see `src/hooks.server.ts`, `svelte.config.js`).

## 5. Updating

```bash
git pull
docker compose --env-file .env -f docker/docker-compose.yml --profile <tunnel|caddy> up -d --build
```

## 6. Backups

`scripts/backup.sh` writes a gzipped `pg_dump` to `$BACKUP_DIR` (keeps the last 14):

```bash
BACKUP_DIR=/mnt/backups/trainmate ./scripts/backup.sh
```

Cron (daily 03:00):

```cron
0 3 * * * cd /home/pi/workout && BACKUP_DIR=/mnt/backups/trainmate ./scripts/backup.sh >> /var/log/trainmate-backup.log 2>&1
```

Restore:

```bash
gunzip -c /mnt/backups/trainmate/trainmate-YYYYMMDD-HHMMSS.sql.gz \
  | docker compose --env-file .env -f docker/docker-compose.yml exec -T db psql -U trainmate -d trainmate
```

## 7. Security notes

- Postgres is bound to `127.0.0.1:5544` (host-local only) and otherwise reached over the compose network.
- Keep `BETTER_AUTH_SECRET` and `.env` private (never commit). Rotate the secret if leaked.
- Security headers (HSTS, CSP, `X-Frame-Options`, etc.) and per-IP rate limiting on auth + the
  ExerciseDB proxy are enforced by the app. `robots.txt` + `noindex` keep it out of search engines.
