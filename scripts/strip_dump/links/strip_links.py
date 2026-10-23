import sqlite3

from strip_dump.links.strip_links_helpers import find_link_targets, look_up_target_name


def strip_links(connection: sqlite3.Connection) -> None:
    """Save the name behind every GCD link marker, so the cleaning step can replace the marker with it."""
    connection.execute("""
        CREATE TABLE main.link_target_name (
            kind TEXT NOT NULL,
            target_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            PRIMARY KEY (kind, target_id)
        )
    """)
    for kind, target_id in sorted(find_link_targets(connection)):
        name = look_up_target_name(connection, kind, target_id)
        if name:
            connection.execute("INSERT INTO main.link_target_name VALUES (?, ?, ?)", (kind, target_id, name))
    row_count = connection.execute("SELECT COUNT(*) FROM main.link_target_name").fetchone()[0]
    print(f"link_target_name: {row_count:,} rows", flush=True)
