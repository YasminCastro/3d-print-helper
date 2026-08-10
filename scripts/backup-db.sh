#!/usr/bin/env bash
# Dumps the postgres database running in the 3d-print-helper-postgres container,
# uploads the dump to Google Drive via rclone, and prunes old backups.
#
# Intended to run from the HOST via cron (not inside a container), e.g.:
#   0 3 * * * /path/to/3d-print-helper/scripts/backup-db.sh >> /var/log/3d-print-helper-backup.log 2>&1
#
# Requires:
#   - docker (with the postgres container from docker-compose.yml running)
#   - rclone installed and configured with a remote (see scripts/README.md)

set -euo pipefail

# --- Config -----------------------------------------------------------------
CONTAINER_NAME="3d-print-helper-postgres"
DB_USER="postgres"
DB_NAME="print-helper"

RCLONE_REMOTE="gdrive"                      # name of the rclone remote (rclone config)
RCLONE_FOLDER="3d-print-helper-backups"     # folder inside the remote

LOCAL_BACKUP_DIR="${HOME}/backups/3d-print-helper"
KEEP_COUNT=7                                 # how many most-recent backups to keep, locally and on the remote

# --- Run ---------------------------------------------------------------------
mkdir -p "$LOCAL_BACKUP_DIR"

timestamp="$(date +%Y-%m-%d_%H-%M-%S)"
filename="print-helper_${timestamp}.sql.gz"
filepath="${LOCAL_BACKUP_DIR}/${filename}"

echo "[$(date -Iseconds)] Starting backup -> ${filepath}"

if ! docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$filepath"; then
  echo "[$(date -Iseconds)] ERROR: pg_dump failed" >&2
  rm -f "$filepath"
  exit 1
fi

if [ ! -s "$filepath" ]; then
  echo "[$(date -Iseconds)] ERROR: dump file is empty" >&2
  rm -f "$filepath"
  exit 1
fi

echo "[$(date -Iseconds)] Dump created ($(du -h "$filepath" | cut -f1)). Uploading to ${RCLONE_REMOTE}:${RCLONE_FOLDER}"

if ! rclone copy "$filepath" "${RCLONE_REMOTE}:${RCLONE_FOLDER}" --quiet; then
  echo "[$(date -Iseconds)] ERROR: rclone upload failed, keeping local copy" >&2
  exit 1
fi

echo "[$(date -Iseconds)] Upload complete."

# --- Prune local backups, keeping only the KEEP_COUNT most recent ------------
find "$LOCAL_BACKUP_DIR" -maxdepth 1 -name 'print-helper_*.sql.gz' | sort | head -n -"$KEEP_COUNT" | while IFS= read -r old; do
  echo "[$(date -Iseconds)] Removing old local backup: ${old}"
  rm -f "$old"
done

# --- Prune remote backups, keeping only the KEEP_COUNT most recent -----------
rclone lsf "${RCLONE_REMOTE}:${RCLONE_FOLDER}" --files-only | sort | head -n -"$KEEP_COUNT" | while IFS= read -r old; do
  echo "[$(date -Iseconds)] Removing old remote backup: ${old}"
  rclone deletefile "${RCLONE_REMOTE}:${RCLONE_FOLDER}/${old}"
done

echo "[$(date -Iseconds)] Backup finished successfully."
