#!/bin/bash
# Strips data_dump/gcd_dump.db into data_dump/stripped.db.
# Run it from anywhere:  ./scripts/strip.sh
set -euo pipefail

# Find the folder this script lives in, so it works from any folder.
SCRIPTS_FOLDER="$(cd "$(dirname "$0")" && pwd)"

# Stop early with a clear message if uv is missing.
if ! command -v uv >/dev/null; then
    echo "uv is not installed."
    exit 1
fi

# The Python project (main.py) lives in this folder.
cd "$SCRIPTS_FOLDER"

# Run the strip script on data_dump/gcd_dump.db.
uv run main.py
