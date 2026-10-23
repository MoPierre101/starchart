import sqlite3

from strip_dump.stories.strip_stories_constants import KEPT_STORY_TYPE_IDS
from strip_dump.strip_dump_helpers import copy_rows, to_sql_list


def strip_stories(connection: sqlite3.Connection) -> None:
    """Covers, ads, letters pages and the other story types are not kept."""
    copy_rows(connection, "gcd_story", f"""
        SELECT story.*
        FROM source.gcd_story AS story
        WHERE story.issue_id IN (SELECT id FROM main.gcd_issue)
          AND story.deleted = 0
          AND story.type_id IN {to_sql_list(KEPT_STORY_TYPE_IDS)}
    """)
