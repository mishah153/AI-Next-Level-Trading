#!/usr/bin/env bash
# Restore the schema + seed snapshot into a target database.
# Usage: DATABASE_URL=postgresql://user:pass@host:5432/ainextlevel ./restore.sh
set -euo pipefail

DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/ainextlevel}"
DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Restoring into $DB_URL ..."
psql "$DB_URL" -v ON_ERROR_STOP=1 -f "$DIR/ainextlevel_backup.sql"
echo "Restore complete. Login: alex@ainextleveltrading.com / Sup3rSecret!"
