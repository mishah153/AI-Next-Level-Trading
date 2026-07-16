#!/usr/bin/env bash
# Create a real pg_dump of a running ainextlevel database.
# Usage: DATABASE_URL=postgresql://user:pass@host:5432/ainextlevel ./dump.sh
set -euo pipefail

DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/ainextlevel}"
DIR="$(cd "$(dirname "$0")" && pwd)"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT="$DIR/ainextlevel_${STAMP}.sql"

echo "Dumping $DB_URL ..."
pg_dump "$DB_URL" --no-owner --no-privileges --clean --if-exists -f "$OUT"
echo "Wrote $OUT"
