import sqlite3

from strip_dump.lookups.strip_lookups_constants import LOOKUP_TABLE_NAMES
from strip_dump.strip_dump_helpers import copy_rows


def strip_lookups(connection: sqlite3.Connection) -> None:
    """Small tables that give names to ids. They are copied whole."""
    for table_name in LOOKUP_TABLE_NAMES:
        copy_rows(connection, table_name, f"SELECT * FROM source.{table_name}")
