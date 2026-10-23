from pathlib import Path

from strip_dump.arcs.strip_arcs import strip_arcs
from strip_dump.catalog.strip_catalog import strip_catalog
from strip_dump.characters.strip_characters import strip_characters
from strip_dump.credits.strip_credits import strip_credits
from strip_dump.links.strip_links import strip_links
from strip_dump.lookups.strip_lookups import strip_lookups
from strip_dump.reprints.strip_reprints import strip_reprints
from strip_dump.stories.strip_stories import strip_stories
from strip_dump.strip_dump_constants import DUMP_FOLDER, STRIPPED_FILE_NAME
from strip_dump.strip_dump_helpers import open_stripped_database
from strip_dump.tags.strip_tags import strip_tags


def strip_dump(source_path: Path, destination_path: Path = DUMP_FOLDER / STRIPPED_FILE_NAME) -> None:
    """Copy only the kept tables and rows of the GCD dump into a new, smaller SQLite file.

    The order matters: each step keeps only rows that belong to what earlier steps already copied.
    """
    connection = open_stripped_database(source_path, destination_path)
    try:
        strip_catalog(connection)
        strip_stories(connection)
        strip_credits(connection)
        strip_characters(connection)
        strip_reprints(connection)
        strip_arcs(connection)
        strip_tags(connection)
        strip_lookups(connection)
        strip_links(connection)
    finally:
        connection.close()
    print(f"Stripped dump written to {destination_path}")
