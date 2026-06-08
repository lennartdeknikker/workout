#!/usr/bin/env sh
# Back up the Trainmate Postgres database into $BACKUP_DIR (gzipped pg_dump),
# keeping the 14 most recent dumps. Run from the repo root.
#
#   BACKUP_DIR=/mnt/backups/trainmate ./scripts/backup.sh
#
# Cron (daily 03:00):
#   0 3 * * * cd /home/pi/workout && BACKUP_DIR=/mnt/backups/trainmate ./scripts/backup.sh >> /var/log/trainmate-backup.log 2>&1
set -eu

BACKUP_DIR="${BACKUP_DIR:-/mnt/backups/trainmate}"
COMPOSE="docker compose --env-file .env -f docker/docker-compose.yml"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$BACKUP_DIR/trainmate-$STAMP.sql.gz"

mkdir -p "$BACKUP_DIR"
$COMPOSE exec -T db pg_dump -U trainmate -d trainmate --no-owner --no-privileges | gzip >"$OUT"

# Keep only the 14 most recent backups.
ls -1t "$BACKUP_DIR"/trainmate-*.sql.gz 2>/dev/null | tail -n +15 | xargs -r rm -f

echo "backup written: $OUT"
