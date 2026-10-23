import sqlite3

from strip_dump.strip_dump_helpers import copy_rows


def strip_arcs(connection: sqlite3.Connection) -> None:
    strip_story_arc_links(connection)
    strip_story_arcs(connection)
    strip_story_arc_relations(connection)


def strip_story_arc_links(connection: sqlite3.Connection) -> None:
    copy_rows(connection, "gcd_story_story_arc", """
        SELECT story_arc_link.*
        FROM source.gcd_story_story_arc AS story_arc_link
        WHERE story_arc_link.story_id IN (SELECT id FROM main.gcd_story)
          AND story_arc_link.storyarc_id IN (SELECT id FROM source.gcd_story_arc WHERE deleted = 0)
    """)


def strip_story_arcs(connection: sqlite3.Connection) -> None:
    copy_rows(connection, "gcd_story_arc", """
        SELECT story_arc.*
        FROM source.gcd_story_arc AS story_arc
        WHERE story_arc.id IN (SELECT storyarc_id FROM main.gcd_story_story_arc)
    """)


def strip_story_arc_relations(connection: sqlite3.Connection) -> None:
    """A relation is kept only when both of its arcs are kept."""
    copy_rows(connection, "gcd_story_arc_relation", """
        SELECT relation.*
        FROM source.gcd_story_arc_relation AS relation
        WHERE relation.from_story_arc_id IN (SELECT id FROM main.gcd_story_arc)
          AND relation.to_story_arc_id IN (SELECT id FROM main.gcd_story_arc)
    """)
