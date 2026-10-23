import sqlite3

from strip_dump.strip_dump_helpers import copy_rows
from strip_dump.tags.strip_tags_constants import STORY_CONTENT_TYPE_ID


def strip_tags(connection: sqlite3.Connection) -> None:
    strip_tagged_stories(connection)
    strip_used_tags(connection)


def strip_tagged_stories(connection: sqlite3.Connection) -> None:
    """The tag table also tags series, issues and characters. Only story tags are kept."""
    copy_rows(connection, "taggit_taggeditem", f"""
        SELECT tagged_item.*
        FROM source.taggit_taggeditem AS tagged_item
        WHERE tagged_item.content_type_id = {STORY_CONTENT_TYPE_ID}
          AND tagged_item.object_id IN (SELECT id FROM main.gcd_story)
    """)


def strip_used_tags(connection: sqlite3.Connection) -> None:
    copy_rows(connection, "taggit_tag", """
        SELECT tag.*
        FROM source.taggit_tag AS tag
        WHERE tag.id IN (SELECT tag_id FROM main.taggit_taggeditem)
    """)
