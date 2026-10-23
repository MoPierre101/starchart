import sqlite3

from strip_dump.strip_dump_helpers import copy_rows


def strip_credits(connection: sqlite3.Connection) -> None:
    strip_story_credits(connection)
    strip_issue_credits(connection)
    strip_creators(connection)
    strip_creator_name_details(connection)
    strip_creator_dates(connection)


def strip_story_credits(connection: sqlite3.Connection) -> None:
    """Credits that point at a creator missing from the dump are dropped."""
    copy_rows(connection, "gcd_story_credit", """
        SELECT story_credit.*
        FROM source.gcd_story_credit AS story_credit
        WHERE story_credit.story_id IN (SELECT id FROM main.gcd_story)
          AND story_credit.deleted = 0
          AND story_credit.creator_id IN (SELECT id FROM source.gcd_creator WHERE deleted = 0)
    """)


def strip_issue_credits(connection: sqlite3.Connection) -> None:
    """A variant issue keeps only the credits its regular issue does not already have.

    The first line of the OR keeps every credit of a regular issue, because a NULL variant_of_id
    would make the NOT IN comparison NULL and drop the row.
    """
    copy_rows(connection, "gcd_issue_credit", """
        SELECT issue_credit.*
        FROM source.gcd_issue_credit AS issue_credit
        JOIN main.gcd_issue AS issue ON issue.id = issue_credit.issue_id
        WHERE issue_credit.deleted = 0
          AND issue_credit.creator_id IN (SELECT id FROM source.gcd_creator WHERE deleted = 0)
          AND (
              issue.variant_of_id IS NULL
              OR (issue.variant_of_id, issue_credit.creator_id) NOT IN (
                  SELECT issue_id, creator_id FROM source.gcd_issue_credit WHERE deleted = 0
              )
          )
    """)


def strip_creators(connection: sqlite3.Connection) -> None:
    copy_rows(connection, "gcd_creator", """
        SELECT creator.*
        FROM source.gcd_creator AS creator
        WHERE creator.deleted = 0
          AND creator.id IN (
              SELECT creator_id FROM main.gcd_story_credit
              UNION
              SELECT creator_id FROM main.gcd_issue_credit
          )
    """)


def strip_creator_name_details(connection: sqlite3.Connection) -> None:
    copy_rows(connection, "gcd_creator_name_detail", """
        SELECT name_detail.*
        FROM source.gcd_creator_name_detail AS name_detail
        WHERE name_detail.creator_id IN (SELECT id FROM main.gcd_creator)
          AND name_detail.deleted = 0
    """)


def strip_creator_dates(connection: sqlite3.Connection) -> None:
    """Only the date rows that a kept creator's birth or death points at. The cleaning step copies them onto the creator."""
    copy_rows(connection, "stddata_date", """
        SELECT creator_date.*
        FROM source.stddata_date AS creator_date
        WHERE creator_date.id IN (
            SELECT birth_date_id FROM main.gcd_creator
            UNION
            SELECT death_date_id FROM main.gcd_creator
        )
    """)
