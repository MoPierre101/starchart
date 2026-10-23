import sqlite3

from strip_dump.strip_dump_helpers import copy_rows


def strip_characters(connection: sqlite3.Connection) -> None:
    strip_story_characters(connection)
    strip_characters_in_stories(connection)
    strip_character_name_details(connection)


def strip_story_characters(connection: sqlite3.Connection) -> None:
    """Appearances of a character missing from the dump are dropped."""
    copy_rows(connection, "gcd_story_character", """
        SELECT story_character.*
        FROM source.gcd_story_character AS story_character
        WHERE story_character.story_id IN (SELECT id FROM main.gcd_story)
          AND story_character.deleted = 0
          AND story_character.character_id IN (SELECT id FROM source.gcd_character WHERE deleted = 0)
    """)


def strip_characters_in_stories(connection: sqlite3.Connection) -> None:
    copy_rows(connection, "gcd_character", """
        SELECT character.*
        FROM source.gcd_character AS character
        WHERE character.deleted = 0
          AND character.id IN (SELECT character_id FROM main.gcd_story_character)
    """)


def strip_character_name_details(connection: sqlite3.Connection) -> None:
    copy_rows(connection, "gcd_character_name_detail", """
        SELECT name_detail.*
        FROM source.gcd_character_name_detail AS name_detail
        WHERE name_detail.character_id IN (SELECT id FROM main.gcd_character)
          AND name_detail.deleted = 0
    """)
