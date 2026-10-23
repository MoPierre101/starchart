import sqlite3

from strip_dump.links.strip_links_constants import (
    LINK_MARKER_PATTERN,
    LINK_TEXT_COLUMNS,
    NAME_QUERY_BY_KIND,
)


def find_link_targets(connection: sqlite3.Connection) -> set[tuple[str, int]]:
    """Return every (kind, id) that a link marker in the kept text points at."""
    targets = set()
    for table_name, column_name in LINK_TEXT_COLUMNS:
        rows = connection.execute(
            f"SELECT {column_name} FROM main.{table_name} WHERE {column_name} LIKE '%[gcd_link_%'"
        )
        for (text,) in rows:
            for kind, target_id in LINK_MARKER_PATTERN.findall(text):
                targets.add((kind, int(target_id)))
    return targets


def look_up_target_name(connection: sqlite3.Connection, kind: str, target_id: int) -> str | None:
    """Look the name up in the full dump, because many targets were not kept. None if there is no name."""
    name_query = NAME_QUERY_BY_KIND.get(kind)
    if name_query is None:
        return None
    row = connection.execute(name_query, (target_id,)).fetchone()
    return row[0] if row and row[0] else None
