import sqlite3

from strip_dump.catalog.strip_catalog_constants import KEPT_LANGUAGE_IDS, PUBLISHER_IDS
from strip_dump.catalog.strip_catalog_helpers import build_excluded_format_condition
from strip_dump.strip_dump_helpers import copy_rows, to_sql_list


def strip_catalog(connection: sqlite3.Connection) -> None:
    strip_publishers(connection)
    strip_series(connection)
    strip_issues(connection)
    strip_indicia_publishers(connection)
    strip_series_bonds(connection)


def strip_publishers(connection: sqlite3.Connection) -> None:
    copy_rows(connection, "gcd_publisher", f"""
        SELECT publisher.*
        FROM source.gcd_publisher AS publisher
        WHERE publisher.id IN {to_sql_list(PUBLISHER_IDS)}
          AND publisher.deleted = 0
    """)


def strip_series(connection: sqlite3.Connection) -> None:
    """A series is kept only if it has at least one issue that is not deleted."""
    copy_rows(connection, "gcd_series", f"""
        SELECT series.*
        FROM source.gcd_series AS series
        WHERE series.publisher_id IN (SELECT id FROM main.gcd_publisher)
          AND series.deleted = 0
          AND series.is_comics_publication = 1
          AND series.language_id IN {to_sql_list(KEPT_LANGUAGE_IDS)}
          AND {build_excluded_format_condition()}
          AND series.id IN (SELECT series_id FROM source.gcd_issue WHERE deleted = 0)
    """)


def strip_issues(connection: sqlite3.Connection) -> None:
    """Variant issues are kept too. They stay linked to their regular issue through variant_of_id."""
    copy_rows(connection, "gcd_issue", """
        SELECT issue.*
        FROM source.gcd_issue AS issue
        WHERE issue.series_id IN (SELECT id FROM main.gcd_series)
          AND issue.deleted = 0
    """)


def strip_indicia_publishers(connection: sqlite3.Connection) -> None:
    """Only the indicia publishers that a kept issue points at."""
    copy_rows(connection, "gcd_indicia_publisher", """
        SELECT indicia_publisher.*
        FROM source.gcd_indicia_publisher AS indicia_publisher
        WHERE indicia_publisher.id IN (
            SELECT indicia_publisher_id FROM main.gcd_issue WHERE indicia_publisher_id IS NOT NULL
        )
    """)


def strip_series_bonds(connection: sqlite3.Connection) -> None:
    copy_rows(connection, "gcd_series_bond", """
        SELECT series_bond.*
        FROM source.gcd_series_bond AS series_bond
        WHERE series_bond.origin_id IN (SELECT id FROM main.gcd_series)
          AND series_bond.target_id IN (SELECT id FROM main.gcd_series)
    """)
