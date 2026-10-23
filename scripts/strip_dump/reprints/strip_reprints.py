import sqlite3

from strip_dump.strip_dump_helpers import copy_rows


def strip_reprints(connection: sqlite3.Connection) -> None:
    """Keep a reprint only when both of its issues are kept.

    A variant counts as its regular issue (COALESCE picks variant_of_id when there is one), so a reprint
    between an issue and its own variant is dropped. Of identical reprint rows only the lowest id stays;
    GROUP BY puts rows with a NULL story id in the same group.
    """
    copy_rows(connection, "gcd_reprint", """
        SELECT reprint.*
        FROM source.gcd_reprint AS reprint
        JOIN main.gcd_issue AS origin_issue ON origin_issue.id = reprint.origin_issue_id
        JOIN main.gcd_issue AS target_issue ON target_issue.id = reprint.target_issue_id
        WHERE COALESCE(origin_issue.variant_of_id, origin_issue.id)
              <> COALESCE(target_issue.variant_of_id, target_issue.id)
          AND reprint.id IN (
              SELECT MIN(id)
              FROM source.gcd_reprint
              GROUP BY origin_id, target_id, origin_issue_id, target_issue_id
          )
    """)
