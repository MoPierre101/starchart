import sys
from pathlib import Path

from strip_dump.strip_dump import strip_dump
from strip_dump.strip_dump_constants import DUMP_FILE_NAME, DUMP_FOLDER


def main():
    source_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DUMP_FOLDER / DUMP_FILE_NAME
    if not source_path.exists():
        sys.exit(f"Dump not found: {source_path}")
    print(f"Reading {source_path}")
    strip_dump(source_path)


if __name__ == "__main__":
    main()
