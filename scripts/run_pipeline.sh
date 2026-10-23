#!/bin/bash
# Runs the whole pipeline:
#   1. strip data_dump/gcd_dump.db into data_dump/stripped.db
#   2. load stripped.db into the gcd_raw schema with pgloader
#   3. clean gcd_raw into the gcd schema
#   4. drop gcd_raw
# The database comes from DATABASE_URL in scripts/.env. It must be reachable from this computer.
# For Encore's local database, get it with `encore db conn-uri starchart`.
# Run it from anywhere:  ./scripts/run_pipeline.sh
set -euo pipefail

# The folder this script lives in, so it works from any folder.
SCRIPTS_FOLDER="$(cd "$(dirname "$0")" && pwd)"
# The file the strip step writes and pgloader reads.
STRIPPED_DB_PATH="$SCRIPTS_FOLDER/../data_dump/stripped.db"

# Prints one part of DATABASE_URL from .env: url, host or port.
read_database_detail() {
    python3 -I - "$1" "$SCRIPTS_FOLDER/.env" <<'PYTHON'
import sys
from pathlib import Path
from urllib.parse import urlsplit

detail, env_path = sys.argv[1], sys.argv[2]
for line in Path(env_path).read_text().splitlines():
    if line.strip().startswith("DATABASE_URL="):
        url = line.split("=", 1)[1].strip().strip('"').strip("'")
        break
else:
    sys.exit("DATABASE_URL is not in .env")

parts = urlsplit(url)
details = {
    "url": url,
    "host": parts.hostname or "",
    "port": str(parts.port or 5432),
}
print(details[detail])
PYTHON
}

# Stops with a clear message before anything runs if a tool or the database is missing.
check_tools_and_database() {
    # The three programs the pipeline needs.
    for tool in uv pgloader psql; do
        if ! command -v "$tool" >/dev/null; then
            echo "$tool is not installed."
            exit 1
        fi
    done

    # The database must answer on the host and port from DATABASE_URL.
    local host port
    host="$(read_database_detail host)"
    port="$(read_database_detail port)"
    if ! nc -z "$host" "$port" 2>/dev/null; then
        echo "Cannot reach the database at $host:$port."
        echo "Start Encore's database with \`encore run\` or \`encore check\` in api/starchart."
        exit 1
    fi
}

# Check everything first, so the pipeline does not fail halfway for a simple reason.
echo "Checking the tools and the database"
check_tools_and_database
DATABASE_URL="$(read_database_detail url)"

# Step 1: make the smaller stripped.db from the full dump.
echo
echo "Step 1 of 4: strip the dump"
"$SCRIPTS_FOLDER/strip.sh"

# Step 2: copy stripped.db into the gcd_raw schema as it is, replacing the old gcd_raw tables.
echo
echo "Step 2 of 4: load the stripped dump into gcd_raw with pgloader"
cd "$SCRIPTS_FOLDER/load_dump"
STRIPPED_DB_PATH="$STRIPPED_DB_PATH" DATABASE_URL="$DATABASE_URL" pgloader load_dump.load

# Step 3: rebuild the clean gcd schema from gcd_raw.
echo
echo "Step 3 of 4: clean gcd_raw into the gcd schema"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q -f "$SCRIPTS_FOLDER/clean_dump/clean_dump.sql"

# Step 4: drop the temporary gcd_raw schema now that gcd is built (the next run loads it again).
echo
echo "Step 4 of 4: drop gcd_raw"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q -c "drop schema if exists gcd_raw cascade;"

echo
echo "Done. The gcd schema is rebuilt."
